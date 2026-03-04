import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../data/zyro.db');
const db = new Database(dbPath, { verbose: console.log });

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
            version TEXT NOT NULL,
            download_url TEXT NOT NULL,
            changelog TEXT,
            is_stable INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Migrations
    try { db.prepare('ALTER TABLE users ADD COLUMN password TEXT DEFAULT NULL').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN category_id INTEGER').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE products ADD COLUMN image_url TEXT').run(); } catch (e) { }
    try { db.prepare('ALTER TABLE user_products ADD COLUMN plan_id INTEGER').run(); } catch (e) { }

    console.log('✅ SQLite Database Initialized with Categories and Plans');
};

initSchema();

export default db;
