import type { Request, Response } from 'express';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import db from '../config/db.js';
import { generateLicenseKey } from '../utils/keyGen.js';

export const activatePlan = async (req: Request, res: Response) => {
    try {
        const { discord_id, product_name, duration_days } = req.body;

        const user = User.findByDiscordId(discord_id);
        if (!user) return res.status(404).json({ error: 'User not registered on site' });

        const pRow: any = db.prepare('SELECT id FROM products WHERE name = ?').get(product_name);
        if (!pRow) return res.status(404).json({ error: 'Product not found' });
        const product_id = pRow.id;

        const license_key = generateLicenseKey();
        let expires_at = null;
        if (duration_days > 0) {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(duration_days));
            expires_at = date;
        }

        Product.assignToUser({
            user_id: user.id,
            product_id,
            license_key,
            expires_at
        });

        res.json({ success: true, license_key, expires_at: expires_at || 'Lifetime' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const { discord_id } = req.params;
        const user = User.findByDiscordId(discord_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const products = db.prepare(`
            SELECT p.name, up.license_key, up.expires_at, up.status 
            FROM user_products up 
            JOIN products p ON up.product_id = p.id 
            WHERE up.user_id = ?`
        ).all(user.id);

        res.json({ user, products });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
