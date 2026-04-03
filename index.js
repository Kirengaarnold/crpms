const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const db = require('./config/db');

app.use(express.json());

// ✅ Single CORS config — update origin to match your frontend's port
app.use(cors({
    origin: "http://localhost:5173", // 👈 change to wherever your React app runs
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// ✅ Handle preflight requests for all routes
app.options(/.*/, cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/customers', (req, res) => {
    const { first_name, last_name, phone, email, address } = req.body;
    const sql = 'INSERT INTO customers (first_name, last_name, phone, email, address) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [first_name, last_name, phone, email, address], (err, result) => {
        if (err) {
            console.error('Error inserting customer:', err);
            return res.status(500).json({ error: 'Error inserting customer' });
        }
        // ✅ Return JSON instead of plain text so the frontend can parse it
        res.status(201).json({ message: 'Customer added successfully', id: result.insertId });
    });
});

app.get('/customers', (req, res) => {
    const sql = 'SELECT * FROM customers';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            return res.status(500).json({ error: 'Error fetching customers' });
        }
        res.status(200).json(results);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});