import type { Request, Response } from 'express';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Helper function to ensure integer conversion
const toInt = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const parsed = parseInt(String(value), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const clientIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (Array.isArray(forwarded)) return String(forwarded[0] || '').split(',')[0]?.trim() || '';
    if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0]?.trim() || '';
    return String(req.socket.remoteAddress || '');
};

const launcherError = (res: Response, status: number, message: string, details?: string) => {
    return res.status(status).json({
        authorized: "false",
        success: false,
        message,
        ...(process.env.NODE_ENV === 'production' || !details ? {} : { details })
    });
};

export const getLatestVersion = (req: Request, res: Response) => {
    try {
        const versionSetting = db.prepare("SELECT value FROM settings WHERE key = 'launcher_main_version'").get() as any;
        const urlSetting = db.prepare("SELECT value FROM settings WHERE key = 'launcher_main_url'").get() as any;

        const latestVersion = String(versionSetting?.value || '1.0.0');
        const currentVersion = String(req.query.current_version || req.query.version || '');
        const updateAvailable = currentVersion ? compareVersions(currentVersion, latestVersion) < 0 : false;

        return res.json({
            success: true,
            version: latestVersion,
            latest_version: latestVersion,
            current_version: currentVersion || null,
            update_available: updateAvailable,
            needs_update: updateAvailable,
            download_url: urlSetting?.value || null,
            changelog: '',
            message: updateAvailable ? 'Atualização disponível.' : 'Launcher atualizado.'
        });
    } catch (err: any) {
        console.error('[LAUNCHER-VERSION] Failed to load version settings:', err.message);
        return res.status(500).json({
            success: false,
            update_available: false,
            needs_update: false,
            message: 'Erro ao verificar atualização.'
        });
    }
};

// Simple version comparison (returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2)
const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const num1 = parts1[i] ?? 0;
        const num2 = parts2[i] ?? 0;
        
        if (num1 < num2) return -1;
        if (num1 > num2) return 1;
    }
    
    return 0;
};

