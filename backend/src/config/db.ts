import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../data/zyro.db');
const db = new Database(dbPath, { verbose: console.log });

db.pragma('foreign_keys = ON');

const initSchema = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            avatar TEXT,
            password TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_whitelist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT UNIQUE NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            name TEXT NOT NULL,
            duration_days INTEGER NOT NULL,
            price REAL,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            plan_id INTEGER,
            license_key TEXT UNIQUE NOT NULL,
            hwid TEXT DEFAULT NULL,
            expires_at DATETIME,
            status TEXT DEFAULT 'active',
            assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS launcher_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            version TEXT NOT NULL,
            download_url TEXT NOT NULL,
            changelog TEXT,
            is_stable INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS platform_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
    `);

    // Default settings
    const defaultSettings = [
        ['stats_active_users', '12,400+'],
        ['stats_uptime', '99.9%'],
        ['stats_detection', '0%'],
        ['stats_delivery', '100%'],
        ['discord_link', 'https://discord.gg/zyrostore']
    ];

    for (const [key, val] of defaultSettings) {
        db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, val);
    }

    // Seed dummy data if empty
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    if (usersCount.count === 0) {
        db.prepare("INSERT INTO users (discord_id, username, avatar) VALUES ('1249488594414997676', 'ZyroOwner', 'https://cdn.discordapp.com/embed/avatars/0.png')").run();
        db.prepare("INSERT INTO products (name, description, image_url) VALUES ('FIVEM EXTERNAL', 'High-end performance external for FiveM.', 'https://placehold.co/600x400/080c14/3366ff?text=FIVEM')").run();
        db.prepare("INSERT INTO products (name, description, image_url) VALUES ('CS2 INTERNAL', 'Precision internal software for CS2.', 'https://placehold.co/600x400/080c14/3366ff?text=CS2')").run();
    }

    // Migrations
    try { db.prepare('ALTER TABLE users ADD COLUMN password TEXT DEFAULT NULL').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE users ADD COLUMN discord_access_token TEXT DEFAULT NULL').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN category_id INTEGER').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN image_url TEXT').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE user_products ADD COLUMN plan_id INTEGER').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE launcher_versions ADD COLUMN product_id INTEGER').run(); } catch (e) { }

    console.log('✅ SQLite Database Initialized with System Logs');
};

initSchema();

export default db;
