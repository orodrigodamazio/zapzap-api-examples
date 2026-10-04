# ZapZap API — PHP examples

Plain PHP with cURL, no dependencies.

## Setup
Export the credentials in your environment (see `.env.example`):
```bash
export ZAPZAP_API_KEY=... ZAPZAP_API_SECRET=... ZAPZAP_INSTANCE_ID=...
```

## Run
```bash
php send_text.php 5511999999999 "Hello!"

# Webhook receiver (dev server):
php -S 0.0.0.0:3000 webhook_receiver.php
```

## Files
| File | What it shows |
|---|---|
| `send_text.php` | `POST /{instanceId}/send/text` via cURL |
| `webhook_receiver.php` | Parses the `messages` webhook event; answers 200 first |

Credentials are read with `getenv()`. Never hardcode them.
To receive webhooks locally, expose your port with a tunnel (e.g. `ngrok http 3000`) and use that HTTPS URL.
