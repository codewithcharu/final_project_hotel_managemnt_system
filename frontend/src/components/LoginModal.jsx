import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { login: handleAuthLogin } = useAuth()
  const navigate = useNavigate()

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await login({ email, password })
      const token = data?.data?.token
      if (token) {
        const user = data?.data?.user
        await handleAuthLogin(token, user)

        setSuccess('Login successful!')

        // Redirect based on role and close modal
        setTimeout(() => {
          handleClose()
          if (user.role === 'admin') navigate('/admin')
          else if (user.role === 'staff') navigate('/staff')
          else if (user.role === 'kitchen_admin') navigate('/kitchen-admin')
          else navigate('/profile')
        }, 600)
      } else {
        setError('Login failed: Token not received')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Sign in to Piyakaru Hotel</h3>
          <button onClick={handleClose} style={styles.closeButton} aria-label="Close login modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          {error && <p style={{ ...styles.message, color: '#f87171' }}>{error}</p>}
          {success && <p style={{ ...styles.message, color: '#34d399' }}>{success}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={styles.submitButton}>
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <p style={styles.registerHint}>
            New to Piyakaru Hotel?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
              onClick={handleClose}
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1.5rem',
  },
  modal: {
    background: '#0b132b',
    color: '#fff',
    width: '100%',
    maxWidth: 420,
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '0.65rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: '1rem',
  },
  message: {
    margin: 0,
    fontSize: '0.9rem',
  },
  submitButton: {
    width: '100%',
    justifyContent: 'center',
    textAlign: 'center',
  },
  registerHint: {
    textAlign: 'center',
    fontSize: '0.9rem',
    margin: '0.5rem 0 0',
    color: 'rgba(255,255,255,0.7)',
  },
}

