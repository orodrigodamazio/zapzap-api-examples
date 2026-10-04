// Send a WhatsApp text message with the ZapZap API.
//
// Endpoint: POST /api/v1/{instanceId}/send/text
// Body:     { number, text }
//
// Run: node send-text.js 5511999999999 "Hello from ZapZap!"

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.ZAPZAP_BASE_URL || 'https://api.zapzapapi.com/api/v1';
const API_KEY = process.env.ZAPZAP_API_KEY;
const API_SECRET = process.env.ZAPZAP_API_SECRET;
const INSTANCE_ID = process.env.ZAPZAP_INSTANCE_ID;

// Credentials come from env vars, never hardcode them.
if (!API_KEY || !API_SECRET || !INSTANCE_ID) {
  console.error('Missing env vars. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// Number must include the country code (DDI), e.g. 55 for Brazil.
const number = process.argv[2] || '5511999999999';
const text = process.argv[3] || 'Hello from the ZapZap API 👋';

async function sendText() {
  const { data } = await axios.post(
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

  // Response: { messageId, status }
  console.log('Sent:', data);
}

sendText().catch((err) => {
  console.error('Error:', err.response?.status, err.response?.data || err.message);
  process.exit(1);
});
