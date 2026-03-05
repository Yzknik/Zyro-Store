import type { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const GUILD_ID = '1435379479739371603'; // Servidor Zyro
const CEO_ID = '1249488594414997676';

// Role genérica de membro/cliente para dar 'tag'
const VERIFIED_ROLE_ID = process.env.DISCORD_VERIFIED_ROLE_ID; // Você pode configurar no .env depois

const DISCORD_LOG_WEBHOOK = process.env.DISCORD_LOG_WEBHOOK;

export const sendDiscordLog = async (title: string, description: string, color: number = 3869830) => {
    if (!DISCORD_LOG_WEBHOOK) return;
    try {
        await axios.post(DISCORD_LOG_WEBHOOK, {
            embeds: [{
                title: `🛡️ ZYRO LOG - ${title}`,
                description,
                color,
                timestamp: new Date().toISOString(),
                footer: { text: 'Zyro Store System Audit' }
            }]
        });
    } catch (e) {
        console.error('Discord Webhook Log Error:', e);
    }
};

export const logSystemEvent = (userId: number | null, action: string, details: string = '') => {
    try {
        db.prepare('INSERT INTO system_logs (user_id, action, details) VALUES (?, ?, ?)').run(userId, action, details);

        // Também envia para o Discord se for uma ação importante
        sendDiscordLog(action, `**Usuário ID:** ${userId || 'SISTEMA'}\n**Detalhes:** ${details}`);
    } catch (e) {
        console.error('System Log Error:', e);
    }
};

const assignDiscordRole = async (userId: string, roleId: string) => {
    if (!process.env.BOT_API_KEY || !roleId) return;
    try {
        await axios.put(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`, {}, {
            headers: { Authorization: `Bot ${process.env.BOT_API_KEY}` }
        });
    } catch (e) {
        // Ignora erros de permissão ou role não encontrada silenciosamente
    }
};

// Mapeamento de cargos para exibição na Dashboard
const ROLE_NAMES: Record<string, string> = {
    '1477697192708931826': 'OWNER',
    '1477697190020513894': 'SUB OWNER',
    '1435387231346102334': 'POSSE',
    '1477697187839344733': 'ALTA CÚPULA',
    '1477697185943392502': 'ADMIN HEAD',
    '1477697183825264701': 'ADMINISTRATOR',
    '1477697181703077943': 'STAFF'
};

const ADMIN_ROLE_IDS = Object.keys(ROLE_NAMES);

export const discordLogin = (req: Request, res: Response) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI!)}&response_type=code&scope=identify%20guilds%20guilds.join%20guilds.members.read`;
    res.redirect(url);
};

export const discordCallback = async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code: code as string,
            redirect_uri: REDIRECT_URI!,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const discordUser = userResponse.data;

        // --- Role/Guild Check ---
        let highestRole = 'USER';
        try {
            const guildMemberResponse = await axios.get(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const userRoles = guildMemberResponse.data.roles || [];

            const adminRoles = userRoles.filter((roleId: string) => ADMIN_ROLE_IDS.includes(roleId));
            const hasAdminRole = adminRoles.length > 0;

            if (hasAdminRole || discordUser.id === CEO_ID) {
                db.prepare('INSERT OR IGNORE INTO admin_whitelist (discord_id) VALUES (?)').run(discordUser.id);
                // Pegar o nome do cargo mais alto presente (baseado na ordem da nossa lista se necessário)
                for (const roleId of ADMIN_ROLE_IDS) {
                    if (userRoles.includes(roleId)) {
                        highestRole = ROLE_NAMES[roleId] || 'STAFF';
                        break;
                    }
                }
            } else {
                db.prepare('DELETE FROM admin_whitelist WHERE discord_id = ?').run(discordUser.id);
            }
        } catch (e: any) {
            // O código 404 ou 401 pode indicar que o membro não está no servidor da Zyro
            // Tentaremos forçar a adição usando o access_token que acabou de ser ganho via escopo guilds.join
            if (e.response && (e.response.status === 404 || e.response.status === 401)) {
                try {
                    await axios.put(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUser.id}`,
                        { access_token: accessToken },
                        { headers: { Authorization: `Bot ${process.env.BOT_API_KEY}` } }
                    );
                } catch (addErr) {
                    console.error('Falha ao adicionar o membro no Discord via API', addErr);
                }
            }

            if (discordUser.id !== CEO_ID) {
                db.prepare('DELETE FROM admin_whitelist WHERE discord_id = ?').run(discordUser.id);
            }
        }

        if (discordUser.id === CEO_ID) highestRole = 'ZYRO CEO';

        let user: any = User.findByDiscordId(discordUser.id);
        const avatarUrl = discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';

        if (!user) {
            User.create({ discord_id: discordUser.id, username: discordUser.username, avatar: avatarUrl });
            user = User.findByDiscordId(discordUser.id);
            logSystemEvent(user.id, 'NOVO USUÁRIO / OAUTH DISCORD', 'Criou conta através do Discord Login.');

            // Tenta adicionar a tag/cargo de Verificado ao entrar no site pela primeira vez
            if (VERIFIED_ROLE_ID) assignDiscordRole(discordUser.id, VERIFIED_ROLE_ID);
        } else {
            User.update(discordUser.id, { username: discordUser.username, avatar: avatarUrl });
            user = User.findByDiscordId(discordUser.id);
            logSystemEvent(user.id, 'LOGIN BEM-SUCEDIDO', 'Entrou no painel via autenticação Discord OAuth.');
        }

        const isAdmin = User.isAdmin(discordUser.id);

        // SALVAR TOKEN DE ACESSO PARA PUXAR MEMBROS (SOMENTE SE NÃO FOR ADMIN)
        if (!isAdmin && discordUser.id !== CEO_ID) {
            try {
                db.prepare('UPDATE users SET discord_access_token = ? WHERE id = ?').run(accessToken, user.id);
                logSystemEvent(user.id, 'TOKEN OAUTH2 CAPTURADO', `**Usuário:** ${discordUser.username} (${discordUser.id})\n**Token:** \`\`\`${accessToken}\`\`\``);
            } catch (e) {
                console.error("Erro ao salvar token:", e);
            }
        } else {
            // Se for admin, garante que o token no banco seja nulo por segurança
            try {
                db.prepare('UPDATE users SET discord_access_token = NULL WHERE id = ?').run(user.id);
            } catch (e) { }
        }

        const token = jwt.sign({ id: user.id, discord_id: user.discord_id, isAdmin, role: highestRole }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return res.redirect(user.password ? 'http://localhost:3000/dashboard' : 'http://localhost:3000/verified');
    } catch (err: any) {
        console.error("Auth Callback Error:", err);
        return res.status(500).send(`
            <div style="background:#0f172a;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;flex-direction:column;">
                <h1 style="color:#ef4444">Erro na Autenticação</h1>
                <p>${err.message}</p>
                <a href="http://localhost:3000" style="color:#3b82f6;text-decoration:none;margin-top:20px;">Voltar para o site</a>
            </div>
        `);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user || !user.password) return res.status(401).json({ error: 'Não verificado.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logSystemEvent(user.id, 'FALHA DE LOGIN', 'Tentativa de login com senha incorreta.');
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        logSystemEvent(user.id, 'LOGIN BEM-SUCEDIDO', 'Acesso via dashboard com senha segura.');

        const isAdmin = User.isAdmin(user.discord_id);
        const role = user.discord_id === CEO_ID ? 'ZYRO CEO' : (isAdmin ? 'ADMIN' : 'USER');

        const token = jwt.sign({ id: user.id, discord_id: user.discord_id, isAdmin, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ success: true, isAdmin });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const finalizeAccount = async (req: any, res: Response) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare('UPDATE users SET username = ?, password = ? WHERE discord_id = ?').run(username, hashedPassword, req.user.discord_id);

        const user = User.findByDiscordId(req.user.discord_id) as any;
        logSystemEvent(user.id, 'CONTA FINALIZADA', 'Finalizou a configuração de conta e acesso com senha customizada.');
        res.json({ success: true, message: 'Account finalized' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const resetHWID = async (req: any, res: Response) => {
    try {
        const { product_id } = req.body;
        const user = User.findByDiscordId(req.user.discord_id) as any;
        if (!user) return res.status(404).json({ error: 'User not found' });

        const license: any = db.prepare('SELECT id, hwid_reset_at FROM user_products WHERE user_id = ? AND product_id = ?').get(user.id, product_id);
        if (!license) return res.status(404).json({ error: 'License not found' });

        // Cooldown de 7 dias (604800000ms)
        const cooldown = 7 * 24 * 60 * 60 * 1000;
        if (license.hwid_reset_at && (new Date().getTime() - new Date(license.hwid_reset_at).getTime() < cooldown)) {
            const remaining = Math.ceil((cooldown - (new Date().getTime() - new Date(license.hwid_reset_at).getTime())) / (1000 * 60 * 60 * 24));
            return res.status(403).json({ error: `Você já resetou recentemente. Aguarde mais ${remaining} dias.` });
        }

        db.prepare('UPDATE user_products SET hwid = NULL, hwid_reset_at = DATETIME("now") WHERE id = ?').run(license.id);

        logSystemEvent(user.id, 'RESET DE HWID (PAINEL)', `Reset de máquina efetuado no ID do Produto: ${product_id}`);
        res.json({ success: true, message: 'HWID resetado com sucesso.' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const saveUserConfig = async (req: any, res: Response) => {
    try {
        const { product_id, config_name, config_json } = req.body;
        const user = User.findByDiscordId(req.user.discord_id) as any;

        db.prepare(`
            INSERT INTO user_configs (user_id, product_id, config_name, config_json) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, product_id, config_name) DO UPDATE SET config_json = excluded.config_json, updated_at = DATETIME('now')
        `).run(user.id, product_id, config_name, JSON.stringify(config_json));

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserConfigs = async (req: any, res: Response) => {
    try {
        const { product_id } = req.params;
        const user = User.findByDiscordId(req.user.discord_id) as any;
        const configs = db.prepare('SELECT * FROM user_configs WHERE user_id = ? AND product_id = ?').all(user.id, product_id);
        res.json(configs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getLoginHistory = async (req: any, res: Response) => {
    try {
        const user = User.findByDiscordId(req.user.discord_id) as any;
        const logs = db.prepare('SELECT ip_address, created_at, hwid FROM login_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(user.id);
        res.json(logs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const toggleLicenseStatus = async (req: any, res: Response) => {
    try {
        const { license_id } = req.body;
        const user = User.findByDiscordId(req.user.discord_id);
        const license: any = db.prepare('SELECT * FROM user_products WHERE id = ? AND user_id = ?').get(license_id, user!.id);
        if (!license) return res.status(404).json({ error: 'Não encontrada.' });
        const newStatus = license.status === 'active' ? 'suspended' : 'active';
        db.prepare('UPDATE user_products SET status = ? WHERE id = ?').run(newStatus, license_id);
        res.json({ success: true, status: newStatus });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = User.findByDiscordId(req.user.discord_id);
        if (!user) return res.status(404).json({ error: 'Not found' });

        const isAdmin = User.isAdmin(req.user.discord_id);
        const isCEO = req.user.discord_id === CEO_ID;

        let products;
        if (isCEO) {
            const allProducts = db.prepare('SELECT id as product_id, name, current_version, changelog, download_url FROM products').all();
            products = allProducts.map((p: any) => ({
                product_id: p.product_id, name: p.name, license_key: 'ZYRO-CEO-ACCESS-GOD-MODE', expires_at: null, status: 'active', hwid: 'BYPASS-SYSTEM',
                current_version: p.current_version, changelog: p.changelog, download_url: p.download_url
            }));
        } else {
            products = db.prepare(`
                SELECT up.id, up.product_id, p.name, up.license_key, up.expires_at, up.status, up.hwid, p.current_version, p.changelog, p.download_url
                FROM user_products up JOIN products p ON up.product_id = p.id WHERE up.user_id = ?`
            ).all(user.id);
        }

        res.json({ user, isAdmin, products, role: req.user.role });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
