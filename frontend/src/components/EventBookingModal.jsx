import { useState } from 'react'
import { createEventPlan } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function EventBookingModal({ open, onClose, eventType }) {
    const { user } = useAuth()
    const [form, setForm] = useState({
        eventType: eventType?.name || '',
        eventDate: '',
        venue: '',
        guestCount: 50,
        guestName: user?.name || '',
        guestEmail: user?.email || '',
        guestPhone: '',
        specialRequests: ''
    })
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [totalPrice, setTotalPrice] = useState(0)

    if (!open) return null

    const update = (e) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value
        setForm({ ...form, [e.target.name]: value })
    }

    const save = async () => {
        if (!form.eventType || !form.eventDate || !form.guestName || !form.guestEmail) {
            setError('Please fill all required fields')
            return
        }

        try {
            setLoading(true)
            setError('')

            const priceStr = eventType?.price || ''
            const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
            const calculatedTotalPrice = numericPrice // Base price for the event

            const payload = {
                eventType: form.eventType,
                eventDate: form.eventDate,
                venue: form.venue || null,
                guestCount: form.guestCount,
                guestName: form.guestName,
                guestEmail: form.guestEmail,
                guestPhone: form.guestPhone || null,
                specialRequests: form.specialRequests || null,
                totalPrice: calculatedTotalPrice
            }

            await createEventPlan(payload)

            setTotalPrice(calculatedTotalPrice)
            setSaved(true)
            setTimeout(() => {
                setSaved(false)
                setTotalPrice(0)
                onClose()
                setForm({
                    eventType: eventType?.name || '',
                    eventDate: '',
                    venue: '',
                    guestCount: 50,
                    guestName: user?.name || '',
                    guestEmail: user?.email || '',
                    guestPhone: '',
                    specialRequests: ''
                })
            }, 2000)
        } catch (err) {
            setError(err.message || 'Failed to submit event plan. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.75rem' }}>Plan Your Event</h3>
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

                {eventType && (
                    <div style={{
                        background: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>{eventType.name}</h4>
                        <div className="price" style={{ fontSize: '1.125rem' }}>{eventType.price}</div>
                    </div>
                )}

                <div className="modal-grid">
                    <label style={{ gridColumn: '1 / -1' }}>
                        Event Type *
                        <input
                            type="text"
                            name="eventType"
                            value={form.eventType}
                            onChange={update}
                            placeholder="e.g., Wedding, Corporate Event, Birthday Party"
                            required
                        />
                    </label>
                    <label>
                        Event Date *
                        <input
                            type="date"
                            name="eventDate"
                            value={form.eventDate}
                            onChange={update}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </label>
                    <label>
                        Expected Guests *
                        <input
                            type="number"
                            name="guestCount"
                            value={form.guestCount}
                            onChange={update}
                            min="1"
                            max="500"
                            required
                        />
                    </label>
                    <label style={{ gridColumn: '1 / -1' }}>
                        Preferred Venue
                        <input
                            type="text"
                            name="venue"
                            value={form.venue}
                            onChange={update}
                            placeholder="e.g., Garden, Ballroom, Poolside"
                        />
                    </label>
                </div>

                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Contact Information</h4>
                    <div className="modal-grid">
                        <label>
                            Full Name *
                            <input
                                type="text"
                                name="guestName"
                                value={form.guestName}
                                onChange={update}
                                placeholder="Your full name"
                                required
                            />
                        </label>
                        <label>
                            Email *
                            <input
                                type="email"
                                name="guestEmail"
                                value={form.guestEmail}
                                onChange={update}
                                placeholder="your.email@example.com"
                                required
                            />
                        </label>
                        <label style={{ gridColumn: '1 / -1' }}>
                            Phone Number
                            <input
                                type="tel"
                                name="guestPhone"
                                value={form.guestPhone}
                                onChange={update}
                                placeholder="+94 XX XXX XXXX"
                            />
                        </label>
                        <label style={{ gridColumn: '1 / -1' }}>
                            Special Requirements
                            <textarea
                                name="specialRequests"
                                value={form.specialRequests}
                                onChange={update}
                                placeholder="Catering preferences, decoration requirements, entertainment needs..."
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </label>
                    </div>
                </div>

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
                        ✓ Your reservation is successful! Total: Rs. {totalPrice.toLocaleString()}. A confirmation email has been sent to your email address.
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={save} className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Book Event'}
                    </button>
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
