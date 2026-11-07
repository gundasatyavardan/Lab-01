const { initializeDB } = require('./database');
const path = require('path');
const fs = require('fs');

async function seed() {
  const dbPath = path.join(__dirname, 'books.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = await initializeDB(dbPath);

  const sampleBooks = [
    { title: 'The Pragmatic Programmer', author: 'Andy Hunt', price: 45.99 },
    { title: 'Clean Code', author: 'Robert C. Martin', price: 40.50 },
    { title: 'Design Patterns', author: 'Erich Gamma', price: 54.00 },
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 29.99 },
    { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', price: 25.00 },
    { title: 'You Don\'t Know JS', author: 'Kyle Simpson', price: 35.50 },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 89.99 },
    { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', price: 75.00 }
  ];

  for (const b of sampleBooks) {
    await db.run('INSERT INTO books (title, author, price) VALUES (?, ?, ?)', [b.title, b.author, b.price]);
  }

  console.log(`Seeded ${sampleBooks.length} sample books successfully.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

