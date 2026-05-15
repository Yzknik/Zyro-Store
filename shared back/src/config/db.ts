import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../data/zyro.db');
const db: DatabaseType = new Database(dbPath, { verbose: console.log });

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
            role TEXT DEFAULT 'user',
            reseller_balance REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS reseller_sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reseller_id INTEGER,
            product_id INTEGER,
            plan_id INTEGER,
            license_key TEXT NOT NULL,
            price_charged REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reseller_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
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
            download_url TEXT,
            file_path TEXT,
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

        CREATE TABLE IF NOT EXISTS user_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            config_name TEXT NOT NULL,
            config_json TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS login_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            ip_address TEXT,
            hwid TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS support_tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subject TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ticket_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id INTEGER,
            user_id INTEGER,
            message TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS withdrawals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount REAL,
            pix_key TEXT NOT NULL,
            transaction_id TEXT UNIQUE,
            status TEXT DEFAULT 'processing',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            plan_id INTEGER,
            transaction_id TEXT UNIQUE,
            amount REAL,
            status TEXT DEFAULT 'pending',
            pix_copia_e_cola TEXT,
            qrcode_base64 TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        );
    `);

    // Default settings
    const defaultSettings = [
        ['stats_active_users', '12,400+'],
        ['analytics_id', 'UA-ZYRO-1'],
        ['launcher_main_version', '1.0.0'],
        ['launcher_main_url', 'https://zyroapi.shardweb.app/api/launcher/download-main'],
        ['stats_uptime', '99.9%'],
        ['stats_detection', '0%'],
        ['stats_delivery', '100%'],
        ['discord_link', 'https://discord.gg/zyrogg'],
        ['broadcast_message', 'Bem-vindo ao Zyro Store Launcher! Aproveite nossas ofertas.'],
        ['launcher_integrity_hash', 'ZYRO-HASH-123-ABC']
    ];

    for (const [key, val] of defaultSettings) {
        db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, val);
    }

    // Seed dummy data if empty
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    if (usersCount.count === 0) {
        db.prepare("INSERT INTO users (discord_id, username, avatar) VALUES ('1249488594414997676', 'ZyroOwner', 'https://cdn.discordapp.com/embed/avatars/0.png')").run();

        const prod1 = db.prepare("INSERT INTO products (name, description, image_url, status) VALUES ('FIVEM EXTERNAL', 'High-end performance external for FiveM.', 'https://placehold.co/600x400/080c14/3366ff?text=FIVEM', 'UNDETECTED')").run();
        const prod2 = db.prepare("INSERT INTO products (name, description, image_url, status) VALUES ('CS2 INTERNAL', 'Precision internal software for CS2.', 'https://placehold.co/600x400/080c14/3366ff?text=CS2', 'UNDETECTED')").run();

        // Seed some plans
        db.prepare("INSERT INTO plans (product_id, name, duration_days, price) VALUES (?, 'DAILY', 1, 15.00)").run(prod1.lastInsertRowid);
        db.prepare("INSERT INTO plans (product_id, name, duration_days, price) VALUES (?, 'WEEKLY', 7, 45.00)").run(prod1.lastInsertRowid);
        db.prepare("INSERT INTO plans (product_id, name, duration_days, price) VALUES (?, 'LIFETIME', 0, 150.00)").run(prod1.lastInsertRowid);

        db.prepare("INSERT INTO plans (product_id, name, duration_days, price) VALUES (?, 'DAILY', 1, 10.00)").run(prod2.lastInsertRowid);
        db.prepare("INSERT INTO plans (product_id, name, duration_days, price) VALUES (?, 'LIFETIME', 0, 99.00)").run(prod2.lastInsertRowid);
    }

    // Migrations
    try { db.prepare('ALTER TABLE users ADD COLUMN password TEXT DEFAULT NULL').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE users ADD COLUMN discord_access_token TEXT DEFAULT NULL').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE users ADD COLUMN last_ip TEXT').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE users ADD COLUMN last_heartbeat DATETIME').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN category_id INTEGER').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN image_url TEXT').run(); } catch (e) { }
    try { db.prepare("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'UNDETECTED'").run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN integrity_hash TEXT').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE user_products ADD COLUMN plan_id INTEGER').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE user_products ADD COLUMN hwid_reset_at DATETIME').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE users ADD COLUMN reseller_balance REAL DEFAULT 0').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN current_version TEXT DEFAULT "1.0.0"').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN download_url TEXT').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN changelog TEXT').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE launcher_versions ADD COLUMN product_id INTEGER').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE launcher_versions ADD COLUMN file_path TEXT').run(); } catch (e) { }

    console.log('✅ SQLite Database Initialized with System Logs');
};

initSchema();

export default db;
