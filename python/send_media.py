"""Send WhatsApp media with the ZapZap API.

Endpoint: POST /api/v1/{instanceId}/send/media
Body:     {"number", "type", "file", "text"?, "docName"?}
  type:   image | video | audio | ptt | ptv | document | sticker
  file:   a PUBLIC URL (sending by URL supports up to ~190MB for
          image/video/audio, ~500MB for document).
  text:   optional caption (image/video only; ignored by ptv).
  docName: file name shown in chat — required for type=document.

Run: python send_media.py 5511999999999 image https://picsum.photos/600 "Caption"
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

if not (API_KEY and API_SECRET and INSTANCE_ID):
    sys.exit("Missing env vars. Copy .env.example to .env and fill it in.")

number = sys.argv[1] if len(sys.argv) > 1 else "5511999999999"
media_type = sys.argv[2] if len(sys.argv) > 2 else "image"
file_url = sys.argv[3] if len(sys.argv) > 3 else "https://picsum.photos/600"
caption = sys.argv[4] if len(sys.argv) > 4 else ""


def send_media() -> None:
    body = {"number": number, "type": media_type, "file": file_url}
    if caption:
        body["text"] = caption
    if media_type == "document":
        body["docName"] = "document.pdf"  # display name is required for documents

    resp = requests.post(
        f"{BASE_URL}/{INSTANCE_ID}/send/media",
        json=body,
        headers={
            "x-api-key": API_KEY,
            "x-api-secret": API_SECRET,
            "Content-Type": "application/json",
        },
        timeout=60,
    )
    resp.raise_for_status()
    # Response: {"messageId": ..., "status": ...}
    print("Sent:", resp.json())


if __name__ == "__main__":
    send_media()
