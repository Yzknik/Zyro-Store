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
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI!)}&response_type=code&scope=identify%20guilds%20guilds.members.read`;
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
        } else {
            User.update(discordUser.id, { username: discordUser.username, avatar: avatarUrl });
            user = User.findByDiscordId(discordUser.id);
        }

        const isAdmin = User.isAdmin(discordUser.id);
        const token = jwt.sign({ id: user.id, discord_id: user.discord_id, isAdmin, role: highestRole }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.redirect(user.password ? 'http://localhost:3000/dashboard' : 'http://localhost:3000/verified');
    } catch (err: any) {
        res.status(500).json({ error: 'Authentication failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user || !user.password) return res.status(401).json({ error: 'Não verificado.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Senha incorreta.' });

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
        res.json({ success: true, message: 'Account finalized' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const resetHWID = async (req: any, res: Response) => {
    try {
        const { product_id } = req.body;
        const user = User.findByDiscordId(req.user.discord_id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        db.prepare('UPDATE user_products SET hwid = NULL WHERE user_id = ? AND product_id = ?').run(user.id, product_id);
        res.json({ success: true });
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
            const allProducts = db.prepare('SELECT id as product_id, name FROM products').all();
            products = allProducts.map((p: any) => ({
                product_id: p.product_id, name: p.name, license_key: 'ZYRO-CEO-ACCESS-GOD-MODE', expires_at: null, status: 'active', hwid: 'BYPASS-SYSTEM'
            }));
        } else {
            products = db.prepare(`
                SELECT up.id, up.product_id, p.name, up.license_key, up.expires_at, up.status, up.hwid 
                FROM user_products up JOIN products p ON up.product_id = p.id WHERE up.user_id = ?`
            ).all(user.id);
        }

        res.json({ user, isAdmin, products, role: req.user.role });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
