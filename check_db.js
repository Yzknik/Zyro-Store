import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('./backend/data/zyro.db');
const stats = {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
    products: db.prepare('SELECT COUNT(*) as count FROM products').get(),
    sales: db.prepare('SELECT COUNT(*) as count FROM user_products').get(),
    monthly: db.prepare("SELECT COUNT(*) as count FROM user_products WHERE datetime(assigned_at) >= datetime('now', 'start of month')").get(),
    raw: db.prepare("SELECT assigned_at FROM user_products").all()
};
console.log(JSON.stringify(stats, null, 2));
db.close();
