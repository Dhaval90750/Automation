const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../automation.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

try {
    const pages = db.prepare('SELECT * FROM pages').all();
    console.log('Pages:', pages);
} catch (e) {
    console.log('Error querying pages:', e.message);
}
