"""A minimal WhatsApp AI bot with Flask:
   incoming message (webhook) -> OpenAI -> reply via ZapZap API.

Flow:
  1. ZapZap POSTs the "messages" event to /webhook.
  2. We extract the text + sender and ask OpenAI for a reply.
  3. We send the reply with POST /api/v1/{instanceId}/send/text.

Run: python ai_bot.py   (listens on PORT, default 3000)
Requires OPENAI_API_KEY in .env.
"""
import os
import threading

import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify

load_dotenv()

BASE_URL = os.getenv("ZAPZAP_BASE_URL", "https://api.zapzapapi.com/api/v1")
API_KEY = os.getenv("ZAPZAP_API_KEY")
API_SECRET = os.getenv("ZAPZAP_API_SECRET")
INSTANCE_ID = os.getenv("ZAPZAP_INSTANCE_ID")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")
PORT = int(os.getenv("PORT", "3000"))

if not (API_KEY and API_SECRET and INSTANCE_ID and OPENAI_API_KEY):
    raise SystemExit("Missing env vars. Copy .env.example to .env and fill it in.")

app = Flask(__name__)


def send_text(number: str, text: str) -> None:
    requests.post(
        f"{BASE_URL}/{INSTANCE_ID}/send/text",
        json={"number": number, "text": text},
        headers={
            "x-api-key": API_KEY,
            "x-api-secret": API_SECRET,
            "Content-Type": "application/json",
        },
        timeout=30,
    )


def ask_ai(user_text: str) -> str:
    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a helpful WhatsApp assistant. Keep replies short."},
                {"role": "user", "content": user_text},
            ],
        },
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        timeout=60,
    )
    resp.raise_for_status()
    choices = resp.json().get("choices") or [{}]
    return (choices[0].get("message") or {}).get("content", "").strip() or "Sorry, I had no answer."


def handle_messages(data: dict) -> None:
    for msg in data.get("messages", []):
        key = msg.get("key") or {}
        if key.get("fromMe"):
            continue
        number = (key.get("remoteJid") or "").replace("@s.whatsapp.net", "")
        message = msg.get("message") or {}
        text = (
            message.get("conversation")
            or (message.get("extendedTextMessage") or {}).get("text")
            or ""
        )
        if not number or not text:
            continue
        print(f"In  <{number}>: {text}")
        try:
            reply = ask_ai(text)
            send_text(number, reply)
            print(f"Out <{number}>: {reply}")
        except Exception as err:  # noqa: BLE001
            print("Bot error:", err)


@app.post("/webhook")
def webhook():
    if WEBHOOK_SECRET and request.args.get("token") != WEBHOOK_SECRET:
        return jsonify({"error": "invalid token"}), 401

    payload = request.get_json(silent=True) or {}
    if payload.get("event") == "messages":
        # Process in the background so we can answer 200 immediately.
        threading.Thread(target=handle_messages, args=(payload.get("data") or {},)).start()

    return jsonify({"ok": True})


@app.get("/health")
def health():
    return "ok"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
