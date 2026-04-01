const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const db = require('./config/db');

app.get('/', (req, res) =>{
    res.send('Hello World!');
})

app.post('/customers', (req, res) => {
    const { first_name, last_name, phone, email, address } = req.body;
    const sql = 'INSERT INTO customers (first_name, last_name, phone, email, address) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [first_name, last_name, phone, email, address], (err, result) => {
        if (err) {
            console.error('Error inserting customer:', err);
            res.status(500).send('Error inserting customer');
            return;
        }
        res.status(201).send('Customer added successfully');
    });
});

app.get('/customers', (req, res) => {
    const sql = 'SELECT * FROM customers';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching customers:', err);
            return res.status(500).send('Error fetching customers');
        }
        res.status(200).json(results);
    });
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 