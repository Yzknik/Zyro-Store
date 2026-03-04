import type { Request, Response } from 'express';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import News from '../models/newsModel.js';
import Settings from '../models/settingsModel.js';
import db from '../config/db.js';
import { generateLicenseKey } from '../utils/keyGen.js';
import axios from 'axios';

const getId = (id: any): string => (Array.isArray(id) ? id[0] : id) as string;

// --- Category Management ---
export const listCategories = (req: Request, res: Response) => {
    try {
        const list = Product.getAllCategories();
        res.json(list);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const createCategory = (req: Request, res: Response) => {
    try {
        const id = Product.createCategory(req.body.name);
        res.status(201).json({ id, name: req.body.name });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteCategory = (req: Request, res: Response) => {
    try {
        Product.deleteCategory(getId(req.params.id));
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// --- Product Management ---
export const createProduct = (req: Request, res: Response) => {
    try {
        const id = Product.create(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteProduct = (req: Request, res: Response) => {
    try {
        Product.delete(getId(req.params.id));
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// --- Plan Management ---
export const createPlan = (req: Request, res: Response) => {
    try {
        const id = Product.createPlan(req.body);
        res.status(201).json({ id, ...req.body });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deletePlan = (req: Request, res: Response) => {
    try {
        Product.deletePlan(getId(req.params.id));
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// --- License Management ---
export const assignProduct = (req: Request, res: Response) => {
    try {
        const { discord_id, product_id, plan_id, duration_days } = req.body;

        const user = User.findByDiscordId(discord_id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const license_key = generateLicenseKey();
        let expires_at = null;

        let days = parseInt(duration_days);
        if (plan_id && (!days || days === 0)) {
            const plan = db.prepare('SELECT duration_days FROM plans WHERE id = ?').get(plan_id) as any;
            if (plan) days = plan.duration_days;
        }

        if (days > 0) {
            const date = new Date();
            date.setDate(date.getDate() + days);
            expires_at = date;
        }

        const id = Product.assignToUser({
            user_id: user.id,
            product_id,
            plan_id,
            license_key,
            expires_at
        });

        res.status(201).json({ id, license_key, expires_at: expires_at || 'Lifetime' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const listLicenses = (req: Request, res: Response) => {
    try {
        const licenses = Product.getAllLicenses();
        res.json(licenses);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateLicenseStatus = (req: Request, res: Response) => {
    try {
        Product.updateLicenseStatus(getId(req.params.id), req.body.status);
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteLicense = (req: Request, res: Response) => {
    try {
        Product.deleteLicense(getId(req.params.id));
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// --- Moderator Management ---
export const addModerator = (req: Request, res: Response) => {
    try {
        db.prepare('INSERT OR IGNORE INTO admin_whitelist (discord_id) VALUES (?)').run(req.body.discord_id);
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const listModerators = (req: Request, res: Response) => {
    try {
        const list = db.prepare('SELECT * FROM admin_whitelist').all();
        res.json(list);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const removeModerator = (req: Request, res: Response) => {
    try {
        db.prepare('DELETE FROM admin_whitelist WHERE id = ?').run(getId(req.params.id));
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
        const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
        const totalSales = db.prepare('SELECT COUNT(*) as count FROM user_products').get() as any;
        const activeLicenses = db.prepare(`SELECT COUNT(*) as count FROM user_products WHERE status = 'active'`).get() as any;
        const monthlySales = db.prepare("SELECT COUNT(*) as count FROM user_products WHERE datetime(assigned_at) >= datetime('now', 'start of month')").get() as any;

        // Dados para o gráfico (últimos 7 dias)
        const chartData = db.prepare(`
            WITH RECURSIVE days(date) AS (
                SELECT date('now', '-6 days')
                UNION ALL
                SELECT date(date, '+1 day') FROM days WHERE date < date('now')
            )
            SELECT d.date, COUNT(up.id) as sales
            FROM days d
            LEFT JOIN user_products up ON date(up.assigned_at) = d.date
            GROUP BY d.date
            ORDER BY d.date ASC
        `).all() as any[];

        const discordMembers = await getDiscordMemberCount();

        res.json({
            users: totalUsers.count,
            discordMembers,
            products: totalProducts.count,
            totalSales: totalSales.count,
            activeLicenses: activeLicenses.count,
            monthlySales: monthlySales.count,
            chartData: chartData.map(d => d.sales)
        });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};
// --- News Management ---
export const listNews = (req: Request, res: Response) => {
    try {
        const news = News.getAll();
        res.json(news);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const createNews = (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        const id = News.create(title, description);
        res.status(201).json({ id, title, description });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteNews = (req: Request, res: Response) => {
    try {
        News.delete(getId(req.params.id));
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// --- Settings Management ---
export const getSettings = (req: Request, res: Response) => {
    try {
        const settings = Settings.getAll();
        res.json(settings);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateSetting = (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        Settings.update(key, value);
        res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};

const getDiscordMemberCount = async () => {
    try {
        const guildId = '1435379479739371603';
        const token = process.env.BOT_API_KEY;
        if (!token) return 0;
        const res = await axios.get(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
            headers: { Authorization: `Bot ${token}` }
        });
        return res.data.approximate_member_count || 0;
    } catch (e) { return 0; }
};

export const getPublicInfo = async (req: Request, res: Response) => {
    try {
        const news = News.getAll().slice(0, 5);
        const settings = Settings.getAll();

        // Calcular estatísticas reais
        const dbUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
        const discordMembers = await getDiscordMemberCount();
        const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
        const totalSales = db.prepare('SELECT COUNT(*) as count FROM user_products').get() as any;
        const activeLicenses = db.prepare(`SELECT COUNT(*) as count FROM user_products WHERE status = 'active'`).get() as any;

        // Injetar valores dinâmicos nos campos de settings
        settings.stats_active_users = `${dbUsers.count + discordMembers}+`;
        settings.db_users_count = dbUsers.count;
        settings.discord_members_count = discordMembers;
        settings.total_products_count = totalProducts.count;
        settings.total_sales_count = totalSales.count;
        settings.active_subs_count = activeLicenses.count;

        res.json({ news, settings });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
};
