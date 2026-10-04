// Receive ZapZap webhooks with Express and parse incoming WhatsApp messages.
//
// Configure your instance webhook to point here (see create-instance.js):
//   PUT /api/v1/instances/{id}/webhook  { webhook_url: "https://you.com/webhook?token=..." }
//
// Webhook payload shape (POST, JSON):
//   {
//     instance_id, instance_name, metadata,
//     event: "messages" | "connection" | "messages_update" | "contacts" | "presence" | "groups" | "chats",
//     data: { messages: [ { key, message, messageTimestamp, pushName } ] }
//   }
//
// Run: node webhook-receiver.js   (listens on PORT, default 3000)

require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json({ limit: '5mb' }));

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.post('/webhook', (req, res) => {
  // Optional: verify the shared secret you appended to the webhook URL.
  if (WEBHOOK_SECRET && req.query.token !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'invalid token' });
  }

  // IMPORTANT: answer 200 immediately. ZapZap disables webhooks that keep
  // failing, so never block the response on slow work.
  res.json({ ok: true });

  const { instance_id, instance_name, metadata, event, data } = req.body || {};
  console.log(`[${event}] instance=${instance_name || instance_id}`, metadata || '');

  try {
    if (event === 'messages') {
      for (const msg of data?.messages || []) {
        // Skip messages your own number sent.
        if (msg.key?.fromMe) continue;

        const phone = (msg.key?.remoteJid || '').replace('@s.whatsapp.net', '');
        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          '';
        const contactName = msg.pushName || '';

        console.log(`  from ${contactName} <${phone}>: ${text}`);
        // ...do your thing: store it, notify, trigger a bot (see ai-bot.js).
      }
    } else if (event === 'connection') {
      const connected =
        data?.status === 'connected' ||
        data?.state === 'open' ||
        data?.connection === 'open';
      console.log('  connection:', connected ? 'connected' : 'disconnected');
    }
  } catch (err) {
    // Already answered 200, just log and move on.
    console.error('Webhook processing error:', err);
  }
});

app.get('/health', (_req, res) => res.send('ok'));

app.listen(PORT, () => console.log(`Webhook receiver listening on :${PORT}/webhook`));
