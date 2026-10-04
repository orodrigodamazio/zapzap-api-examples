<?php
/**
 * Receive ZapZap webhooks in plain PHP and parse incoming WhatsApp messages.
 *
 * Point your instance webhook here:
 *   PUT /api/v1/instances/{id}/webhook
 *   {"webhook_url": "https://you.com/webhook_receiver.php?token=..."}
 *
 * Webhook payload (POST, JSON):
 *   {
 *     "instance_id", "instance_name", "metadata",
 *     "event": "messages" | "connection" | "messages_update" | ...,
 *     "data": {"messages": [{"key", "message", "messageTimestamp", "pushName"}]}
 *   }
 *
 * Serve (dev): php -S 0.0.0.0:3000 webhook_receiver.php
 */

// Optional: verify the shared secret you appended to the webhook URL.
$webhookSecret = getenv('WEBHOOK_SECRET');
if ($webhookSecret && (($_GET['token'] ?? '') !== $webhookSecret)) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid token']);
    exit;
}

// Answer 200 fast, ZapZap disables webhooks that keep failing.
http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['ok' => true]);

// Flush the response so processing below does not delay the 200.
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}

$raw     = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: [];

$event = $payload['event'] ?? null;
$data  = $payload['data'] ?? [];

error_log('[ZapZap] event=' . $event . ' instance=' . ($payload['instance_name'] ?? $payload['instance_id'] ?? ''));

if ($event === 'messages') {
    foreach ($data['messages'] ?? [] as $msg) {
        $key = $msg['key'] ?? [];
        // Skip messages your own number sent.
        if (!empty($key['fromMe'])) {
            continue;
        }
        $phone = str_replace('@s.whatsapp.net', '', $key['remoteJid'] ?? '');
        $message = $msg['message'] ?? [];
        $text = $message['conversation']
            ?? ($message['extendedTextMessage']['text'] ?? '');
        $name = $msg['pushName'] ?? '';

        error_log("  from $name <$phone>: $text");
        // ...store it, notify, or reply with send_text.php logic.
    }
}
