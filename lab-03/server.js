require('dotenv').config();
const express = require('express');
const { initializeDB, getDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// GET /books - Retrieve books with search, sort, filter, and pagination
app.get('/books', async (req, res) => {
  try {
    const db = await getDB();
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = 10,
      offset = 0,
      min_price,
      max_price
    } = req.query;

    const allowedOrderBy = ['id', 'title', 'author', 'price'];
    const sanitizedOrderBy = allowedOrderBy.includes(order_by.toLowerCase())
      ? order_by.toLowerCase()
      : 'id';

    const normalizedOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    const safeLimit = (!isNaN(parsedLimit) && parsedLimit > 0) ? parsedLimit : 10;
    const safeOffset = (!isNaN(parsedOffset) && parsedOffset >= 0) ? parsedOffset : 0;

    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (search_q && search_q.trim() !== '') {
      query += ' AND title LIKE ?';
      params.push(`%${search_q.trim()}%`);
    }

    if (min_price !== undefined && max_price !== undefined) {
      const min = parseFloat(min_price);
      const max = parseFloat(max_price);
      if (!isNaN(min) && !isNaN(max)) {
        query += ' AND price BETWEEN ? AND ?';
        params.push(min, max);
      }
    } else {
      if (min_price !== undefined) {
        const min = parseFloat(min_price);
        if (!isNaN(min)) {
          query += ' AND price >= ?';
          params.push(min);
        }
      }
      if (max_price !== undefined) {
        const max = parseFloat(max_price);
        if (!isNaN(max)) {
          query += ' AND price <= ?';
          params.push(max);
        }
      }
    }

    query += ` ORDER BY ${sanitizedOrderBy} ${normalizedOrder} LIMIT ? OFFSET ?`;
    params.push(safeLimit, safeOffset);

    const books = await db.all(query, params);
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// GET /books/:id - Retrieve single book by ID
app.get('/books/:id', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    const book = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// POST /books - Create new book with validation
app.post('/books', async (req, res) => {
  try {
    const db = await getDB();
    const { title, author, price } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Validation Error: Title is required and cannot be empty' });
    }

    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({ message: 'Validation Error: Author is required and cannot be empty' });
    }

    if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Validation Error: Price must be a valid non-negative number' });
    }

    const result = await db.run(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
      [title.trim(), author.trim(), price]
    );

    const newBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]);
    return res.status(201).json(newBook);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// PUT /books/:id - Update an existing book with validation
app.put('/books/:id', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { title, author, price } = req.body;

    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Validation Error: Title is required and cannot be empty' });
    }

    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({ message: 'Validation Error: Author is required and cannot be empty' });
    }

    if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Validation Error: Price must be a valid non-negative number' });
    }

    await db.run(
      'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
      [title.trim(), author.trim(), price, id]
    );

    const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    return res.status(200).json(updatedBook);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// DELETE /books/:id - Delete a book
app.delete('/books/:id', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;

    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await db.run('DELETE FROM books WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// Initialize database and start server
if (require.main === module) {
  initializeDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
    });
}

module.exports = app;
