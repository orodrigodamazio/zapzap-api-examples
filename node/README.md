# ZapZap API — Node.js examples

Plain Node.js + `axios`, webhook servers with `express`.

## Setup
```bash
cd node
npm install
cp .env.example .env   # then fill in your keys and instance id
```

## Run
```bash
node send-text.js 5511999999999 "Hello!"
node send-media.js 5511999999999 image https://picsum.photos/600 "A caption"
node create-instance.js my-instance      # creates + sets webhook + prints QR
node webhook-receiver.js                 # listens on :3000/webhook
node ai-bot.js                           # webhook -> OpenAI -> reply
```

## Files
| File | What it shows |
|---|---|
| `send-text.js` | `POST /{instanceId}/send/text` |
| `send-media.js` | `POST /{instanceId}/send/media` (image/video/audio/ptt/ptv/document/sticker) |
| `create-instance.js` | `POST /instances` + `PUT /instances/{id}/webhook` + `GET /instances/{id}/qrcode` |
| `webhook-receiver.js` | Express server parsing the `messages` webhook event |
| `ai-bot.js` | Incoming message -> OpenAI -> reply via ZapZap |

Credentials are read from env vars (`.env`). Never hardcode them.
To receive webhooks locally, expose your port with a tunnel (e.g. `ngrok http 3000`) and use that HTTPS URL.
