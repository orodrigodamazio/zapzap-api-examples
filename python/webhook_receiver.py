"""Receive ZapZap webhooks with Flask and parse incoming WhatsApp messages.

Point your instance webhook here:
  PUT /api/v1/instances/{id}/webhook  {"webhook_url": "https://you.com/webhook?token=..."}

Webhook payload shape (POST, JSON):
  {
    "instance_id", "instance_name", "metadata",
    "event": "messages" | "connection" | "messages_update" | ...,
    "data": {"messages": [{"key", "message", "messageTimestamp", "pushName"}]}
  }

Run: python webhook_receiver.py   (listens on PORT, default 3000)
"""
import os

from dotenv import load_dotenv
from flask import Flask, request, jsonify

load_dotenv()

PORT = int(os.getenv("PORT", "3000"))
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")

app = Flask(__name__)


@app.post("/webhook")
def webhook():
    # Optional: verify the shared secret you appended to the webhook URL.
    if WEBHOOK_SECRET and request.args.get("token") != WEBHOOK_SECRET:
        return jsonify({"error": "invalid token"}), 401

    payload = request.get_json(silent=True) or {}
    event = payload.get("event")
    data = payload.get("data") or {}
    print(f"[{event}] instance={payload.get('instance_name') or payload.get('instance_id')}")

    if event == "messages":
        for msg in data.get("messages", []):
            key = msg.get("key") or {}
            # Skip messages your own number sent.
            if key.get("fromMe"):
                continue
            phone = (key.get("remoteJid") or "").replace("@s.whatsapp.net", "")
            message = msg.get("message") or {}
            text = (
                message.get("conversation")
                or (message.get("extendedTextMessage") or {}).get("text")
                or ""
            )
            name = msg.get("pushName") or ""
            print(f"  from {name} <{phone}>: {text}")
            # ...store it, notify, trigger a bot (see ai_bot.py).
    elif event == "connection":
        connected = (
            data.get("status") == "connected"
            or data.get("state") == "open"
            or data.get("connection") == "open"
        )
        print("  connection:", "connected" if connected else "disconnected")

    # Answer 200 fast — ZapZap disables webhooks that keep failing.
    return jsonify({"ok": True})


@app.get("/health")
def health():
    return "ok"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
