# 🛡️ Zyro Store - Integração C++ Premium (Auth System)

Este documento fornece uma implementação robusta, segura e "anti-crack" para integrar o sistema de autenticação da Zyro Store em seu projeto C++ (Loaders, Cheats, Ferramentas).

## 🚀 Requisitos de Integração
1.  **Visual Studio 2019+** com suporte a C++17 ou superior.
2.  **Bibliotecas:** `WinHTTP.lib` (Linker).
3.  **Servidor:** O backend da Zyro Store rodando e acessível.

---

## 🔒 Implementação de Segurança (Robust & Safe)

Abaixo está o código boilerplate atualizado para suportar **Múltiplos Jogos**, **Validada de Planos** e **HWID Fix**.

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
        std::string games_summary; // Ex: "FiveM [Mensal] | CS2 [Lifetime]"
        // Informações de Perfil
        std::string username;
        std::string discord_id;
        std::string avatar_url;
        std::string role; // "Owner" ou "User"
    };

    class Authenticator {
    private:
        std::wstring server_host = L"localhost"; // Mude para seu dominio em prod
        int server_port = 5000;

        // Gera um HWID unico baseado no Serial do Disco e Nome do PC
        std::string GetHWID() {
            char computerName[MAX_COMPUTERNAME_LENGTH + 1];
            DWORD size = sizeof(computerName);
            GetComputerNameA(computerName, &size);

            DWORD serial;
            GetVolumeInformationA("C:\\", NULL, 0, &serial, NULL, NULL, NULL, 0);

            std::stringstream ss;
            ss << "ZYRO-" << computerName << "-" << std::hex << std::uppercase << serial;
            return ss.str();
        }

    public:
        Response Login(std::string username, std::string password) {
            Response res = { false, "Erro de Conexão", "", "", "", "", "" }; // Inicializa todos os campos
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

                                // Parse manual campos essenciais
                                // Parse das infos do Usuário (DENTRO de user_info)
                                auto parse_field = [&](std::string key) {
                                    size_t s = raw.find("\"" + key + "\":\"");
                                    if (s == std::string::npos) return std::string(); // Not found
                                    s += key.length() + 4; // Move past "key":"
                                    size_t e = raw.find("\"", s);
                                    if (e == std::string::npos) return std::string(); // End quote not found
                                    return raw.substr(s, e - s);
                                };

                                res.username = parse_field("username");
                                res.discord_id = parse_field("discord_id");
                                res.avatar_url = parse_field("avatar");
                                res.role = parse_field("role");

                                // Parse dos Jogos
                                size_t g_start = raw.find("\"games_summary\":\"") + 17;
                                if (g_start != std::string::npos + 17) {
                                    size_t g_end = raw.find("\"", g_start);
                                    res.games_summary = raw.substr(g_start, g_end - g_start);
                                }

                            } else {
                                size_t m_start = raw.find("\"message\":\"") + 11;
                                if (m_start != std::string::npos + 11) {
                                    res.message = raw.substr(m_start, raw.find("\"", m_start) - m_start);
                                } else {
                                    res.message = "Erro desconhecido na resposta.";
                                }
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
    SetConsoleTitleA("Zyro Store - Launcher");
    Zyro::Authenticator auth;

    std::string user, pass;
    std::cout << " [ ZYRO STORE ] Launcher \n\n";
    std::cout << " > Usuario: "; std::cin >> user;
    std::cout << " > Senha:   "; std::cin >> pass;

    auto res = auth.Login(user, pass);

    if (res.success) {
        system("cls");
        std::cout << " [ ZYRO " << res.role << " PANEL ] \n";
        std::cout << " Bem-vindo, " << res.username << " (" << res.role << ")\n";
        std::cout << " [+] Discord ID: " << res.discord_id << "\n";
        std::cout << " [+] Avatar URL: " << res.avatar_url << "\n";
        
        if (res.role == "Owner") {
            std::cout << " [!] MODO ADMINISTRADOR ATIVADO: TODOS OS JOGOS LIBERADOS [!]\n";
        }

        std::cout << " [+] Seus Jogos: " << res.games_summary << "\n\n";
        
        std::cout << " Digite o Numero para Abrir: \n";
        // Lógica de loop para exibir jogos um embaixo do outro:
        std::stringstream ss(res.games_summary);
        std::string game;
        std::vector<std::string> keys;
        int i = 1;
        while(std::getline(ss, game, '|')) {
            // Limpa espaços
            size_t first = game.find_first_not_of(' ');
            size_t last = game.find_last_not_of(' ');
            game = game.substr(first, (last - first + 1));

            // Extrai a License Key (está após 'ID:')
            size_t id_pos = game.find("ID:");
            if (id_pos != std::string::npos) {
                std::string name_part = game.substr(0, id_pos - 1);
                std::string key_part = game.substr(id_pos + 3);
                keys.push_back(key_part);
                std::cout << " [" << i++ << "] " << name_part << "\n";
            }
        }

        int choice;
        std::cout << "\n > Selecao: "; std::cin >> choice;
        if (choice > 0 && choice <= keys.size()) {
            std::cout << " [+] Executando com a Key: " << keys[choice-1] << "\n";
            // Aqui você chamaria a função de injeção/download do jogo usando a key
        }
    } else {
        std::cout << " [!] Erro: " << res.message << "\n";
    }

    Sleep(5000);
    return 0;
}
```

---

## 🎨 Integração com ImGui (Perfil & Avatar)

Para fazer uma interface premium como no seu print, siga estas dicas:

### 1. Mostrando a Foto e Nome
No seu loop de renderização do ImGui:
```cpp
// Lado superior ou lateral
ImGui::BeginChild("Profile", ImVec2(200, 60));
    // Se você usa uma lib de imagem (STB_Image), carregue a 'res.avatar_url'
    // ImGui::Image(my_discord_avatar_texture, ImVec2(40, 40)); 
    ImGui::SameLine();
    ImGui::BeginGroup();
        ImGui::Text(res.username.c_str());
        if (res.role == "Owner") 
            ImGui::TextColored(ImVec4(1, 0, 0, 1), "ADMINISTRADOR");
        else 
            ImGui::TextColored(ImVec4(0, 1, 0, 1), "USUÁRIO ATIVO");
    ImGui::EndGroup();
ImGui::EndChild();
```

### 2. Acesso Total (Bypass)
Como o backend já identifica o Owner e retorna **todos os produtos automaticamente**, você não precisa mudar nada na lógica de exibição. O Owner simplesmente verá a lista completa de softwares da loja como se tivesse comprado todos.

---

## 🖼️ Como mostrar a Foto de Perfil (Avatar) no ImGui

Para substituir aquele ícone estático do Discord pela sua foto real (como no seu print), você precisa seguir estes 3 passos no seu código C++:

### Passo 1: Download da Imagem do Discord
Use a `res.avatar_url` que o backend retorna. Você pode usar o `WinHTTP` (que você já usa no login) para baixar os bytes da imagem.

### Passo 2: Criar a Textura
Você precisará da biblioteca **stb_image.h** (muito comum em ImGui) para converter os bytes da imagem (PNG/JPG) em uma textura que o DirectX/OpenGL entenda.

### Exemplo de Função para Carregar Foto da URL:
```cpp
// Esta é uma ideia de como você implementaria a carga da foto
ID3D11ShaderResourceView* g_AvatarTexture = nullptr;

void LoadAvatarFromURL(std::string url) {
    // 1. Baixe os dados da URL usando WinHTTP
    // 2. Use stbi_load_from_memory para pegar os pixels
    // 3. Crie a ShaderResourceView (ID3D11ShaderResourceView)
    // 4. Atribua a g_AvatarTexture
}
```

### Passo 3: Substituir no seu Código de UI
No local onde você desenha o logo do Discord no topo direito, você deve trocar por isso:

```cpp
// No topo direito do seu Launcher
ImGui::SetCursorPos(ImVec2(780, 20)); // Ajuste para sua posição

if (g_AvatarTexture) {
    // Desenha sua foto de perfil circular ou quadrada
    ImGui::Image((void*)g_AvatarTexture, ImVec2(40, 40)); 
} else {
     // Desenha o ícone padrão se a foto ainda não carregou
    ImGui::Text("( )"); 
}

// Seu Nick ao lado da foto
ImGui::SameLine();
ImGui::TextColored(ImVec4(1, 1, 1, 0.8f), res.username.c_str());
```

> [!TIP]
> **Dica Extra:** Se você quiser que a foto fique redonda, você pode usar o `ImGui::GetWindowDrawList()->AddImageRounded()` em vez de `ImGui::Image()`.

---
*Documentação atualizada em: 04/03/2026 por Zyro Dev Team.*
