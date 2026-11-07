const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function initializeDB(dbFilePath) {
  if (dbInstance) {
    return dbInstance;
  }

  const resolvedPath = dbFilePath || process.env.DB_PATH || path.join(__dirname, 'books.db');

  dbInstance = await open({
    filename: resolvedPath,
    driver: sqlite3.Database
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

  return dbInstance;
}

async function getDB() {
  if (!dbInstance) {
    return await initializeDB();
  }
  return dbInstance;
}

module.exports = {
  initializeDB,
  getDB
};

