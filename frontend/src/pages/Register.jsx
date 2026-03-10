import { useState } from 'react'
import { register, verifyOtp } from '../api/client'
import { Link } from 'react-router-dom'

const initialState = {
  name: '',
  nic: '',
  email: '',
  password: '',
  address: '',
  phoneNumber: '',
}

export default function Register() {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [otp, setOtp] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    setOtpMessage({ type: '', text: '' })

    try {
      setOtpEmail(form.email)
      await register(form)
      setMessage({
        type: 'success',
        text: 'Registration successful! Please check your email for the OTP to verify your account.',
      })
      setForm(initialState)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Registration failed. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    setOtpLoading(true)
    setOtpMessage({ type: '', text: '' })

    try {
      await verifyOtp({ email: otpEmail || form.email, otp })
      setOtpMessage({ type: 'success', text: 'Email verified! You can now log in.' })
      setOtp('')
    } catch (error) {
      setOtpMessage({ type: 'error', text: error.message || 'Invalid OTP. Please try again.' })
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <section style={styles.section}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Create an account</p>
            <h1 style={styles.title}>Join Piyakaru Hotel</h1>
            <p style={styles.subtitle}>
              Register to manage reservations, receive personalized offers, and plan your stay.
            </p>
          </div>
          <div>
            <p style={styles.meta}>Already have an account?</p>
            <Link to="/" style={styles.link}>
              Return home
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <label style={styles.label}>
              Full name*
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Lakshan Perera"
              />
            </label>
            <label style={styles.label}>
              NIC*
              <input
                type="text"
                name="nic"
                value={form.nic}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="123456789V"
              />
            </label>
          </div>

          <label style={styles.label}>
            Email address*
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
                placeholder="guestexample@gmail.com"
            />
          </label>

          <label style={styles.label}>
            Phone number
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              style={styles.input}
              placeholder="+94 70 123 4567"
            />
          </label>

          <label style={styles.label}>
            Address
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              style={styles.input}
              placeholder="No:32,Tangalle Road, Beliatta"
            />
          </label>

          <label style={styles.label}>
            Password*
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter a secure password"
            />
          </label>

          {message.text && (
            <p
              style={{
                ...styles.message,
                color: message.type === 'success' ? '#34d399' : '#f87171',
              }}
            >
              {message.text}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={styles.submit}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={styles.otpCard}>
          <h2 style={styles.otpTitle}>Verify your email</h2>
          <p style={styles.otpSubtitle}>
            Enter the 6-digit code sent to your inbox. This step keeps your account secure.
          </p>
          <form onSubmit={handleOtpSubmit} style={styles.otpForm}>
            <label style={styles.label}>
              Registered email
              <input
                type="email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="guest@example.com"
              />
            </label>
            <label style={styles.label}>
              One-time password (OTP)
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                style={styles.input}
                placeholder="Enter 6-digit code"
              />
            </label>

            {otpMessage.text && (
              <p
                style={{
                  ...styles.message,
                  color: otpMessage.type === 'success' ? '#34d399' : '#f87171',
                }}
              >
                {otpMessage.text}
              </p>
            )}

            <button type="submit" className="btn-outline" disabled={otpLoading} style={styles.submit}>
              {otpLoading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

const styles = {
  section: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0b132b, #1c2541)',
    padding: '4rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 760,
    background: '#0f172a',
    color: '#fff',
    borderRadius: '1.5rem',
    padding: '3rem',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '2rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontSize: '0.8rem',
    color: 'var(--accent)',
    margin: 0,
  },
  title: {
    fontSize: '2.25rem',
    margin: '0.5rem 0',
    fontFamily: '"Playfair Display", serif',
  },
  subtitle: {
    margin: 0,
    maxWidth: 480,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.5,
  },
  meta: {
    margin: 0,
    color: 'rgba(255,255,255,0.7)',
  },
  link: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
  },
  input: {
    padding: '0.9rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '1rem',
  },
  message: {
    margin: 0,
    fontSize: '0.95rem',
  },
  submit: {
    width: '100%',
    justifyContent: 'center',
    padding: '0.9rem 1.25rem',
    fontSize: '1rem',
  },
  otpCard: {
    marginTop: '2.5rem',
    padding: '2rem',
    borderRadius: '1.25rem',
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  otpTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1.5rem',
    fontFamily: '"Playfair Display", serif',
  },
  otpSubtitle: {
    margin: '0 0 1.5rem',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.5,
  },
  otpForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
}

