import type { Request, Response } from 'express';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const getLatestVersion = (req: Request, res: Response) => {
    try {
        const v = db.prepare("SELECT value FROM settings WHERE key = 'launcher_main_version'").get() as any;
        const url = db.prepare("SELECT value FROM settings WHERE key = 'launcher_main_url'").get() as any;

        res.json({
            version: v?.value || '1.0.0',
            download_url: url?.value || '',
            changelog: 'System auto-update enforced by administrator.'
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const validateProduct = async (req: Request, res: Response) => {
    try {
        const { username, password, hwid, product_name, integrity_hash } = req.body;

        // 0. Verifica Integridade do Launcher (Opcional se enviado no login)
        const serverHash = db.prepare("SELECT value FROM settings WHERE key = 'launcher_integrity_hash'").get() as any;
        if (integrity_hash && integrity_hash !== serverHash?.value) {
            return res.status(403).json({ authorized: false, message: 'Launcher modificado detectado. Rebaixe no site.' });
        }

        if (!username || !password) {
            return res.status(400).json({ authorized: false, message: 'Identificadores ausentes.' });
        }

        // 1. Busca o usuário
        const user: any = db.prepare('SELECT id, discord_id, username, password, avatar FROM users WHERE username = ?').get(username);

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
                SELECT p.id as product_id, p.name as product_name, p.status as detection_status, 'Lifetime' as plan_name, NULL as expires_at, 'ADMIN-BYPASS' as license_key, p.current_version, p.download_url, p.changelog
                FROM products p
            `).all();
            activeLicenses = allProducts;
        } else {
            // Se for usuário comum, busca as licenças dele
            const licenses: any[] = db.prepare(`
                SELECT up.*, p.name as product_name, p.status as detection_status, pl.name as plan_name, p.current_version, p.download_url, p.changelog
                FROM user_products up 
                JOIN products p ON up.product_id = p.id 
                LEFT JOIN plans pl ON up.plan_id = pl.id
                WHERE up.user_id = ? AND up.status = 'active'
            `).all(user.id);

            for (const lic of licenses) {
                // Check expiry
                if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
                    db.prepare("UPDATE user_products SET status = 'expired' WHERE id = ?").run(lic.id);
                    continue;
                }

                const receivedHwid = String(hwid || '').trim();
                const storedHwid = String(lic.hwid || '').trim();

                // HWID Lock Logic
                if (!storedHwid || storedHwid === 'null' || storedHwid === '') {
                    // First time or reset: lock it now
                    db.prepare('UPDATE user_products SET hwid = ? WHERE id = ?').run(receivedHwid, lic.id);
                    lic.hwid = receivedHwid;
                    console.log(`[HWID-LOCK] Bound software ${lic.product_name} to HWID: ${receivedHwid} for user ${user.username}`);
                } else if (storedHwid !== receivedHwid) {
                    console.warn(`[HWID-MISMATCH] User ${user.username} tried ${lic.product_name} from ${receivedHwid} (Expected: ${storedHwid})`);
                    return res.status(403).json({
                        authorized: false,
                        message: `Acesso negado: Este produto está bloqueado para outra máquina (${lic.product_name}). Reset o HWID no site.`
                    });
                }
                activeLicenses.push(lic);
            }
        }

        if (activeLicenses.length === 0 && !isAdmin) {
            return res.status(403).json({ authorized: false, message: 'Você não possui licenças ativas.' });
        }

        // 4. Grava Histórico de Login e IP
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        db.prepare('INSERT INTO login_history (user_id, ip_address, hwid) VALUES (?, ?, ?)').run(user.id, String(ip), hwid);
        db.prepare('UPDATE users SET last_ip = ?, last_login = DATETIME("now") WHERE id = ?').run(String(ip), user.id);

        // 5. Busca Mensagem de Broadcast
        const broadcast = db.prepare("SELECT value FROM settings WHERE key = 'broadcast_message'").get() as any;

        // 6. Success Response
        const summary = activeLicenses.map(l => `${l.product_name} [${l.plan_name || 'Lifetime'}] - ${l.expires_at || 'Nunca'} ID:${l.license_key}`).join(' | ');

        res.json({
            authorized: true,
            message: 'Acesso concedido!',
            broadcast: broadcast?.value || '',
            user_info: {
                username: user.username,
                discord_id: user.discord_id,
                avatar: user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
                role: role
            },
            games_summary: summary,
            products: activeLicenses.map(l => {
                // Get most recent stable version for this specific product
                const latestVersion: any = db.prepare('SELECT id, download_url, file_path, version FROM launcher_versions WHERE product_id = ? AND is_stable = 1 ORDER BY created_at DESC LIMIT 1').get(l.product_id);

                return {
                    id: l.product_id,
                    name: l.product_name,
                    version: latestVersion?.version || l.current_version || '1.0.0',
                    payload_id: latestVersion?.id || null,
                    download_url: latestVersion?.download_url || l.download_url || '',
                    has_cloud_bin: !!(latestVersion?.file_path), // Flag for launcher to know it can use downloadPayload endpoint
                    changelog: latestVersion?.changelog || l.changelog || '',
                    plan: l.plan_name || 'Lifetime',
                    expiry: l.expires_at || 'Never',
                    key: l.license_key,
                    status: l.detection_status || 'UNDETECTED'
                };
            }),
            session_token: Math.random().toString(36).substring(2, 15)
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const heartbeat = (req: Request, res: Response) => {
    try {
        const { username, session_token } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        db.prepare('UPDATE users SET last_heartbeat = DATETIME("now"), last_ip = ? WHERE username = ?').run(String(ip), username);

        res.json({ status: 'alive' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const checkIntegrity = (req: Request, res: Response) => {
    try {
        const { hash } = req.body;
        const serverHash = db.prepare("SELECT value FROM settings WHERE key = 'launcher_integrity_hash'").get() as any;

        if (hash === serverHash?.value) {
            res.json({ secure: true });
        } else {
            res.json({ secure: false, message: 'Nova versão disponível ou arquivo modificado.' });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const downloadPayload = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const version: any = db.prepare('SELECT file_path, version FROM launcher_versions WHERE id = ?').get(id);

        if (!version || !version.file_path) {
            return res.status(404).json({ error: 'Payload não encontrado.' });
        }

        const fullPath = path.resolve(version.file_path);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Arquivo binário ausente no servidor.' });
        }

        // Stream do arquivo para o launcher
        res.download(fullPath, `payload_${id}.exe`);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const downloadMain = (req: Request, res: Response) => {
    try {
        // Busca o caminho do launcher principal em uploads se necessário, ou redireciona
        const launcherPath = 'src/uploads/launcher/ZyroLauncher.exe';
        const fullPath = path.resolve(launcherPath);

        if (fs.existsSync(fullPath)) {
            return res.download(fullPath, 'ZyroLauncher.exe');
        }

        // Caso não tenha arquivo local, usa a URL do settings
        const url = db.prepare("SELECT value FROM settings WHERE key = 'launcher_main_url'").get() as any;
        if (url?.value && !url.value.includes('download-main')) {
            return res.redirect(url.value);
        }

        res.status(404).json({ error: 'Ficheiro do Launcher não configurado.' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
