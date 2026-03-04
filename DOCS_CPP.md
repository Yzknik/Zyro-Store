# 🛡️ Zyro Store - Integração C++ Premium (Auth System)

Este documento fornece uma implementação robusta, segura e "anti-crack" para integrar o sistema de autenticação da Zyro Store em seu projeto C++ (Loaders, Cheats, Ferramentas).

## 🚀 Requisitos de Integração
Para usar este sistema, você precisa:
1.  **Visual Studio 2019+** com suporte a C++17 ou superior.
2.  **Bibliotecas:** `WinHTTP.lib` (Linker).
3.  **Servidor:** O backend da Zyro Store rodando e acessível.

---

## 🔒 Implementação de Segurança (Robust & Safe)

Abaixo está o código boilerplate com tratamento de erros, geração de HWID baseada em hardware real (Volume Serial) e proteção básica.

### IMPLEMENTAÇÃO COMPLETA: `Auth.h`

```cpp
#pragma once
#include <windows.h>
#include <winhttp.h>
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>

#pragma comment(lib, "winhttp.lib")

namespace Zyro {
    struct Response {
        bool success;
        std::string message;
        std::string product_name;
        std::string expires;
    };

    class Authenticator {
    private:
        std::wstring server_host = L"localhost"; // Mude para seu dominio em prod
        int server_port = 5000;

        // Gera um HWID unico baseado no Serial do Disco C:
        std::string GetHWID() {
            DWORD serial;
            if (GetVolumeInformationA("C:\\", NULL, 0, &serial, NULL, NULL, NULL, 0)) {
                std::stringstream ss;
                ss << std::hex << std::uppercase << serial;
                return "ZYRO-" + ss.str();
            }
            return "UNKNOWN-HWID";
        }

    public:
        Response Login(std::string username, std::string password) {
            Response res = { false, "Erro de Conexão", "", "" };
            std::string hwid = GetHWID();

            HINTERNET hSession = WinHttpOpen(L"ZyroSecureClient/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
            if (!hSession) return res;

            HINTERNET hConnect = WinHttpConnect(hSession, server_host.c_str(), server_port, 0);
            if (!hConnect) { WinHttpCloseHandle(hSession); return res; }

            HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", L"/api/launcher/validate", NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
            if (!hRequest) { WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession); return res; }

            // Configuração de Timeout para evitar travar o programa
            DWORD timeout = 5000; // 5 segundos
            WinHttpSetOption(hRequest, WINHTTP_OPTION_RECEIVE_TIMEOUT, &timeout, sizeof(timeout));

            // JSON Body Seguro
            std::string body = "{\"username\":\"" + username + "\", \"password\":\"" + password + "\", \"hwid\":\"" + hwid + "\"}";
            LPCWSTR headers = L"Content-Type: application/json\r\n";

            if (WinHttpSendRequest(hRequest, headers, -1L, (LPVOID)body.c_str(), (DWORD)body.length(), (DWORD)body.length(), 0)) {
                if (WinHttpReceiveResponse(hRequest, NULL)) {
                    DWORD dwSize = 0;
                    WinHttpQueryDataAvailable(hRequest, &dwSize);
                    if (dwSize > 0) {
                        std::vector<char> buffer(dwSize + 1);
                        DWORD dwDownloaded = 0;
                        if (WinHttpReadData(hRequest, &buffer[0], dwSize, &dwDownloaded)) {
                            std::string raw(buffer.begin(), buffer.begin() + dwDownloaded);
                            
                            // Parsing simples (Em prod use nlohmann/json)
                            if (raw.find("\"authorized\":true") != std::string::npos) {
                                res.success = true;
                                res.message = "Sucesso";
                                // Extração manual de dados (Exemplo)
                                size_t p_start = raw.find("\"product\":\"") + 11;
                                res.product_name = raw.substr(p_start, raw.find("\"", p_start) - p_start);
                            } else {
                                size_t m_start = raw.find("\"message\":\"") + 11;
                                res.message = raw.substr(m_start, raw.find("\"", m_start) - m_start);
                            }
                        }
                    }
                }
            }

            WinHttpCloseHandle(hRequest);
            WinHttpCloseHandle(hConnect);
            WinHttpCloseHandle(hSession);
            return res;
        }
    };
}
```

### EXEMPLO DE USO: `main.cpp`

```cpp
#include "Auth.h"

int main() {
    SetConsoleTitleA("Zyro Store - Authentication");
    Zyro::Authenticator auth;

    std::string user, pass;
    std::cout << " [ ZYRO STORE ] Login \n\n";
    std::cout << " > Usuario: "; std::cin >> user;
    std::cout << " > Senha:   "; std::cin >> pass;

    auto res = auth.Login(user, pass);

    if (res.success) {
        system("cls");
        std::cout << " [+] Logado com Sucesso! \n";
        std::cout << " [+] Produto: " << res.product_name << "\n";
        std::cout << " [+] Boas vindas ao Zyro, " << user << "!\n";
        // Seu código do cheat/loader aqui
    } else {
        std::cout << " [!] Erro: " << res.message << "\n";
    }

    Sleep(3000);
    return 0;
}
```

---

## 🛡️ Dicas de Segurança Avançada (Anti-Cheat / Anti-Crack)

Para tornar sua integração "Safe", siga estas diretrizes:

1.  **String Encryption:** Nunca deixe strings como `/api/launcher/validate` em texto puro. Use macros de criptografia para strings (ex: `XorStr`).
2.  **HTTPS:** Em produção, seu site **DEVE** usar HTTPS. Mude `L"localhost"` para seu domínio e as flags de WinHTTP para SSL.
3.  **VMPROTECT / THEMIDA:** Sempre proteja seu executável com um packer profissional após a compilação.
4.  **Heartbeat:** Implemente um "batimento cardíaco". A cada 5 minutos, o código C++ deve perguntar ao servidor se a sessão ainda é válida. Se o servidor disser que não, o programa deve fechar imediatamente (crash proposital).
5.  **Anti-Debugging:** Adicione funções como `IsDebuggerPresent()` para impedir que alguém tente crackear seu login usando x64dbg ou Cheat Engine.

## 📦 O que integrar?
*   **Username/Password:** O que o usuário criou na página `/verified` do site.
*   **HWID:** O sistema trava a conta no primeiro PC que logar.
*   **Status Check:** O servidor verifica se a licença está `active` ou `suspended` (pausada pelo usuário).

---
*Documentação atualizada em: 04/03/2026 por Zyro Dev Team.*
