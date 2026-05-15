# Zyro Store API Documentation

Base URL: `https://zyroapi.shardweb.app/api`

---

## 🔐 Authentication

### Middleware Types

| Middleware | Description |
|-----------|-------------|
| `verifyToken` | JWT token verification (user endpoints) |
| `verifyAdmin` | Admin role verification |
| `verifyReseller` | Reseller role verification |
| `verifyBotToken` | Bot token verification |

---

## 🚀 Launcher Endpoints

### `POST /launcher/validate`

Autentica o usuário no launcher e valida licenças.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "string",
  "password": "string",
  "hwid": "string",
  "product_name": "string (optional)",
  "integrity_hash": "string (optional)"
}
```

**Response (Success):**
```json
{
  "authorized": "true",
  "message": "Acesso concedido!",
  "broadcast": "string",
  "username": "string",
  "discord_id": "string",
  "avatar_url": "string",
  "role": "Owner | User",
  "games": "string (summary)",
  "products": [
    {
      "id": 1,
      "name": "FIVEM EXTERNAL",
      "version": "1.0.0",
      "payload_id": 1,
      "download_url": "string",
      "has_cloud_bin": true,
      "changelog": "string",
      "plan": "LIFETIME",
      "expiry": "Never",
      "key": "LICENSE-KEY",
      "status": "UNDETECTED"
    }
  ],
  "session_token": "hex-string"
}
```

**Response (Error):**
```json
{
  "authorized": "false",
  "message": "string"
}
```

---

### `GET /launcher/version`

Retorna a versão atual do launcher.

**Response:**
```json
{
  "version": "1.0.0",
  "download_url": "http://...",
  "changelog": "string"
}
```

---

### `GET /launcher/check-update`

Mesmo que `/launcher/version`.

---

### `GET /launcher/download-main`

Faz download do launcher principal.

**Headers:**
```
Authorization: Bearer <token>
```

---

### `GET /launcher/payload/:id`

Faz download do payload/binário do produto.

**Parameters:**
- `id` - ID do payload

**Headers:**
```
Authorization: Bearer <token>
```

---

### `POST /launcher/heartbeat`

Envia heartbeat para manter sessão ativa.

**Body:**
```json
{
  "username": "string",
  "session_token": "string"
}
```

**Response:**
```json
{
  "status": "alive"
}
```

---

### `POST /launcher/integrity`

Verifica integridade do launcher.

**Body:**
```json
{
  "hash": "string"
}
```

**Response:**
```json
{
  "secure": true
}
```
ou
```json
{
  "secure": false,
  "message": "Nova versão disponível ou arquivo modificado."
}
```

---

## 🔑 Auth Endpoints

### `POST /auth/login`

Login com credenciais do Discord.

**Body:**
```json
{
  "code": "string (OAuth code)"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "discord_id": "string",
    "username": "string",
    "avatar": "string",
    "role": "user | reseller | admin"
  }
}
```

---

### `GET /auth/discord`

Redirect para OAuth do Discord.

---

### `GET /auth/discord/callback`

Callback do OAuth do Discord.

---

### `GET /auth/me`

Retorna dados do usuário logado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "discord_id": "string",
  "username": "string",
  "avatar": "string",
  "role": "user",
  "reseller_balance": 0,
  "last_login": "datetime"
}
```

---

### `POST /auth/finalize`

Finaliza conta após OAuth (define senha).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "password": "string"
}
```

---

### `POST /auth/reset-hwid`

Reseta HWID de uma licença.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "license_key": "string"
}
```

---

### `GET /auth/history`

Retorna histórico de login.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "ip_address": "string",
    "hwid": "string",
    "created_at": "datetime"
  }
]
```

---

### `GET /auth/configs/:product_id`

Retorna configurações do usuário para um produto.

**Headers:**
```
Authorization: Bearer <token>
```

---

### `POST /auth/config/save`

Salva configuração do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "product_id": 1,
  "config_name": "string",
  "config_json": "string"
}
```

---

## 👑 Admin Endpoints

### `GET /admin/info`

Retorna informações públicas.

---

### `GET /admin/stats`

Retorna estatísticas do sistema.

**Headers:**
```
Authorization: Bearer <token (admin)
```

**Response:**
```json
{
  "total_users": 100,
  "active_licenses": 50,
  "total_sales": 1000,
  "revenue": 5000,
  "resellers": 5
}
```

---

### `GET /admin/users`

Lista todos os usuários.

**Headers:**
```
Authorization: Bearer <token (admin)
```

---

### `PATCH /admin/users/:id/role`

Atualiza role do usuário.

**Headers:**
```
Authorization: Bearer <token (admin)
```

