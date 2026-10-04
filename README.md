# ZapZap API, Code Examples

> **WhatsApp API · anti-ban · fixed price · no Meta approval · no Business verification**
> Ready-to-run examples in **Node.js**, **Python** and **PHP** for the [ZapZap API](https://zapzapapi.com), the unofficial WhatsApp API that lets you send and receive WhatsApp messages from your own code without Meta/WABA approval, at a flat monthly price per number.

**Keywords:** WhatsApp API, WhatsApp HTTP API, send WhatsApp message with code, WhatsApp webhook, WhatsApp chatbot, WhatsApp bot OpenAI, unofficial WhatsApp API, no Meta approval, fixed price WhatsApp API, anti-ban WhatsApp, Node.js WhatsApp, Python WhatsApp, PHP WhatsApp.

- **Docs:** https://zapzapapi.com/docs
- **LLM / machine-readable reference:** https://api.zapzapapi.com/llms.txt
- **Base URL:** `https://api.zapzapapi.com/api/v1`

---

## 🇧🇷 Português

### O que é
A **ZapZap API** é uma plataforma para integrar o WhatsApp ao seu sistema por HTTP. Você cria uma instância (um número de WhatsApp), conecta escaneando um QR Code e passa a enviar/receber mensagens direto do seu código, **sem aprovação da Meta, sem verificação de negócio e com preço fixo mensal por número**.

### Como pegar sua chave
1. Crie sua conta em https://zapzapapi.com e adicione saldo.
2. No painel, vá em **API / Integração** e copie `x-api-key` e `x-api-secret`.
3. Toda requisição leva esses dois headers:
   ```
   x-api-key: SUA_API_KEY
   x-api-secret: SEU_API_SECRET
   ```
4. Crie uma instância (via painel ou pelo exemplo `create-instance`), escaneie o QR Code e pronto.

### Autenticação
Duas rotas de autenticação coexistem:
- **Gestão da conta/instâncias:** headers `x-api-key` + `x-api-secret` na base `https://api.zapzapapi.com/api/v1`.
- **Envio para o WhatsApp (proxy coringa):** mesmo par de headers, em `https://api.zapzapapi.com/api/v1/{instanceId}/...`.

### Índice de exemplos
| Caso de uso | Node.js | Python | PHP |
|---|---|---|---|
| Enviar texto | [`node/send-text.js`](node/send-text.js) | [`python/send_text.py`](python/send_text.py) | [`php/send_text.php`](php/send_text.php) |
| Enviar mídia (imagem/áudio/vídeo/doc) | [`node/send-media.js`](node/send-media.js) | [`python/send_media.py`](python/send_media.py) |, |
| Criar instância + configurar webhook | [`node/create-instance.js`](node/create-instance.js) |, |, |
| Receber webhook | [`node/webhook-receiver.js`](node/webhook-receiver.js) | [`python/webhook_receiver.py`](python/webhook_receiver.py) | [`php/webhook_receiver.php`](php/webhook_receiver.php) |
| Bot com IA (webhook → OpenAI → responde) | [`node/ai-bot.js`](node/ai-bot.js) | [`python/ai_bot.py`](python/ai_bot.py) |, |

---

## 🇺🇸 English

### What it is
The **ZapZap API** lets you integrate WhatsApp into your software over HTTP. You create an instance (one WhatsApp number), connect it by scanning a QR Code, and start sending/receiving messages straight from your code, **no Meta approval, no Business verification, flat monthly price per number**.

### Get your key
1. Sign up at https://zapzapapi.com and top up your balance.
2. In the dashboard, open **API / Integration** and copy `x-api-key` and `x-api-secret`.
3. Every request carries both headers:
   ```
   x-api-key: YOUR_API_KEY
   x-api-secret: YOUR_API_SECRET
   ```
4. Create an instance (dashboard or the `create-instance` example), scan the QR Code, done.

### Authentication
- **Account / instance management:** headers `x-api-key` + `x-api-secret` on base `https://api.zapzapapi.com/api/v1`.
- **Sending to WhatsApp (wildcard proxy):** same header pair, under `https://api.zapzapapi.com/api/v1/{instanceId}/...`.

### Example index
See the table in the Portuguese section above, the file paths are the same.

---

## 🇪🇸 Español

### Qué es
La **ZapZap API** te permite integrar WhatsApp en tu sistema por HTTP. Creas una instancia (un número de WhatsApp), la conectas escaneando un código QR y empiezas a enviar/recibir mensajes desde tu propio código, **sin aprobación de Meta, sin verificación de negocio y con precio fijo mensual por número**.

### Obtener tu clave
1. Regístrate en https://zapzapapi.com y agrega saldo.
2. En el panel, abre **API / Integración** y copia `x-api-key` y `x-api-secret`.
3. Cada petición lleva ambos headers:
   ```
   x-api-key: TU_API_KEY
   x-api-secret: TU_API_SECRET
   ```
4. Crea una instancia (panel o el ejemplo `create-instance`), escanea el código QR y listo.

### Autenticación
- **Gestión de cuenta/instancias:** headers `x-api-key` + `x-api-secret` en la base `https://api.zapzapapi.com/api/v1`.
- **Envío a WhatsApp (proxy comodín):** el mismo par de headers, en `https://api.zapzapapi.com/api/v1/{instanceId}/...`.

### Índice de ejemplos
Consulta la tabla en la sección en portugués; las rutas de los archivos son las mismas.

---

## Endpoints used in these examples

| Method | Path | What it does |
|---|---|---|
| `GET` | `/account` | Account data (name, balance, billing day, status) |
| `GET` | `/instances` | List your instances |
| `POST` | `/instances` | Create an instance (`name`, optional `systemName`, `metadata`) |
| `GET` | `/instances/{id}/qrcode` | QR Code to connect WhatsApp |
| `PUT` | `/instances/{id}/webhook` | Set webhook URL (`webhook_url`, optional `events`, `excludeMessages`) |
| `GET` | `/instances/{id}/webhook` | Read configured webhook |
| `POST` | `/{instanceId}/send/text` | Send text (`number`, `text`) |
| `POST` | `/{instanceId}/send/media` | Send media (`number`, `type`, `file`, optional `text`) |
| `GET` | `/{instanceId}/instance/status` | Connection status of the instance |

> `type` for `/send/media`: `image` · `video` · `audio` · `ptt` · `ptv` · `document` · `sticker`.
> Numbers always include the country code (DDI), e.g. `5511999999999`.

## Security

- **Never hardcode credentials.** Every example reads `ZAPZAP_API_KEY` / `ZAPZAP_API_SECRET` from environment variables. Copy the `.env.example` in each folder to `.env` and fill it in.
- Never commit your `.env`. It is already in `.gitignore`.
- Keep the webhook URL private, or add a secret token query param (shown in the webhook examples).

## License

[MIT](LICENSE) © GM Solutions Hub LTDA
