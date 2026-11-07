# Lab 3: REST API, Query Parameters, Validation & Debugging

## Student Details

- **Name:** G. Satyavardan
- **Registration Number:** 252U1R5051
- **Section:** AIDE-2A(106)
- **Course:** Backend Development Fundamentals · Year II Term II · Aurora (Faculty:Mr. Siva sai Teja)

## 1. Overview
This project implements a clean REST API using Express and SQLite3 parameterized queries with search, sorting, filtering, pagination, input validation, consistent JSON error responses, and proper HTTP status codes.

---

## 2. API Endpoints Specification

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | Retrieve books with search, sort, filter, and pagination | `200 OK` |
| `GET` | `/books/:id` | Retrieve a single book by ID | `200 OK` / `404 Not Found` |
| `POST` | `/books` | Create a new book with body validation | `201 Created` / `400 Bad Request` |
| `PUT` | `/books/:id` | Update an existing book with validation | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/books/:id` | Delete a book by ID | `200 OK` / `404 Not Found` |

### Query Parameters for `GET /books`:
- `search_q` (optional): Matches title partially using `LIKE %...%` (parameterized). Default: `''`
- `order_by` (optional): Column to sort by (`id`, `title`, `author`, `price`). Default: `id`
- `order` (optional): Sort direction (`ASC` or `DESC`). Default: `ASC`
- `min_price` & `max_price` (optional): Filters price range using parameterized `BETWEEN ? AND ?`
- `limit` (optional): Number of records per page. Default: `10`
- `offset` (optional): Number of records to skip. Default: `0`

---

## 3. Postman Test Cases

Import [`postman_collection.json`](file:///c:/Users/Hello/OneDrive/Desktop/Lab-03/postman_collection.json) directly into Postman.

| # | Request Name | Method & URL | Expected Status | Description |
|---|---|---|---|---|
| 1 | Default List | `GET /books` | `200 OK` | Fetches first 10 books sorted by id ASC |
| 2 | Search Title | `GET /books?search_q=JavaScript` | `200 OK` | Matches books containing "JavaScript" |
| 3 | Sort by Price | `GET /books?order_by=price&order=DESC` | `200 OK` | Returns books sorted descending by price |
| 4 | Price Filter | `GET /books?min_price=30&max_price=50` | `200 OK` | Returns books within \$30 - \$50 range |
| 5 | Pagination | `GET /books?limit=3&offset=0` | `200 OK` | Returns first 3 records |
| 6 | Get by ID (Found) | `GET /books/1` | `200 OK` | Returns book with ID 1 |
| 7 | Get by ID (Missing) | `GET /books/99999` | `404 Not Found` | Returns `{"message": "Book not found"}` |
| 8 | Create Book (Valid) | `POST /books` | `201 Created` | Creates book and returns new object |
| 9 | Create Missing Title | `POST /books` | `400 Bad Request` | Rejects missing title |
| 10 | Create Missing Author | `POST /books` | `400 Bad Request` | Rejects missing author |
| 11 | Create Non-numeric Price | `POST /books` | `400 Bad Request` | Rejects string price |
| 12 | Update Book (Valid) | `PUT /books/1` | `200 OK` | Updates book record |
| 13 | Update Book (Missing) | `PUT /books/99999` | `404 Not Found` | Returns `{"message": "Book not found"}` |
| 14 | Delete Book (Valid) | `DELETE /books/1` | `200 OK` | Returns `{"message": "Book deleted successfully"}` |
| 15 | Delete Book (Missing) | `DELETE /books/99999` | `404 Not Found` | Returns `{"message": "Book not found"}` |

---

## 4. Debugging Exercise Walkthrough

The faculty lab mentions 4 common errors to diagnose and fix:

1. **Port conflict (`EADDRINUSE`)**:
   - **Cause:** Another process or background instance of node is already bound to port 3000.
   - **Fix:** Either kill the conflicting process (`netstat -ano | findstr :3000` and `taskkill /PID <PID> /F`), or make the port configurable via environment variable `const PORT = process.env.PORT || 3000;`.
2. **Wrong import path**:
   - **Cause:** Requiring a file with incorrect relative path or case (e.g., `require('./Database')` or `require('../database')`).
   - **Fix:** Verify file casing and correct relative path `require('./database')`.
3. **Table-name typo (`no such table`)**:
   - **Cause:** Executing queries like `SELECT * FROM book` when the table is named `books`.
   - **Fix:** Ensure SQL queries strictly match the table schema created in `database.js` (`books`).
4. **Missing `await`**:
   - **Cause:** Calling asynchronous database methods without `await` (e.g., `const books = db.all(query)`).
   - **Fix:** Add `await` before any database operation: `const books = await db.all(query, params);` inside `async` handlers.

---

## 5. Viva Questions & Answers

### Q1: Query parameter vs Path parameter?
- **Path parameters** (`/books/:id`): Part of the URL path itself, used to identify a specific, unique resource.
- **Query parameters** (`/books?search_q=js&order=ASC`): Key-value pairs appended after `?`, used to filter, sort, paginate, or search resources without altering the resource endpoint identity.

### Q2: What does stateless mean?
- **Stateless** (REST architectural constraint): Every HTTP request from a client to the server must contain all the information necessary for the server to understand and process the request. The server retains no client context or session state between requests.

### Q3: Which status code for bad input vs a missing record?
- **Bad input / validation failure**: `400 Bad Request` (e.g., missing required fields, non-numeric price, malformed payload).
- **Missing record**: `404 Not Found` (the URL or requested resource ID does not exist).

