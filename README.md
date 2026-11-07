# Backend Development Lab Reports

This repository contains backend development laboratory experiments and submissions for **Backend Development Fundamentals · Year II Term II · Aurora**.

## Student Details
- **Name:** G. Satyavardan
- **Registration Number:** 252U1R5051
- **Section:** AIDE-2A(106)
- **Faculty:** Joel Prashanth D / Mr. Siva sai Teja

---

## Labs Index

| Lab | Title | Directory | Live Demo | Status |
|:---:|:---|:---:|:---:|:---:|
| **Lab 1** | Node.js and Express Server | [lab-01](./lab-01) | [Render Link](https://lab-01-express-server-l3mj.onrender.com) | Completed |
| **Lab 2** | SQLite Database and CRUD Routes | [lab-02](./lab-02) | [Render Link](https://lab-02-sqlite-server.onrender.com) | Completed |
| **Lab 3** | REST API, Query Parameters, Validation & Debugging | [lab-03](./lab-03) | [Render Link](https://lab-03-rest-api.onrender.com) | Completed |
| **Lab 4** | Upcoming | lab-04 | — | Pending |
| **Lab 5** | Upcoming | lab-05 | — | Pending |
| **Lab 6** | Upcoming | lab-06 | — | Pending |
| **Lab 7** | Upcoming | lab-07 | — | Pending |
| **Lab 8** | Upcoming | lab-08 | — | Pending |
| **Lab 9** | Upcoming | lab-09 | — | Pending |
| **Lab 10** | Upcoming | lab-10 | — | Pending |

---

## Repository Structure

```text
├── .gitignore
├── render.yaml                      # Multi-service Render deployment specification
├── README.md                        # Master index and student information
├── lab-01/                          # Lab 1: Node.js and Express server
│   ├── server.js                    # Express implementation
│   ├── server-http.js               # Built-in http module implementation
│   ├── package.json
│   ├── README.md                    # Lab 1 detailed report
│   └── screenshots/                 # Endpoint verification screenshots
└── lab-02/                          # Lab 2: SQLite database and CRUD routes
    ├── server.js                    # Express + SQLite CRUD server (initializeDBAndServer)
    ├── init-db.js                   # Database initialization and seeding script
    ├── package.json
    ├── requests.http                # HTTP request test client file
    ├── Bookstore_API_Lab2.postman_collection.json # Postman collection
    ├── README.md                    # Lab 2 detailed report
    ├── database/
    │   ├── books.db                 # SQLite database file
    │   └── init.sql                 # Table schema and seed data
    └── screenshots/                 # CRUD operation screenshots
```

