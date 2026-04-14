const express = require('express')
const cors = require('cors')
const session = require('express-session')
const bcrypt = require('bcrypt')
const app = express()
const port = 3000
const db = require('./config/db')

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // ✅ required for cookies to be sent cross-origin
}))

app.use(session({
  secret: 'your-secret-key',   // change this to a long random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}))

app.options(/.*/, cors())

// ─── Auth middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  next()
}

// ─── Auth routes ───────────────────────────────────────────────
app.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' })

  try {
    const hashed = await bcrypt.hash(password, 10)
    db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(409).json({ error: 'Email already registered' })
        return res.status(500).json({ error: 'Error creating user' })
      }
      res.status(201).json({ message: 'Account created successfully' })
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' })

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' })
    if (results.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' })

    const user = results[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password' })

    req.session.userId = user.id
    req.session.email = user.email
    res.status(200).json({ message: 'Logged in', email: user.email })
  })
})

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logged out' })
  })
})

app.get('/me', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Not authenticated' })
  res.json({ userId: req.session.userId, email: req.session.email })
})

// ─── Customer routes (protected) ───────────────────────────────
app.post('/customers', requireAuth, (req, res) => {
  const { first_name, last_name, phone, email, address } = req.body
  const sql = 'INSERT INTO customers (first_name, last_name, phone, email, address) VALUES (?, ?, ?, ?, ?)'
  db.query(sql, [first_name, last_name, phone, email, address], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ error: 'A customer with this email already exists.' })
      return res.status(500).json({ error: 'Error inserting customer' })
    }
    res.status(201).json({ message: 'Customer added successfully', id: result.insertId })
  })
})

app.get('/customers', requireAuth, (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching customers' })
    res.status(200).json(results)
  })
})

app.put('/customers/:id', requireAuth, (req, res) => {
  const { first_name, last_name, phone, email } = req.body
  db.query(
    'UPDATE customers SET first_name=?, last_name=?, phone=?, email=? WHERE id=?',
    [first_name, last_name, phone, email, req.params.id],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(409).json({ error: 'A customer with this email already exists.' })
        return res.status(500).json({ error: 'Error updating customer' })
      }
      res.status(200).json({ message: 'Customer updated successfully' })
    }
  )
})

app.delete('/customers/:id', requireAuth, (req, res) => {
  db.query('DELETE FROM customers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error deleting customer' })
    res.status(200).json({ message: 'Customer deleted successfully' })
  })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})