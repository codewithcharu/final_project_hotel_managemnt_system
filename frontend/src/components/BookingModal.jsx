import { useState } from 'react'
import { createRoomReservation } from '../api/client'

export default function BookingModal({ open, onClose, room }) {
  const [form, setForm] = useState({
    checkin: '',
    checkout: '',
    adult: 1,
    child: 0,
    nationality: 'Resident',
    promoCode: '',
    name: '',
    email: '',
    phone: ''
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const update = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const calculateNights = () => {
    if (!form.checkin || !form.checkout) return 0
    const checkIn = new Date(form.checkin)
    const checkOut = new Date(form.checkout)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const calculateTotal = () => {
    if (!room) return 0
    const nights = calculateNights()
    const basePrice = parseInt(room.price.replace(/[^0-9]/g, '')) || 0
    return basePrice * nights
  }

  const save = async () => {
    if (!form.checkin || !form.checkout || !form.name || !form.email) {
      setError('Please fill all required fields')
      return
    }
    if (new Date(form.checkout) <= new Date(form.checkin)) {
      setError('Check-out date must be after check-in date')
      return
    }

    if (!room) {
      setError('Please select a room before booking')
      return
    }

    try {
      setLoading(true)
      setError('')

      const totalPrice = calculateTotal()

      const payload = {
        roomType: room.name,
        checkIn: form.checkin,
        checkOut: form.checkout,
        addons: form.promoCode || null,
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone || null,
        totalPrice,
      }

      await createRoomReservation(payload)

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
        setForm({
          checkin: '',
          checkout: '',
          adult: 1,
          child: 0,
          nationality: 'Resident',
          promoCode: '',
          name: '',
          email: '',
          phone: ''
        })
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.75rem' }}>Check Rates</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.5rem',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {room && (
          <div style={{
            background: '#f9fafb',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>{room.name}</h4>
            <div className="price" style={{ fontSize: '1.125rem' }}>{room.price}</div>
          </div>
        )}

        <div className="modal-grid">
          <label>
            Check In *
            <input
              type="date"
              name="checkin"
              value={form.checkin}
              onChange={update}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </label>
          <label>
            Check Out *
            <input
              type="date"
              name="checkout"
              value={form.checkout}
              onChange={update}
              min={form.checkin || new Date().toISOString().split('T')[0]}
              required
            />
          </label>
          <label>
            Adults *
            <select name="adult" value={form.adult} onChange={update} required>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </label>
          <label>
            Children
            <select name="child" value={form.child} onChange={update}>
              {[0, 1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </label>
          <label>
            Nationality *
            <select name="nationality" value={form.nationality} onChange={update} required>
              <option value="Resident">Resident</option>
              <option value="Non Resident">Non Resident</option>
            </select>
          </label>
          <label>
            Promo Code
            <input
              type="text"
              name="promoCode"
              value={form.promoCode}
              onChange={update}
              placeholder="Enter promo code"
            />
          </label>
        </div>

        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Guest Information</h4>
          <div className="modal-grid">
            <label>
              Full Name *
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Your full name"
                required
              />
            </label>
            <label>
              Email *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                placeholder="your.email@example.com"
                required
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={update}
                placeholder="+94 XX XXX XXXX"
              />
            </label>
          </div>
        </div>

        {calculateNights() > 0 && (
          <div style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Nights:</span>
              <span>{calculateNights()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
              <span>Total:</span>
              <span>LKR {calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            color: 'crimson',
            marginBottom: '1rem',
            padding: '0.75rem',
            background: '#fee',
            borderRadius: '8px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{ color: 'green', marginBottom: '1rem', padding: '0.75rem', background: '#efe', borderRadius: '8px', border: '1px solid #cfc' }}>
            ✓ Your reservation is successful! Total: LKR {calculateTotal().toLocaleString()}. A confirmation email has been sent to your email address.
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={save} className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Booking...' : 'Book Now'}
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

