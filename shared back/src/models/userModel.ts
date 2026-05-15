import db from '../config/db.js';

export interface UserData {
    id?: number;
    discord_id: string;
    username: string;
    avatar: string;
    role?: string;
    reseller_balance?: number;
}

class User {
    static findByDiscordId(discordId: string): UserData | undefined {
        const row: any = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
        return row;
    }

    static create(userData: UserData): number | bigint {
        const { discord_id, username, avatar } = userData;
        const result = db.prepare(
            'INSERT INTO users (discord_id, username, avatar) VALUES (?, ?, ?)'
        ).run(discord_id, username, avatar);
        return result.lastInsertRowid;
    }

    static update(discordId: string, userData: Partial<UserData>): void {
        const { username, avatar } = userData;
        db.prepare(
            'UPDATE users SET username = ?, avatar = ?, last_login = CURRENT_TIMESTAMP WHERE discord_id = ?'
        ).run(username, avatar, discordId);
    }

    static isAdmin(discordId: string): boolean {
        const row = db.prepare('SELECT id FROM admin_whitelist WHERE discord_id = ?').get(discordId);
        return !!row;
    }
}

export default User;
