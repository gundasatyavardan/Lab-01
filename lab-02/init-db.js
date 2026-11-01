// init-db.js - Script to initialize the SQLite database with seed data
const path = require('path');
const fs = require('fs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbDir = path.join(__dirname, 'database');
const dbPath = path.join(dbDir, 'books.db');

async function initDB() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  console.log('Opened database at:', dbPath);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY,
      title TEXT,
      author TEXT,
      price INTEGER,
      pages INTEGER
    );

    INSERT OR IGNORE INTO book (id, title, author, price, pages) VALUES
    (1, 'The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 550, 352),
    (2, 'Clean Code', 'Robert C. Martin', 650, 464),
    (3, 'JavaScript: The Good Parts', 'Douglas Crockford', 420, 176),
    (4, 'Eloquent JavaScript', 'Marijn Haverbeke', 480, 472),
    (5, 'You Don''t Know JS Yet', 'Kyle Simpson', 390, 142),
    (6, 'Design Patterns', 'Erich Gamma et al.', 750, 395),
    (7, 'Refactoring', 'Martin Fowler', 620, 448),
    (8, 'Introduction to Algorithms', 'Thomas H. Cormen', 890, 1312),
    (9, 'Node.js Design Patterns', 'Mario Casciaro', 580, 520);
  `);

  const books = await db.all('SELECT * FROM book;');
  console.log(`Database initialized! Books in DB: ${books.length}`);
  books.forEach((b) => console.log(` [${b.id}] "${b.title}" by ${b.author}`));

  await db.close();
}

initDB().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
