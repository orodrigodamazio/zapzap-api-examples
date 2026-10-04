# ZapZap API — Python examples

`requests` for calls, `flask` for the webhook servers.

## Setup
```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in your keys and instance id
```

## Run
```bash
python send_text.py 5511999999999 "Hello!"
python send_media.py 5511999999999 image https://picsum.photos/600 "A caption"
python webhook_receiver.py            # listens on :3000/webhook
python ai_bot.py                      # webhook -> OpenAI -> reply
```

## Files
| File | What it shows |
|---|---|
| `send_text.py` | `POST /{instanceId}/send/text` |
| `send_media.py` | `POST /{instanceId}/send/media` |
| `webhook_receiver.py` | Flask server parsing the `messages` webhook event |
| `ai_bot.py` | Incoming message -> OpenAI -> reply via ZapZap |

Credentials are read from env vars (`.env`). Never hardcode them.
To receive webhooks locally, expose your port with a tunnel (e.g. `ngrok http 3000`) and use that HTTPS URL.
