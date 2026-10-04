// Send WhatsApp media (image, video, audio, voice note, document, sticker).
//
// Endpoint: POST /api/v1/{instanceId}/send/media
// Body:     { number, type, file, text?, docName? }
//   type:   image | video | audio | ptt | ptv | document | sticker
//   file:   a PUBLIC URL to the file (sending by URL supports up to ~190MB
//           for image/video/audio, ~500MB for document).
//   text:   optional caption (image/video only; ignored by ptv).
//   docName: file name shown in the chat, required for type=document.
//
// Run: node send-media.js 5511999999999 image https://picsum.photos/600 "Check this out"

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.ZAPZAP_BASE_URL || 'https://api.zapzapapi.com/api/v1';
const API_KEY = process.env.ZAPZAP_API_KEY;
const API_SECRET = process.env.ZAPZAP_API_SECRET;
const INSTANCE_ID = process.env.ZAPZAP_INSTANCE_ID;

if (!API_KEY || !API_SECRET || !INSTANCE_ID) {
  console.error('Missing env vars. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const number = process.argv[2] || '5511999999999';
const type = process.argv[3] || 'image';
const file = process.argv[4] || 'https://picsum.photos/600';
const caption = process.argv[5] || '';

async function sendMedia() {
  const body = { number, type, file };
  if (caption) body.text = caption;
  // For documents, a display name is required:
  if (type === 'document') body.docName = 'document.pdf';

  const { data } = await axios.post(
    `${BASE_URL}/${INSTANCE_ID}/send/media`,
    body,
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

sendMedia().catch((err) => {
  console.error('Error:', err.response?.status, err.response?.data || err.message);
  process.exit(1);
});