**Body:**
```json
{
  "role": "user | reseller | admin"
}
```

---

### `POST /admin/assign`

Atribui produto ao usuário.

**Headers:**
```
Authorization: Bearer <token (admin)
```

**Body:**
```json
{
  "user_id": 1,
  "product_id": 1,
  "plan_id": 1,
  "duration_days": 30
}
```

---

### `GET /admin/licenses`

Lista todas as licenças.

**Headers:**
```
Authorization: Bearer <token (admin)
```

---

### `GET /admin/categories`

Lista categorias.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

---

### `POST /admin/categories`

Cria categoria.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

**Body:**
```json
{
  "name": "string"
}
```

---

### `POST /admin/products`

Cria produto.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

**Body:**
```json
{
  "name": "string",
  "description": "string",
  "category_id": 1
}
```

---

### `POST /admin/plans`

Cria plano.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

**Body:**
```json
{
  "product_id": 1,
  "name": "DAILY | WEEKLY | MONTHLY | LIFETIME",
  "duration_days": 30,
  "price": 10.00
}
```

---

### `GET /admin/settings`

Busca configurações.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

---

### `POST /admin/settings`

Atualiza configuração.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

**Body:**
```json
{
  "key": "string",
  "value": "string"
}
```

---

### `GET /admin/versions`

Lista versões do launcher.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

---

### `POST /admin/versions`

Faz upload de nova versão.

**Headers:**
```
Authorization: Bearer <token (admin)>
Content-Type: multipart/form-data
```

**Form Data:**
- `binary`: arquivo
- `product_id`: number
- `version`: string
- `is_stable`: boolean

---

### `GET /admin/logs`

Retorna logs do sistema.

**Headers:**
```
Authorization: Bearer <token (admin)>
```

---

## 💳 Payment Endpoints

### `POST /payment/create`

Cria pagamento.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "plan_id": 1
}
```

**Response:**
```json
{
  "transaction_id": "string",
  "pix_copia_e_cola": "string",
  "qrcode_base64": "string",
  "amount": 10.00,
  "expires_at": "datetime"
}
```

---

### `GET /payment/status/:transaction_id`

Verifica status do pagamento.

**Headers:**
```
Authorization: Bearer <token>
```

---

### `POST /payment/webhook`

Webhook do gateway de pagamento (sem auth).

---

### `POST /payment/withdraw`

Solicita saque (resellers).

**Headers:**
```
Authorization: Bearer <token (reseller)>
```

**Body:**
```json
{
  "amount": 100.00,
  "pix_key": "string"
}
```

---

## 🎫 Ticket Endpoints

### `POST /tickets/create`

Cria ticket de suporte.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "subject": "string",
  "message": "string"
}
```

---

### `GET /tickets/my`

Lista meus tickets.

**Headers:**
```
Authorization: Bearer <token>
```

---

### `GET /tickets/:id`

Detalhes do ticket.

**Headers:**
```
Authorization: Bearer <token>
```

---

### `POST /tickets/:id/reply`

Responde ticket.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "message": "string"
}
```

---

### `POST /tickets/:id/close`

Fecha ticket.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 🤖 Bot Endpoints

### `POST /bot/activate-plan`

Ativa plano via bot.

**Headers:**
```
Authorization: Bot <bot_token>
```

**Body:**
```json
{
  "discord_id": "string",
  "plan_id": 1,
  "duration_days": 30
}
```

---

### `GET /bot/user/:discord_id`

Busca dados do usuário.

**Headers:**
```
Authorization: Bot <bot_token>
```

---

## 📦 Product Endpoints (Público)

### `GET /products`

Lista produtos disponíveis.

**Response:**
```json
[
  {
    "id": 1,
    "name": "FIVEM EXTERNAL",
    "description": "string",
    "image_url": "string",
    "status": "UNDETECTED"
  }
]
```

---

### `GET /products/:id/plans`

Lista planos de um produto.

---

## 🔄 Reseller Endpoints

### `GET /reseller/stats`

Estatísticas do reseller.

**Headers:**
```
Authorization: Bearer <token (reseller)>
```

---

### `POST /reseller/buy`

Compra chave para revenda.

**Headers:**
```
Authorization: Bearer <token (reseller)>
```

**Body:**
```json
{
  "plan_id": 1
}
```

---

## ⚠️ Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Parâmetros inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |

---

## 🔒 Security Features

- **Rate Limiting**: 30 req/15min em endpoints de auth
- **Helmet**: Headers de segurança
- **CORS**: Origin configurável
- **bcrypt**: Senhas hasheadas
- **JWT**: Tokens seguros
- **HWID Lock**: Bloqueio por máquina