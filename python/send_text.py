"""Send a WhatsApp text message with the ZapZap API.

Endpoint: POST /api/v1/{instanceId}/send/text
Body:     {"number": ..., "text": ...}

Run: python send_text.py 5511999999999 "Hello from ZapZap!"
"""
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("ZAPZAP_BASE_URL", "https://api.zapzapapi.com/api/v1")
API_KEY = os.getenv("ZAPZAP_API_KEY")
API_SECRET = os.getenv("ZAPZAP_API_SECRET")
INSTANCE_ID = os.getenv("ZAPZAP_INSTANCE_ID")

# Credentials come from env vars, never hardcode them.
if not (API_KEY and API_SECRET and INSTANCE_ID):
    sys.exit("Missing env vars. Copy .env.example to .env and fill it in.")

# Number must include the country code (DDI), e.g. 55 for Brazil.
number = sys.argv[1] if len(sys.argv) > 1 else "5511999999999"
text = sys.argv[2] if len(sys.argv) > 2 else "Hello from the ZapZap API 👋"


def send_text() -> None:
    resp = requests.post(
        f"{BASE_URL}/{INSTANCE_ID}/send/text",
        json={"number": number, "text": text},
        headers={
            "x-api-key": API_KEY,
            "x-api-secret": API_SECRET,
            "Content-Type": "application/json",
        },
        timeout=30,
    )
    resp.raise_for_status()
    # Response: {"messageId": ..., "status": ...}
    print("Sent:", resp.json())


if __name__ == "__main__":
    send_text()
