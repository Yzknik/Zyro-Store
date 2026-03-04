# Zyro Store Backend 🚀

Full MVC backend for Zyro Store SaaS platform.

## Features
- **Discord OAuth2**: Secure login with user account creation.
- **Admin System**: Whitelist-based access control.
- **Product & Plan Management**: Subscriptions, keys, and lifetime plans.
- **Launcher Integration**: Version control and product validation API.
- **Bot API**: Secure endpoints for Discord Bot interactions (API Key).
- **Security**: JWT, Bcrypt, Helmet, Rate Limiter, CORS.

## Tech Stack
- Node.js & Express
- MySQL (mysql2/promise)
- JWT (jsonwebtoken)
- Axios (Discord API)

## Installation

1. **Move to backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Database**:
   - Create a MySQL database named `zyro_store`.
   - Import the `schema.sql` file into your database.

4. **Configure Environment**:
   - Rename `.env` template or edit it with your credentials:
     - `DB_USER` / `DB_PASS`
     - `DISCORD_CLIENT_ID`
     - `DISCORD_CLIENT_SECRET` (Get these from [Discord Developer Portal](https://discord.com/developers/applications))

5. **Start the server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `GET /api/auth/discord` - Redirects to Discord Login
- `GET /api/auth/discord/callback` - OAuth Callback handled by backend
- `GET /api/auth/me` - Get current user profile (JWT required)

### Admin (Requires JWT + Admin Whitelist)
- `POST /api/admin/products` - Create new product
- `POST /api/admin/plans` - Create subscription plan
- `POST /api/admin/assign` - Assign product to user Discord ID

### Launcher
- `GET /api/launcher/version` - Get latest stable version info
- `POST /api/launcher/validate` - Validate user session and product access

### Bot (Requires x-api-key header)
- `POST /api/bot/activate-plan` - Activate plan for user via bot
- `GET /api/bot/user/:discord_id` - Fetch user products and status