export const validateProduct = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return launcherError(res, 400, 'Corpo da requisição ausente.');
        }
        const { username, password, hwid, product_name, integrity_hash } = req.body;

        // 0. Verifica Integridade do Launcher (Opcional se enviado no login)
        const serverHash = db.prepare("SELECT value FROM settings WHERE key = 'launcher_integrity_hash'").get() as any;
        if (integrity_hash && integrity_hash !== serverHash?.value) {
            return launcherError(res, 403, 'Launcher modificado detectado. Baixe novamente no site.');
        }

        if (!username || !password) {
            return launcherError(res, 400, 'Identificadores ausentes.');
        }

        // 1. Busca o usuário
        const user: any = db.prepare('SELECT id, discord_id, username, password, avatar FROM users WHERE username = ?').get(username);

        if (!user || !user.password) {
            return launcherError(res, 401, 'Usuário não vinculado ao sistema.');
        }

        // Convert user.id to integer immediately to prevent float issues
        user.id = toInt(user.id);

        // 2. Verifica a senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // SECURITY: Log failed login attempt
            console.warn(`[SECURITY] Failed login attempt for user '${username}' from IP ${clientIp(req)} - Wrong password`);
            return launcherError(res, 401, 'Senha incorreta.');
        }

        // 3. Verifica se o usuário é Admin/Owner
        const admin = db.prepare('SELECT id FROM admin_whitelist WHERE discord_id = ?').get(user.discord_id);
        const isAdmin = !!admin;
        const role = isAdmin ? 'Owner' : 'User';
        const receivedHwid = String(hwid || '').trim();

        if (!isAdmin && !receivedHwid) {
            return launcherError(res, 400, 'HWID ausente.');
        }

        let activeLicenses: any[] = [];

        if (isAdmin) {
            // Se for admin, libera TODOS os produtos da loja
            const allProducts: any[] = db.prepare(`
                SELECT p.id as product_id, p.name as product_name, p.image_url, p.status as detection_status, 'Lifetime' as plan_name, NULL as expires_at, 'ADMIN-BYPASS' as license_key, p.current_version, p.download_url, p.changelog
                FROM products p
            `).all();
            // Convert product_id to integer for all admin products
            activeLicenses = allProducts.map(p => ({
                ...p,
                product_id: toInt(p.product_id)
            }));
        } else {
            // Se for usuário comum, busca as licenças dele
            const userId = toInt(user.id);
            const licenses: any[] = db.prepare(`
                SELECT up.id as id, up.user_id as user_id, up.product_id as product_id, up.license_key, up.hwid, up.expires_at, up.status, up.assigned_at, p.name as product_name, p.image_url, p.status as detection_status, pl.name as plan_name, p.current_version, p.download_url, p.changelog
                FROM user_products up 
                JOIN products p ON up.product_id = p.id 
                LEFT JOIN plans pl ON up.plan_id = pl.id
                WHERE up.user_id = ? AND up.status = 'active'
            `).all(userId);

            for (const lic of licenses) {
                // Convert all IDs to integer (double-check)
                lic.product_id = toInt(lic.product_id);
                lic.id = toInt(lic.id);
                lic.user_id = toInt(lic.user_id);
                
                // Check expiry
                if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
                    db.prepare("UPDATE user_products SET status = 'expired' WHERE id = ?").run(lic.id);
                    continue;
                }

                const storedHwid = String(lic.hwid || '').trim();

                // HWID Lock Logic
                if (!storedHwid || storedHwid === 'null' || storedHwid === '') {
                    // First time or reset: lock it now
                    db.prepare('UPDATE user_products SET hwid = ? WHERE id = ?').run(receivedHwid, lic.id);
                    lic.hwid = receivedHwid;
                    console.log(`[HWID-LOCK] Bound software ${lic.product_name} to HWID: ${receivedHwid} for user ${user.username}`);
                } else if (storedHwid !== receivedHwid) {
                    console.warn(`[HWID-MISMATCH] User ${user.username} tried ${lic.product_name} from ${receivedHwid} (Expected: ${storedHwid})`);
                    return launcherError(res, 403, `Acesso negado: Este produto está bloqueado para outra máquina (${lic.product_name}). Reset o HWID no site.`);
                }
                activeLicenses.push(lic);
            }
        }

        if (activeLicenses.length === 0 && !isAdmin) {
            return launcherError(res, 403, 'Você não possui licenças ativas.');
        }

        // 4. Grava Histórico de Login e IP
        const ip = clientIp(req);
        const userId = toInt(user.id);
        try {
            db.prepare('INSERT INTO login_history (user_id, ip_address, hwid) VALUES (?, ?, ?)').run(userId, ip, receivedHwid);
            db.prepare('UPDATE users SET last_ip = ?, last_login = datetime(\'now\') WHERE id = ?').run(ip, userId);
        } catch (logErr: any) {
            console.error('[WARN] Failed to log login history:', logErr.message);
        }

        // 5. Busca Mensagem de Broadcast
        const broadcast = db.prepare("SELECT value FROM settings WHERE key = 'broadcast_message'").get() as any;

        // 6. Build Products Response with proper error handling
        let productsResponse: Array<{
            id: number;
            name: string;
            image_url: string;
            version: string;
            payload_id: number | null;
            download_url: string;
            has_cloud_bin: boolean;
            changelog: string;
            plan: string;
            expiry: string;
            key: string;
            status: string;
        }> = [];
        try {
            productsResponse = activeLicenses.map(l => {
                // Get most recent stable version for this specific product (only if product_id exists)
                let latestVersion: any = null;
                const productId = toInt(l.product_id);
                
                if (productId > 0) {
                    try {
                        latestVersion = db.prepare('SELECT id, download_url, file_path, version, changelog FROM launcher_versions WHERE product_id = ? AND is_stable = 1 ORDER BY created_at DESC LIMIT 1').get(productId);
                    } catch (e) {
                        // Ignore error if no version found for this product
                        console.log(`[INFO] No version found for product_id: ${productId}`);
                    }
                }

                return {
                    id: l.product_id,
                    name: l.product_name,
                    image_url: l.image_url || '',
                    version: latestVersion?.version || l.current_version || '1.0.0',
                    payload_id: latestVersion?.id || null,
                    download_url: latestVersion?.download_url || l.download_url || '',
                    has_cloud_bin: !!(latestVersion?.file_path),
                    changelog: latestVersion?.changelog || l.changelog || '',
                    plan: l.plan_name || 'Lifetime',
                    expiry: l.expires_at || 'Never',
                    key: l.license_key,
                    status: l.detection_status || 'UNDETECTED'
                };
            });
        } catch (mapErr: any) {
            console.error('[ERROR] Failed to map products:', mapErr.message);
            productsResponse = [];
        }

        // 7. Success Response - Formato compatível com loader C++ (flatten)
        const summary = activeLicenses.map(l => `${l.product_name} [${l.plan_name || 'Lifetime'}] - ${l.expires_at || 'Nunca'} ID:${l.license_key}`).join(' | ');

        // Gerar session token seguro
        const crypto = await import('crypto');
        const secureToken = crypto.randomBytes(32).toString('hex');

        res.json({
            authorized: true,
            message: 'Acesso concedido!',
            broadcast: broadcast?.value || '',
            // Campos no nível raiz (compatível com loader C++)
            username: user.username,
            discord_id: user.discord_id,
            avatar_url: user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
            role: role,
            games: summary,
            // Dados completos em products (para uso futuro)
            products: productsResponse,
            session_token: secureToken
        });

    } catch (err: any) {
        console.error('[LAUNCHER-VALIDATE]', err);
        return launcherError(res, 500, 'Erro interno ao validar acesso.', err?.message);
    }
};

export const heartbeat = (req: Request, res: Response) => {
    try {
        const { username, session_token } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const ip = clientIp(req);
        db.prepare('UPDATE users SET last_heartbeat = datetime(\'now\'), last_ip = ? WHERE username = ?').run(ip, username);

        res.json({ status: 'alive' });
    } catch (err: any) {
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'SERVICE_ERROR' : err.message });
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
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'SERVICE_ERROR' : err.message });
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
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'SERVICE_ERROR' : err.message });
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
        res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'SERVICE_ERROR' : err.message });
    }
};
