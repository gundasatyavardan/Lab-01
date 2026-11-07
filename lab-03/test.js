const assert = require('assert');
const http = require('http');
const app = require('./server');
const { initializeDB } = require('./database');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ statusCode: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  await initializeDB();
  const server = app.listen(0);
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  const baseOpt = {
    hostname: '127.0.0.1',
    port: port,
    headers: { 'Content-Type': 'application/json' }
  };

  try {
    // 1. GET /books (default parameters)
    let res = await makeRequest({ ...baseOpt, path: '/books', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(Array.isArray(res.data), true);
    console.log('✔ Test 1: GET /books defaults passed');

    // 2. GET /books with search_q
    res = await makeRequest({ ...baseOpt, path: '/books?search_q=JavaScript', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.length >= 2, true);
    assert.strictEqual(res.data.every(b => b.title.includes('JavaScript')), true);
    console.log('✔ Test 2: Search with search_q passed');

    // 3. GET /books with sorting (order_by=price&order=DESC)
    res = await makeRequest({ ...baseOpt, path: '/books?order_by=price&order=DESC', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data[0].price >= res.data[1].price, true);
    console.log('✔ Test 3: Sort order_by=price&order=DESC passed');

    // 4. GET /books with pagination limit & offset
    res = await makeRequest({ ...baseOpt, path: '/books?limit=2&offset=0', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.length, 2);
    console.log('✔ Test 4: Pagination limit & offset passed');

    // 5. GET /books with price filter min_price & max_price
    res = await makeRequest({ ...baseOpt, path: '/books?min_price=30&max_price=50', method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.every(b => b.price >= 30 && b.price <= 50), true);
    console.log('✔ Test 5: Price range filter (min_price & max_price) passed');

    // 6. POST /books - Validation error: missing title
    res = await makeRequest({ ...baseOpt, path: '/books', method: 'POST' }, { author: 'Nobody', price: 20 });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(typeof res.data.message, 'string');
    console.log('✔ Test 6: POST missing title returns 400 passed');

    // 7. POST /books - Validation error: missing author
    res = await makeRequest({ ...baseOpt, path: '/books', method: 'POST' }, { title: 'Book', price: 20 });
    assert.strictEqual(res.statusCode, 400);
    console.log('✔ Test 7: POST missing author returns 400 passed');

    // 8. POST /books - Validation error: non-numeric price
    res = await makeRequest({ ...baseOpt, path: '/books', method: 'POST' }, { title: 'Book', author: 'Author', price: "abc" });
    assert.strictEqual(res.statusCode, 400);
    console.log('✔ Test 8: POST non-numeric price returns 400 passed');

    // 9. POST /books - Valid create (201 Created)
    res = await makeRequest({ ...baseOpt, path: '/books', method: 'POST' }, { title: 'Node.js Design Patterns', author: 'Mario Casciaro', price: 42.00 });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.title, 'Node.js Design Patterns');
    const createdId = res.data.id;
    console.log(`✔ Test 9: POST valid book returns 201 (id: ${createdId}) passed`);

    // 10. GET /books/:id - Existing book (200 OK)
    res = await makeRequest({ ...baseOpt, path: `/books/${createdId}`, method: 'GET' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.id, createdId);
    console.log('✔ Test 10: GET /books/:id returns 200 passed');

    // 11. GET /books/:id - Not found (404 Not Found)
    res = await makeRequest({ ...baseOpt, path: '/books/999999', method: 'GET' });
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.message, 'Book not found');
    console.log('✔ Test 11: GET /books/:id not found returns 404 passed');

    // 12. PUT /books/:id - Update existing book (200 OK)
    res = await makeRequest({ ...baseOpt, path: `/books/${createdId}`, method: 'PUT' }, { title: 'Node.js Design Patterns (3rd Ed)', author: 'Mario Casciaro', price: 49.99 });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.price, 49.99);
    console.log('✔ Test 12: PUT /books/:id update returns 200 passed');

    // 13. PUT /books/:id - Not found (404 Not Found)
    res = await makeRequest({ ...baseOpt, path: '/books/999999', method: 'PUT' }, { title: 'Ghost', author: 'Ghost', price: 10 });
    assert.strictEqual(res.statusCode, 404);
    console.log('✔ Test 13: PUT /books/:id not found returns 404 passed');

    // 14. DELETE /books/:id - Delete existing (200 OK)
    res = await makeRequest({ ...baseOpt, path: `/books/${createdId}`, method: 'DELETE' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.message, 'Book deleted successfully');
    console.log('✔ Test 14: DELETE /books/:id returns 200 passed');

    // 15. DELETE /books/:id - Not found (404 Not Found)
    res = await makeRequest({ ...baseOpt, path: `/books/${createdId}`, method: 'DELETE' });
    assert.strictEqual(res.statusCode, 404);
    console.log('✔ Test 15: DELETE /books/:id already deleted returns 404 passed');

    console.log('\n ALL 15 AUTOMATED TESTS PASSED SUCCESSFULLY! ');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

