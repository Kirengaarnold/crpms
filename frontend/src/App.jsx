import { useState } from 'react'

function App() {
  const [first_name, setFirst_name] = useState('')
  const [last_name, setLast_name] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    fetch('http://localhost:3000/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, phone, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setMessage('Customer added successfully!')
          setFirst_name('')
          setLast_name('')
          setPhone('')
          setEmail('')
        }
      })
      .catch(() => setError('Could not connect to the server.'))
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Add Customer</h1>
        <p style={styles.subtitle}>Fill in the details below to register a new customer.</p>

        {message && <div style={styles.success}>{message}</div>}
        {error   && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* First & Last name side by side */}
          <div style={styles.row}>
            <div style={styles.group}>
              <label style={styles.label}>First Name</label>
              <input style={styles.input} type="text" value={first_name}
                onChange={(e) => setFirst_name(e.target.value)} placeholder="Kirenga" />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Last Name</label>
              <input style={styles.input} type="text" value={last_name}
                onChange={(e) => setLast_name(e.target.value)} placeholder="Arnold" />
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Phone</label>
            <input style={styles.input} type="text" value={phone}
              onChange={(e) => setPhone(e.target.value)} placeholder="+250 700 000 000" />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <button type="submit" style={styles.button}>Submit</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f0eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
  },
  title: { fontSize: '28px', marginBottom: '6px', color: '#1a1a1a' },
  subtitle: { fontSize: '14px', color: '#888', marginBottom: '32px' },
  row: { display: 'flex', gap: '16px' },
  group: { display: 'flex', flexDirection: 'column', marginBottom: '20px', flex: 1 },
  label: { fontSize: '12px', fontWeight: '500', color: '#555', marginBottom: '6px',
           letterSpacing: '0.06em', textTransform: 'uppercase' },
  input: { padding: '12px 14px', border: '1.5px solid #e5e5e5', borderRadius: '8px',
           fontSize: '15px', color: '#1a1a1a', outline: 'none', background: '#fafafa' },
  button: { width: '100%', padding: '14px', background: '#1a1a1a', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer',
            marginTop: '4px' },
  success: { padding: '12px 14px', background: '#edfaf3', color: '#1e7e4a',
             borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  error:   { padding: '12px 14px', background: '#fdecea', color: '#c0392b',
             borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
}

export default App