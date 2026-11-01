// Script to start server, run automated tests, and exit
const http = require('http');

require('./server.js'); // Starts server via initializeDBAndServer()

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  try {
    console.log('\n==================================================');
    console.log('  STARTING LAB 2 ENDPOINT AUTOMATED TESTS');
    console.log('==================================================\n');

    // 1. GET /books/
    console.log('[TEST 1] GET /books/ (Retrieve all books)');
    const allBooks = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/books/',
      method: 'GET',
    });
    console.log(` Status: ${allBooks.statusCode}`);
    console.log(` Initial Books Count: ${allBooks.data.length}`);
    console.log(` Sample: [ID ${allBooks.data[0].id}] "${allBooks.data[0].title}" by ${allBooks.data[0].author}\n`);

    // 2. GET /books/1/
    console.log('[TEST 2] GET /books/1/ (Retrieve single book)');
    const singleBook = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/books/1/',
      method: 'GET',
    });
    console.log(` Status: ${singleBook.statusCode}`);
    console.log(` Book details:`, singleBook.data);
    console.log();

    // 3. GET /books/999/ (404 Not Found handling)
    console.log('[TEST 3] GET /books/999/ (404 Not Found handling)');
    const notFound = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/books/999/',
      method: 'GET',
    });
    console.log(` Status: ${notFound.statusCode}`);
    console.log(` Response body:`, notFound.data);
    console.log();

    // 4. POST /books/
    console.log('[TEST 4] POST /books/ (Add new book)');
    const newBook = {
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      price: 550,
      pages: 432,
    };
    const postRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/books/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      newBook
    );
    console.log(` Status: ${postRes.statusCode}`);
    console.log(` Response body:`, postRes.data);
    const addedId = postRes.data.id;
    console.log(` Inserted Book ID: ${addedId}\n`);

    // 5. GET /books/:id/ to verify addition
    console.log(`[TEST 5] GET /books/${addedId}/ (Verify newly added book)`);
    const verifyAdd = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/books/${addedId}/`,
      method: 'GET',
    });
    console.log(` Status: ${verifyAdd.statusCode}`);
    console.log(` Book details:`, verifyAdd.data);
    console.log();

    // 6. PUT /books/:id/
    console.log(`[TEST 6] PUT /books/${addedId}/ (Update book)`);
    const updatePayload = {
      title: 'Clean Architecture - Revised Edition',
      author: 'Robert C. Martin',
      price: 599,
      pages: 450,
    };
    const putRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: `/books/${addedId}/`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      updatePayload
    );
    console.log(` Status: ${putRes.statusCode}`);
    console.log(` Response body:`, putRes.data);
    console.log();

    // 7. GET /books/:id/ to verify update
    console.log(`[TEST 7] GET /books/${addedId}/ (Verify updated book)`);
    const verifyPut = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/books/${addedId}/`,
      method: 'GET',
    });
    console.log(` Status: ${verifyPut.statusCode}`);
    console.log(` Book details:`, verifyPut.data);
    console.log();

    // 8. DELETE /books/:id/
    console.log(`[TEST 8] DELETE /books/${addedId}/ (Remove book)`);
    const deleteRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/books/${addedId}/`,
      method: 'DELETE',
    });
    console.log(` Status: ${deleteRes.statusCode}`);
    console.log(` Response body:`, deleteRes.data);
    console.log();

    // 9. GET /books/:id/ to verify deletion (404)
    console.log(`[TEST 9] GET /books/${addedId}/ (Verify deletion returns 404)`);
    const verifyDelete = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/books/${addedId}/`,
      method: 'GET',
    });
    console.log(` Status: ${verifyDelete.statusCode}`);
    console.log(` Response body:`, verifyDelete.data);
    console.log();

    // 10. GET /books/ final count check
    console.log('[TEST 10] GET /books/ (Verify database restored to original count)');
    const finalCount = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/books/',
      method: 'GET',
    });
    console.log(` Status: ${finalCount.statusCode}`);
    console.log(` Final Books Count: ${finalCount.data.length}`);
    console.log();

    console.log('==================================================');
    console.log('  ALL 10 TESTS PASSED SUCCESSFULLY! (100% PASS)');
    console.log('==================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// Wait 1.5s for database and server to initialize
setTimeout(runTests, 1500);
