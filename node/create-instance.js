// Create a WhatsApp instance, point its webhook at your server, and print the
// QR Code payload so you can connect the number.
//
// Endpoints (management API — base URL, header auth):
//   POST /api/v1/instances                 -> create instance
//   PUT  /api/v1/instances/{id}/webhook    -> set webhook URL
//   GET  /api/v1/instances/{id}/qrcode     -> fetch QR Code to scan
//
// Creating an instance debits your balance (activation fee + prorate).
//
// Run: node create-instance.js my-instance

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.ZAPZAP_BASE_URL || 'https://api.zapzapapi.com/api/v1';
const API_KEY = process.env.ZAPZAP_API_KEY;
const API_SECRET = process.env.ZAPZAP_API_SECRET;
const WEBHOOK_URL = process.env.PUBLIC_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('Missing env vars. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// Instance name: letters, numbers, "_" and "-" only.
const name = process.argv[2] || 'my-instance';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'x-api-secret': API_SECRET,
    'Content-Type': 'application/json',
  },
});

async function main() {
  // 1) Create the instance. `metadata` is free-form JSON echoed back in every
  //    webhook — use it to tie the instance to your own system (clientId, plan...).
  const createRes = await api.post('/instances', {
    name,
    systemName: 'My App',
    metadata: { clientId: '123', plan: 'pro' },
  });
  const instance = createRes.data.instance;
  console.log('Instance created:', instance);
  console.log('Billing charged:', createRes.data.billing);

  // 2) Point the webhook at your public HTTPS URL. Appending a secret token
  //    lets your receiver verify that events really came from ZapZap.
  if (WEBHOOK_URL) {
    const url = WEBHOOK_SECRET
      ? `${WEBHOOK_URL}?token=${WEBHOOK_SECRET}`
      : WEBHOOK_URL;
    const hookRes = await api.put(`/instances/${instance.id}/webhook`, {
      webhook_url: url,
      // events: 'messages,connection', // optional — empty means all events
      excludeMessages: 'true', // skip your own outgoing messages (fromMe)
    });
    console.log('Webhook set:', hookRes.data);
  }

  // 3) Fetch the QR Code so the user can scan it with WhatsApp > Linked devices.
  const qrRes = await api.get(`/instances/${instance.id}/qrcode`);
  if (qrRes.data.connected) {
    console.log('Already connected:', qrRes.data.instance);
  } else {
    console.log('Scan this QR Code to connect:');
    console.log(JSON.stringify(qrRes.data, null, 2));
  }

  console.log(`\nSave this instance id for sending: ${instance.id}`);
}

main().catch((err) => {
  console.error('Error:', err.response?.status, err.response?.data || err.message);
  process.exit(1);
});
