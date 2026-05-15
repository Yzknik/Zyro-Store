import Database from 'better-sqlite3';

const dbPath = 'c:/Users/User/Desktop/Zyro Store/backend/data/zyro.db';
const db = new Database(dbPath);

try {
    const list = db.prepare('SELECT * FROM admin_whitelist').all();
    console.log('--- Lista de Administradores ---');
    console.table(list);

    if (!list.find(u => u.discord_id === '1249488594414997676')) {
        db.prepare('INSERT INTO admin_whitelist (discord_id) VALUES (?)').run('1249488594414997676');
        console.log('ID 1249488594414997676 adicionado agora.');
    } else {
        console.log('ID 1249488594414997676 já é um administrador.');
    }
} catch (err) {
    console.error('Erro:', err);
} finally {
    db.close();
}
