
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware to log requests and their return status codes
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode}`);
    });
    next();
});

// Route 1: Home (GET / - Welcome text)
app.get('/', (req, res) => {
    res.status(200).send('Welcome to my Node.js and Express Server!');
});

// Route 2: About (GET /about - JSON with name and section)
app.get('/about', (req, res) => {
    res.status(200).json({
        name: 'G. Satyavardan',
        registrationNumber: '252U1R5051',
        section: 'AIDE-2A(106)'
    });
});

// Route 3: Time (GET /time - current date and time using new Date())
app.get('/time', (req, res) => {
    const currentDate = new Date();
    res.status(200).json({
        date: currentDate.toLocaleDateString(),
        time: currentDate.toLocaleTimeString(),
        iso: currentDate.toISOString()
    });
});

// 404 Route for any unknown path
app.use((req, res) => {
    res.status(404).json({
        error: '404 - Page Not Found',
        message: `The requested URL '${req.originalUrl}' was not found on this server.`
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

