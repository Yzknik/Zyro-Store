import type { Request, Response } from 'express';
import db from '../config/db.js';
import { generateLicenseKey } from '../utils/keyGen.js';
import { logSystemEvent } from './authController.js';

export const getResellerStats = (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const stats = db.prepare(`
            SELECT 
                (SELECT reseller_balance FROM users WHERE id = ?) as balance,
                (SELECT COUNT(*) FROM reseller_sales WHERE reseller_id = ?) as total_keys,
                (SELECT SUM(price_charged) FROM reseller_sales WHERE reseller_id = ?) as total_spent
        `).get(user.id, user.id, user.id) as any;

        const recentSales = db.prepare(`
            SELECT rs.*, p.name as product_name, pl.name as plan_name 
            FROM reseller_sales rs
            JOIN products p ON rs.product_id = p.id
            JOIN plans pl ON rs.plan_id = pl.id
            WHERE rs.reseller_id = ?
            ORDER BY rs.created_at DESC LIMIT 10
        `).all(user.id);

        res.json({ stats, recentSales });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const buyKey = (req: Request, res: Response) => {
    try {
        const { product_id, plan_id } = req.body;
        const user = (req as any).user;

        // 1. Get plan price
        const plan = db.prepare('SELECT price, duration_days FROM plans WHERE id = ? AND product_id = ?').get(plan_id, product_id) as any;
        if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' });

        // 2. Check balance
        const reseller = db.prepare('SELECT reseller_balance FROM users WHERE id = ?').get(user.id) as any;
        if (reseller.reseller_balance < plan.price) {
            return res.status(400).json({ error: 'Saldo insuficiente. Recarregue com um administrador.' });
        }

        const license_key = generateLicenseKey();
        let expires_at = null;
        if (plan.duration_days > 0) {
            const date = new Date();
            date.setDate(date.getDate() + plan.duration_days);
            expires_at = date.toISOString();
        }

        // 3. Transactions
        const buyTransaction = db.transaction(() => {
            // Deduct balance
            db.prepare('UPDATE users SET reseller_balance = reseller_balance - ? WHERE id = ?').run(plan.price, user.id);

            // Log sale
            db.prepare(`
                INSERT INTO reseller_sales (reseller_id, product_id, plan_id, license_key, price_charged)
                VALUES (?, ?, ?, ?, ?)
            `).run(user.id, product_id, plan_id, license_key, plan.price);

            // Register global key (unassigned to user initially)
            db.prepare(`
                INSERT INTO user_products (user_id, product_id, plan_id, license_key, status, expires_at)
                VALUES (NULL, ?, ?, ?, 'active', ?)
            `).run(product_id, plan_id, license_key, expires_at);
        });

        buyTransaction();

        logSystemEvent(user.id, 'RESELLER BUY KEY', `Comprou key para ${product_id} Plano: ${plan_id}`);

        res.json({ success: true, license_key, expires_at: expires_at || 'Lifetime' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};
