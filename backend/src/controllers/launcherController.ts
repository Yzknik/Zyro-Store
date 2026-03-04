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

        // 3. Busca a licença
        let query = `
            SELECT up.*, p.name as product_name 
            FROM user_products up 
            JOIN products p ON up.product_id = p.id 
            WHERE up.user_id = ? AND up.status = 'active'
        `;
        let params: any[] = [user.id];

        if (product_name) {
            query += " AND p.name = ?";
            params.push(product_name);
        }

        const license: any = db.prepare(query).get(...params);

        if (!license) {
            return res.status(403).json({ authorized: false, message: 'Licença inexistente ou expirada.' });
        }

        // Validação de Expiração
        if (license.expires_at && new Date(license.expires_at) < new Date()) {
            db.prepare("UPDATE user_products SET status = 'expired' WHERE id = ?").run(license.id);
            return res.status(403).json({ authorized: false, message: 'Sua licença expirou recentemente.' });
        }

        // 4. HWID Logic (Multi-step verification)
        if (!license.hwid) {
            db.prepare('UPDATE user_products SET hwid = ? WHERE id = ?').run(hwid, license.id);
        } else if (license.hwid !== hwid) {
            return res.status(403).json({ authorized: false, message: 'Hardware ID Incorreto. Solicite reset no painel.' });
        }

        // 5. Success Response with Security Data
        res.json({
            authorized: true,
            message: 'Conectado com sucesso!',
            data: {
                username: username,
                discord: user.discord_id,
                product: license.product_name,
                expiry: license.expires_at || 'Life-time',
                hwid_bound: true,
                session_token: Math.random().toString(36).substring(2, 15) // Token temporário para sessão
            }
        });

    } catch (err: any) {
        res.status(500).json({ error: 'Internal Server Security Error' });
    }
};
