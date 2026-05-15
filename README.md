# 🛒 Zyro Store

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.32b-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/license-ISC-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/status-Active-brightgreen?style=flat-square" alt="Status">
</p>

> ⚠️ **Aviso:** Este projeto é para fins educacionais. Use sob sua própria responsabilidade.

---

## 📋 Índice

- [Sobre](#-sobre)
- [Tecnologias](#-tecnologias)
- [Estrutura](#-estrutura)
- [Funcionalidades](#-funcionalidades)
- [Instalação](#-instalação)
- [API Endpoints](#-api-endpoints)
- [Integração C++](#-integração-c)
- [Contato](#-contato)

---

## 📖 Sobre

**Zyro Store** é uma plataforma completa de gerenciamento de licenças e produtos digitais. Inclui sistema de autenticação seguro, painel administrativo, bot do Discord para automação, e integração C++ para loaders externos.

---

## 🛠️ Tecnologias

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos

### Backend
- **Node.js** - Runtime
- **Express** - API Framework
- **MongoDB** - Banco de dados
- **JWT** - Autenticação

### Outros
- **Discord.js** - Bot do Discord
- **WinHTTP** - Integração C++ (Windows)

---

## 📁 Estrutura

```
Zyro-Store/
├── frontend/          # Frontend Next.js
├── backend/           # API Node.js/Express
├── discord-bot/       # Bot Discord
├── shared/            # Código compartilhado
├── DOCS_CPP.md        # Documentação C++
└── package.json       # Configuração
```

---

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- Login seguro com JWT
- Validação por HWID
- Sistema de roles (User/Owner)
- Proteção contra cracks

### 🛒 Gerenciamento de Produtos
- Cadastro de produtos
- Licenças por jogo
- Planos (Mensal/Lifetime)
- Downloads automáticos

### 🎮 Integração C++
- Biblioteca para loaders externos
- Validação via API REST
- Suporte a ImGui
- HWID automático

### 🤖 Bot do Discord
- Comandos interativos
- Sistema de tickets
- Notificações automáticas
- Gestão de usuários

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB
- Windows 10+ (para C++)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Variáveis de Ambiente
```env
MONGODB_URI=mongodb://localhost:27017/zyro
JWT_SECRET=sua_chave_secreta
DISCORD_BOT_TOKEN=seu_token
```

---

## 🌐 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|----------|
| POST | `/api/launcher/validate` | Valida usuário |
| GET | `/api/products` | Lista produtos |
| POST | `/api/users/register` | Registra usuário |
| POST | `/api/users/login` | Login usuário |

---

## 💻 Integração C++

Consulte [DOCS_CPP.md](./DOCS_CPP.md) para documentação completa da integração C++.

### Quick Start
```cpp
#include "Auth.h"

int main() {
    Zyro::Authenticator auth;
    auto res = auth.Login("usuario", "senha");
    
    if (res.success) {
        // Login bem-sucedido
    }
}
```

---

## 📞 Contato

- **Discord:** Junte-se ao nosso servidor
- **Email:** contato@zyrostore.com

---

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=zyrostore&label=Views&color=0e75b6&style=flat" alt="Views">
</p>

---

<p align="center">
© 2024-2026 Zyro Store. Todos os direitos reservados.<br>
Versão: v0.32b
</p>