# 🛡️ Zyro Store - Backend Production Guide

Este documento contém as instruções vitais para migrar o backend da **Zyro Store** do ambiente de desenvolvimento (Localhost) para o seu servidor (VPS/Host).

## 📁 Estrutura de Pastas Sugerida
Para rodar na host, você precisa garantir que estas pastas existam e tenham permissão de escrita:
- `backend/data/`: Onde o banco de dados `zyro.db` será criado.
- `backend/src/uploads/binaries/`: Onde os arquivos do launcher (.exe) que você subir pelo painel admin ficarão guardados.

---

## 🔑 Configuração do Arquivo `.env` (CRÍTICO)
No servidor, você **DEVE** alterar as seguintes variáveis para que o site e o sistema de pagamentos funcionem:

```bash
# URL de onde o backend está rodando (ex: https://api.zyro.gg)
BASE_URL=https://sua-api.com

# URL de onde o frontend está rodando (para evitar erro de CORS)
FRONTEND_URL=https://zyro.gg

# Chave de segurança para os Webhooks (Promisse Pay)
# Crie uma senha forte e única aqui.
WEBHOOK_SECRET=UMA_SENHA_MUITO_FORTE_AQUI_123

# NODE_ENV deve ser 'production' para ativar segurança máxima (HTTPS only)
NODE_ENV=production

# Suas chaves do Discord (Obtenha no Discord Developer Portal)
DISCORD_CLIENT_ID=SEU_ID
DISCORD_CLIENT_SECRET=SEU_SECRET
DISCORD_REDIRECT_URI=https://sua-api.com/api/auth/callback

# Token do Bot Discord (Para cargos e logs)
BOT_API_KEY=SEU_TOKEN_DO_BOT

# Gateway de Pagamentos
PROMISSE_SECRET_KEY=Sua_Key_Live_Aqui
```

---

## 🚀 Comandos para Iniciar na Host
Recomendamos o uso do **PM2** para manter o servidor online 24/7.

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Compile o código TypeScript (se necessário):**
   ```bash
   npm run build
   ```

3. **Inicie com PM2:**
   ```bash
   pm2 start dist/server.js --name zyro-backend
   ```

---

## 🛡️ Veredito de Segurança Final
O sistema foi blindado contra os ataques mais comuns:

| Proteção | Status | Descrição |
| :--- | :---: | :--- |
| **SQL Injection** | ✅ | Todas as queries usam Prepared Statements (SQLite3). |
| **Fraude de Webhook** | ✅ | Exige o `WEBHOOK_SECRET` para confirmar pagamentos. |
| **Brute-Force** | ✅ | Stricter Rate Limiting em rotas de Login e Admin. |
| **HWID Spoofer** | ✅ | Verificação rígida e reset com cooldown de 7 dias via site. |
| **CORS / XSS** | ✅ | Headers de segurança Helmet e cookies SameSite ativados. |

---

## ✅ Checklist de Lançamento
1. [ ] Certifique-se de que o **SSL (HTTPS)** está ativo no domínio da API.
2. [ ] Verifique se o `WEBHOOK_SECRET` no `.env` é o mesmo que você configurou no painel da Promisse Pay (se houver campo lá, ou apenas use o que o sistema gera na URL).
3. [ ] Teste um pagamento de R$ 1,00 para garantir que a licença é entregue automaticamente.
4. [ ] Verifique se o Launcher consegue baixar o payload da nova URL da Host.

**Lembre-se:** Nunca compartilhe seu arquivo `.env` com ninguém. Ele contém as chaves que controlam o seu dinheiro e o acesso à sua base de usuários.
