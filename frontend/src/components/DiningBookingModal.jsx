import { useState } from 'react'
import { createDiningReservation, getAvailableDiningTables } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function DiningBookingModal({ open, onClose, initialNote = '' }) {
    const { user } = useAuth()
    const [form, setForm] = useState({
        occasion: '',
        reservationDate: '',
        reservationTime: '',
        guestCount: 2,
        guestName: user?.name || '',
        guestEmail: user?.email || '',
        guestPhone: '',
        specialRequests: initialNote || '',
        tableId: ''
    })
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [availableTables, setAvailableTables] = useState([])
    const [loadingTables, setLoadingTables] = useState(false)



    useEffect(() => {
        if (open && form.reservationDate && form.reservationTime && form.guestCount) {
            const fetchTables = async () => {
                setLoadingTables(true)
                try {
                    const response = await getAvailableDiningTables(
                        form.reservationDate,
                        form.reservationTime,
                        form.guestCount
                    )
                    // Backend returns { success: true, data: [...] }
                    setAvailableTables(response.data || [])
                } catch (e) {
                    console.error('Failed to fetch tables:', e)
                    setAvailableTables([])
                } finally {
                    setLoadingTables(false)
                }
            }
            fetchTables()
        } else {
            setAvailableTables([])
        }
    }, [open, form.reservationDate, form.reservationTime, form.guestCount])

    if (!open) return null

    const update = (e) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value
        setForm({ ...form, [e.target.name]: value })
    }

    const save = async () => {
        if (!form.reservationDate || !form.reservationTime || !form.guestName || !form.guestEmail) {
            setError('Please fill all required fields')
            return
        }

        try {
            setLoading(true)
            setError('')

            const payload = {
                occasion: form.occasion || null,
                reservationDate: form.reservationDate,
                reservationTime: form.reservationTime,
                guestCount: form.guestCount,
                guestName: form.guestName,
                guestEmail: form.guestEmail,
                guestPhone: form.guestPhone || null,
                specialRequests: form.specialRequests || null,
                tableId: form.tableId ? parseInt(form.tableId) : null,
                totalPrice: form.guestCount * 1500 // Assuming Rs. 1500 average per guest
            }

            await createDiningReservation(payload)

            setSaved(true)
            setTimeout(() => {
                setSaved(false)
                onClose()
                setForm({
                    occasion: '',
                    reservationDate: '',
                    reservationTime: '',
                    guestCount: 2,
                    guestName: user?.name || '',
                    guestEmail: user?.email || '',
                    guestPhone: '',
                    specialRequests: '',
                    tableId: ''
                })
            }, 2000)
        } catch (err) {
            setError(err.message || 'Failed to submit reservation. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.75rem' }}>Reserve a Table</h3>
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

                <div className="modal-grid">
                    <label>
                        Occasion
                        <select name="occasion" value={form.occasion} onChange={update}>
                            <option value="">Select occasion</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Anniversary">Anniversary</option>
                            <option value="Business">Business Lunch/Dinner</option>
                            <option value="Celebration">Celebration</option>
                            <option value="Casual">Casual Dining</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>
                    <label>
                        Reservation Date *
                        <input
                            type="date"
                            name="reservationDate"
                            value={form.reservationDate}
                            onChange={update}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </label>
                    <label>
                        Reservation Time *
                        <input
                            type="time"
                            name="reservationTime"
                            value={form.reservationTime}
                            onChange={update}
                            required
                        />
                    </label>
                    <label>
                        Number of Guests *
                        <select name="guestCount" value={form.guestCount} onChange={update} required>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Table Preference (Optional)
                        <select
                            name="tableId"
                            value={form.tableId}
                            onChange={update}
                            disabled={!form.reservationDate || !form.reservationTime || loadingTables}
                        >
                            <option value="">Any available table</option>
                            {loadingTables ? (
                                <option disabled>Checking availability...</option>
                            ) : availableTables && availableTables.length > 0 ? (
                                availableTables.map(table => (
                                    <option key={table.id} value={table.id}>
                                        Table {table.tableNumber} (Seats {table.capacity})
                                    </option>
                                ))
                            ) : (
                                <option disabled>No specific tables avail (Auto-assign)</option>
                            )}
                        </select>
                    </label>
                </div>

                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Rate per Guest:</span>
                        <span style={{ color: '#fff' }}>Rs. 1,500</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Estimated Total:</span>
                        <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>Rs. {(form.guestCount * 1500).toLocaleString()}</span>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Guest Information</h4>
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
                            Special Requests
                            <textarea
                                name="specialRequests"
                                value={form.specialRequests}
                                onChange={update}
                                placeholder="Any dietary restrictions or special requirements..."
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
                        ✓ Your reservation is successful! Total: Rs. {(form.guestCount * 1500).toLocaleString()}. A confirmation email has been sent to your email address.
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={save} className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Reserving...' : 'Reserve Table'}
                    </button>
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
