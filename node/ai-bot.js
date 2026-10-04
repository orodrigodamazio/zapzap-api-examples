// A minimal WhatsApp AI bot:
//   incoming message (webhook) -> OpenAI -> reply via ZapZap API.
//
// Flow:
//   1. ZapZap POSTs the "messages" event to /webhook.
//   2. We extract the text + sender, ask OpenAI for a reply.
//   3. We send the reply back with POST /api/v1/{instanceId}/send/text.
//
// Run: node ai-bot.js   (listens on PORT, default 3000)
// Requires OPENAI_API_KEY in .env.

require('dotenv').config();
const express = require('express');
const axios = require('axios');

const BASE_URL = process.env.ZAPZAP_BASE_URL || 'https://api.zapzapapi.com/api/v1';
const API_KEY = process.env.ZAPZAP_API_KEY;
const API_SECRET = process.env.ZAPZAP_API_SECRET;
const INSTANCE_ID = process.env.ZAPZAP_INSTANCE_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const PORT = process.env.PORT || 3000;

if (!API_KEY || !API_SECRET || !INSTANCE_ID || !OPENAI_API_KEY) {
  console.error('Missing env vars. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '5mb' }));

// Send a text reply through ZapZap.
async function sendText(number, text) {
  await axios.post(
    `${BASE_URL}/${INSTANCE_ID}/send/text`,
    { number, text },
    {
      headers: {
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Ask OpenAI for a reply.
async function askAI(userText) {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful WhatsApp assistant. Keep replies short.' },
        { role: 'user', content: userText },
      ],
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I had no answer.';
}

app.post('/webhook', (req, res) => {
  if (WEBHOOK_SECRET && req.query.token !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'invalid token' });
  }

  // Answer immediately, then process in the background.
  res.json({ ok: true });

  (async () => {
    try {
      const { event, data } = req.body || {};
      if (event !== 'messages') return;

      for (const msg of data?.messages || []) {
        if (msg.key?.fromMe) continue; // ignore our own messages

        const number = (msg.key?.remoteJid || '').replace('@s.whatsapp.net', '');
        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          '';
        if (!number || !text) continue;

        console.log(`In  <${number}>: ${text}`);
        const reply = await askAI(text);
        await sendText(number, reply);
        console.log(`Out <${number}>: ${reply}`);
      }
    } catch (err) {
      console.error('Bot error:', err.response?.data || err.message);
    }
  })();
});

app.get('/health', (_req, res) => res.send('ok'));

app.listen(PORT, () => console.log(`AI bot listening on :${PORT}/webhook`));
