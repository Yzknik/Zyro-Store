import db from '../config/db.js';

class NewsModel {
    static getAll(): any[] {
        return db.prepare('SELECT * FROM platform_updates ORDER BY created_at DESC').all();
    }

    static create(title: string, description: string): number | bigint {
        return db.prepare('INSERT INTO platform_updates (title, description) VALUES (?, ?)').run(title, description).lastInsertRowid;
    }

    static delete(id: number | string): void {
        db.prepare('DELETE FROM platform_updates WHERE id = ?').run(id);
    }
}

export default NewsModel;
