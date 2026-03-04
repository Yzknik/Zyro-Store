import db from '../config/db.js';

class SettingsModel {
    static getAll(): any {
        const rows = db.prepare('SELECT * FROM settings').all() as any[];
        const settings: any = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        return settings;
    }

    static update(key: string, value: string): void {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }
}

export default SettingsModel;
