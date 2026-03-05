import type { Request, Response } from 'express';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getLatestVersion = (req: Request, res: Response) => {
    try {
        const row: any = db.prepare('SELECT version, download_url, changelog FROM launcher_versions WHERE is_stable = 1 ORDER BY created_at DESC LIMIT 1').get();
        if (!row) return res.status(404).json({ error: 'No version found' });
        res.json(row);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const validateProduct = async (req: Request, res: Response) => {
    try {
        const { username, password, hwid, product_name } = req.body;

        if (!username || !password) {
            return res.status(400).json({ authorized: false, message: 'Identificadores ausentes.' });
        }

        // 1. Busca o usuário
        const user: any = db.prepare('SELECT id, discord_id, password FROM users WHERE username = ?').get(username);

        if (!user || !user.password) {
            return res.status(401).json({ authorized: false, message: 'Usuário não vinculado ao sistema.' });
        }

        // 2. Verifica a senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ authorized: false, message: 'Senha incorreta.' });
        }

        // 3. Verifica se o usuário é Admin/Owner
        const admin = db.prepare('SELECT id FROM admin_whitelist WHERE discord_id = ?').get(user.discord_id);
        const isAdmin = !!admin;
        const role = isAdmin ? 'Owner' : 'User';

        let activeLicenses = [];

        if (isAdmin) {
            // Se for admin, libera TODOS os produtos da loja
            const allProducts: any[] = db.prepare(`
                SELECT p.name as product_name, 'Lifetime' as plan_name, NULL as expires_at, 'ADMIN-BYPASS' as license_key
                FROM products p
            `).all();
            activeLicenses = allProducts;
        } else {
            // Se for usuário comum, busca as licenças dele
            const licenses: any[] = db.prepare(`
                SELECT up.*, p.name as product_name, pl.name as plan_name
                FROM user_products up 
                JOIN products p ON up.product_id = p.id 
                LEFT JOIN plans pl ON up.plan_id = pl.id
                WHERE up.user_id = ? AND up.status = 'active'
            `).all(user.id);

            for (const lic of licenses) {
                if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
                    db.prepare("UPDATE user_products SET status = 'expired' WHERE id = ?").run(lic.id);
                    continue;
                }
                if (!lic.hwid) {
                    db.prepare('UPDATE user_products SET hwid = ? WHERE id = ?').run(hwid, lic.id);
                } else if (lic.hwid !== hwid) {
                    return res.status(403).json({ authorized: false, message: `HWID mismatch no produto: ${lic.product_name}.` });
                }
                activeLicenses.push(lic);
            }
        }

        if (activeLicenses.length === 0 && !isAdmin) {
            return res.status(403).json({ authorized: false, message: 'Você não possui licenças ativas.' });
        }

        // 5. Success Response com Perfil e Cargo
        const summary = activeLicenses.map(l => `${l.product_name} [${l.plan_name || 'Lifetime'}] - ${l.expires_at || 'Nunca'} ID:${l.license_key}`).join(' | ');

        res.json({
            authorized: true,
            message: 'Acesso concedido!',
            user_info: {
                username: user.username,
                discord_id: user.discord_id,
                avatar: user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
                role: role
            },
            games_summary: summary,
            products: activeLicenses.map(l => ({
                name: l.product_name,
                plan: l.plan_name || 'Lifetime',
                expiry: l.expires_at || 'Lifetime',
                key: l.license_key
            })),
            session_token: Math.random().toString(36).substring(2, 15)
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
