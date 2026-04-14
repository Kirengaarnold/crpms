import { useState, useEffect } from 'react'

const API = 'http://localhost:3000'

function getInitials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase()
}

const AVATAR_COLORS = [
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#FAECE7', color: '#993C1D' },
]

function avatarColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px',
      padding: '12px 20px', borderRadius: '10px', fontSize: '14px',
      fontWeight: '500', zIndex: 1000,
      background: toast.type === 'error' ? '#fdecea' : '#edfaf3',
      color: toast.type === 'error' ? '#c0392b' : '#1e7e4a',
    }}>
      {toast.msg}
    </div>
  )
}

// ─── Auth Page (Login + Register) ────────────────────────────
function AuthPage({ onLogin, showToast }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const endpoint = mode === 'login' ? '/login' : '/register'
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Something went wrong', 'error')
      } else if (mode === 'register') {
        showToast('Account created! Please log in.')
        setMode('login')
        setEmail('')
        setPassword('')
      } else {
        onLogin(data.email)
      }
    } catch {
      showToast('Could not connect to server.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.authPage}>
      <div style={s.authCard}>
        <div style={s.authLogo}>CM</div>
        <h1 style={s.authTitle}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={s.authSubtitle}>
          {mode === 'login' ? 'Sign in to your dashboard' : 'Register a new account'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={s.formGroup}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" required placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit"
            style={{ ...s.saveBtn, width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={{ color: '#1a1a1a', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setEmail(''); setPassword('') }}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard({ userEmail, onLogout, showToast }) {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '' })
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchCustomers = () => {
    fetch(`${API}/customers`, { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) { onLogout(); return null }
        return r.json()
      })
      .then((data) => { if (data) setCustomers(data) })
      .catch(() => showToast('Could not load customers.', 'error'))
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) return showToast(data.error, 'error')
    showToast('Customer added!')
    setForm({ first_name: '', last_name: '', phone: '', email: '' })
    setShowForm(false)
    fetchCustomers()
  }

  const handleEditSave = async (id) => {
    const res = await fetch(`${API}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editData),
    })
    const data = await res.json()
    if (!res.ok) return showToast(data.error, 'error')
    showToast('Customer updated!')
    setEditingId(null)
    fetchCustomers()
  }

  const handleDelete = async (id) => {
    const res = await fetch(`${API}/customers/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) return showToast(data.error, 'error')
    showToast('Customer deleted.')
    setDeletingId(null)
    fetchCustomers()
  }

  const handleLogout = async () => {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' })
    onLogout()
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return (
      (c.first_name || '').toLowerCase().includes(q) ||
      (c.last_name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    )
  })

  const withPhone = customers.filter((c) => c.phone).length
  const thisMonth = customers.filter((c) => {
    if (!c.created_at) return false
    const d = new Date(c.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Customer dashboard</h1>
          <p style={s.subtitle}>Signed in as <strong>{userEmail}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={s.addBtn} onClick={() => { setShowForm(!showForm); setEditingId(null) }}>
            {showForm ? 'Close' : '+ Add customer'}
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      <div style={s.metrics}>
        <div style={s.metric}>
          <div style={s.metricLabel}>Total customers</div>
          <div style={s.metricValue}>{customers.length}</div>
          <div style={s.metricSub}>All time</div>
        </div>
        <div style={s.metric}>
          <div style={s.metricLabel}>Added this month</div>
          <div style={s.metricValue}>{thisMonth}</div>
          <div style={s.metricSub}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={s.metric}>
          <div style={s.metricLabel}>With phone number</div>
          <div style={s.metricValue}>{withPhone}</div>
          <div style={s.metricSub}>
            {customers.length ? Math.round((withPhone / customers.length) * 100) : 0}% of total
          </div>
        </div>
      </div>

      {showForm && (
        <div style={s.panel}>
          <h2 style={s.panelTitle}>New customer</h2>
          <form onSubmit={handleAdd}>
            <div style={s.formGrid}>
              {[
                { key: 'first_name', label: 'First name', placeholder: 'Kirenga', type: 'text' },
                { key: 'last_name',  label: 'Last name',  placeholder: 'Arnold',  type: 'text' },
                { key: 'phone',      label: 'Phone',      placeholder: '+250 700 000 000', type: 'text' },
                { key: 'email',      label: 'Email',      placeholder: 'you@example.com',  type: 'email' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} style={s.formGroup}>
                  <label style={s.label}>{label}</label>
                  <input style={s.input} type={type} placeholder={placeholder}
                    value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div style={s.formFooter}>
              <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" style={s.saveBtn}>Save customer</button>
            </div>
          </form>
        </div>
      )}

      <div style={s.panel}>
        <div style={s.panelHeader}>
          <h2 style={s.panelTitle}>All customers</h2>
          <input style={s.search} placeholder="Search name, email, phone..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px', padding: '16px 0' }}>
            {search ? 'No customers match your search.' : 'No customers yet. Add one above.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Phone', 'Actions'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const ac = avatarColor(c.id)
                  const isEditing = editingId === c.id
                  const isDeleting = deletingId === c.id
                  return (
                    <tr key={c.id}>
                      {isEditing ? (
                        <>
                          <td style={s.td}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input style={{ ...s.input, padding: '6px 8px', fontSize: '13px', flex: 1 }}
                                value={editData.first_name || ''}
                                onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                                placeholder="First name" />
                              <input style={{ ...s.input, padding: '6px 8px', fontSize: '13px', flex: 1 }}
                                value={editData.last_name || ''}
                                onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                                placeholder="Last name" />
                            </div>
                          </td>
                          <td style={s.td}>
                            <input style={{ ...s.input, padding: '6px 8px', fontSize: '13px', width: '100%' }}
                              value={editData.email || ''}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                          </td>
                          <td style={s.td}>
                            <input style={{ ...s.input, padding: '6px 8px', fontSize: '13px', width: '100%' }}
                              value={editData.phone || ''}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                          </td>
                          <td style={s.td}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={s.btnSave} onClick={() => handleEditSave(c.id)}>Save</button>
                              <button style={s.btnCancel} onClick={() => setEditingId(null)}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : isDeleting ? (
                        <>
                          <td style={{ ...s.td, color: '#c0392b' }} colSpan={3}>
                            Delete <strong>{c.first_name} {c.last_name}</strong>? This cannot be undone.
                          </td>
                          <td style={s.td}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={s.btnDelete} onClick={() => handleDelete(c.id)}>Confirm</button>
                              <button style={s.btnCancel} onClick={() => setDeletingId(null)}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={s.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ ...s.avatar, background: ac.bg, color: ac.color }}>
                                {getInitials(c.first_name, c.last_name)}
                              </div>
                              <span>{c.first_name} {c.last_name}</span>
                            </div>
                          </td>
                          <td style={{ ...s.td, color: '#666' }}>{c.email}</td>
                          <td style={{ ...s.td, color: '#666' }}>{c.phone || '—'}</td>
                          <td style={s.td}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={s.btnEdit} onClick={() => {
                                setEditingId(c.id)
                                setEditData({ first_name: c.first_name, last_name: c.last_name, phone: c.phone, email: c.email })
                                setDeletingId(null)
                              }}>Edit</button>
                              <button style={s.btnDelete} onClick={() => {
                                setDeletingId(c.id)
                                setEditingId(null)
                              }}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [checked, setChecked] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetch(`${API}/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { if (data.email) setUser(data.email) })
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [])

  if (!checked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Toast toast={toast} />
      {user
        ? <Dashboard userEmail={user} onLogout={() => setUser(null)} showToast={showToast} />
        : <AuthPage onLogin={(email) => setUser(email)} showToast={showToast} />
      }
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────
const s = {
  authPage: {
    minHeight: '100vh', background: '#f7f5f2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', fontFamily: "'DM Sans', sans-serif",
  },
  authCard: {
    background: '#fff', borderRadius: '16px', padding: '48px',
    width: '100%', maxWidth: '420px', border: '1px solid #ececec',
  },
  authLogo: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: '#1a1a1a', color: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '500', marginBottom: '24px',
  },
  authTitle: { fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px' },
  authSubtitle: { fontSize: '14px', color: '#888', marginBottom: '28px' },
  page: {
    minHeight: '100vh', background: '#f7f5f2',
    padding: '36px 32px', fontFamily: "'DM Sans', sans-serif",
    maxWidth: '960px', margin: '0 auto',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  h1: { fontSize: '24px', fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#888' },
  addBtn: {
    padding: '10px 20px', background: '#1a1a1a', color: '#fff',
    border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
  },
  logoutBtn: {
    padding: '10px 20px', background: 'transparent', color: '#666',
    border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
  },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px', marginBottom: '20px' },
  metric: { background: '#fff', border: '1px solid #ececec', borderRadius: '12px', padding: '20px' },
  metricLabel: { fontSize: '11px', fontWeight: '500', color: '#999', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' },
  metricValue: { fontSize: '30px', fontWeight: '500', color: '#1a1a1a', lineHeight: 1 },
  metricSub: { fontSize: '12px', color: '#aaa', marginTop: '6px' },
  panel: { background: '#fff', border: '1px solid #ececec', borderRadius: '14px', padding: '24px', marginBottom: '16px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  panelTitle: { fontSize: '15px', fontWeight: '500', color: '#1a1a1a', marginBottom: '18px' },
  search: {
    padding: '8px 14px', fontSize: '13px', border: '1px solid #e5e5e5',
    borderRadius: '8px', background: '#fafafa', color: '#1a1a1a',
    outline: 'none', width: '240px', fontFamily: 'inherit',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: {
    textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #f0f0f0',
    fontSize: '11px', fontWeight: '500', color: '#999',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  td: { padding: '13px 12px', borderBottom: '1px solid #f8f8f8', color: '#1a1a1a', verticalAlign: 'middle' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '500', flexShrink: 0,
  },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '14px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '4px' },
  label: { fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    padding: '10px 12px', fontSize: '14px', border: '1px solid #e5e5e5',
    borderRadius: '8px', background: '#fafafa', color: '#1a1a1a',
    outline: 'none', fontFamily: 'inherit',
  },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' },
  cancelBtn: {
    padding: '9px 18px', fontSize: '13px', borderRadius: '8px',
    border: '1px solid #e5e5e5', background: 'transparent', color: '#666', cursor: 'pointer', fontFamily: 'inherit',
  },
  saveBtn: {
    padding: '9px 20px', fontSize: '13px', borderRadius: '8px',
    border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
  },
  btnEdit: {
    padding: '5px 12px', fontSize: '12px', borderRadius: '6px',
    border: '1px solid #e5e5e5', background: '#fafafa', color: '#333', cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDelete: {
    padding: '5px 12px', fontSize: '12px', borderRadius: '6px',
    border: '1px solid #fcd5d5', background: '#fdecea', color: '#c0392b', cursor: 'pointer', fontFamily: 'inherit',
  },
  btnSave: {
    padding: '5px 12px', fontSize: '12px', borderRadius: '6px',
    border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
  },
  btnCancel: {
    padding: '5px 12px', fontSize: '12px', borderRadius: '6px',
    border: '1px solid #e5e5e5', background: '#fafafa', color: '#666', cursor: 'pointer', fontFamily: 'inherit',
  },
}
