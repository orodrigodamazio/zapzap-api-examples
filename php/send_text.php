<?php
/**
 * Send a WhatsApp text message with the ZapZap API (plain cURL, no deps).
 *
 * Endpoint: POST /api/v1/{instanceId}/send/text
 * Body:     {"number": ..., "text": ...}
 *
 * Run (CLI): php send_text.php 5511999999999 "Hello from ZapZap!"
 */

// Credentials come from env vars, never hardcode them.
$baseUrl    = getenv('ZAPZAP_BASE_URL') ?: 'https://api.zapzapapi.com/api/v1';
$apiKey     = getenv('ZAPZAP_API_KEY');
$apiSecret  = getenv('ZAPZAP_API_SECRET');
$instanceId = getenv('ZAPZAP_INSTANCE_ID');

if (!$apiKey || !$apiSecret || !$instanceId) {
    fwrite(STDERR, "Missing env vars (ZAPZAP_API_KEY, ZAPZAP_API_SECRET, ZAPZAP_INSTANCE_ID).\n");
    exit(1);
}

// Number must include the country code (DDI), e.g. 55 for Brazil.
$number = $argv[1] ?? '5511999999999';
$text   = $argv[2] ?? 'Hello from the ZapZap API 👋';

$payload = json_encode(['number' => $number, 'text' => $text]);

$ch = curl_init("$baseUrl/$instanceId/send/text");
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        "x-api-key: $apiKey",
        "x-api-secret: $apiSecret",
        'Content-Type: application/json',
    ],
]);

$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    fwrite(STDERR, 'cURL error: ' . curl_error($ch) . "\n");
    curl_close($ch);
    exit(1);
}
curl_close($ch);

// Response: {"messageId": ..., "status": ...}
echo "HTTP $status\n$response\n";
