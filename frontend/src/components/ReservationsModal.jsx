import { useState, useEffect } from 'react'
import {
    getAllRoomReservations,
    updateRoomReservationStatus,
    updateRoomReservation,
    getAllDiningReservations,
    updateDiningReservationStatus,
    updateDiningReservation,
    getAllEventPlans,
    updateEventPlanStatus,
    updateEventPlan,
} from '../api/client'

export default function ReservationsModal({ type, onClose, setError, setSuccess, onRefresh }) {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancelReason, setCancelReason] = useState('')
    const [showCancelModal, setShowCancelModal] = useState(null)
    const [showEditModal, setShowEditModal] = useState(null)
    const [editFormData, setEditFormData] = useState({})

    useEffect(() => {
        loadReservations()
    }, [type])

    const loadReservations = async () => {
        try {
            setLoading(true)
            let response
            if (type === 'room') {
                response = await getAllRoomReservations()
            } else if (type === 'dining') {
                response = await getAllDiningReservations()
            } else if (type === 'event') {
                response = await getAllEventPlans()
            }

            const data = response?.data || []
            const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => (b.id || 0) - (a.id || 0))
            setReservations(sortedData)
        } catch (err) {
            setError(err.message || 'Failed to load reservations')
            setReservations([])
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this reservation?')) return

        try {
            if (type === 'room') {
                await updateRoomReservationStatus(id, 'approved')
            } else if (type === 'dining') {
                await updateDiningReservationStatus(id, 'confirmed')
            } else if (type === 'event') {
                await updateEventPlanStatus(id, 'approved')
            }

            setSuccess('Reservation approved! Customer will receive an email confirmation.')
            await loadReservations()
            if (onRefresh) onRefresh()

            // Second refresh after a small delay to ensure indexing/persistence is complete
            setTimeout(async () => {
                await loadReservations()
                if (onRefresh) onRefresh()
            }, 1000)
        } catch (err) {
            setError(err.message || 'Failed to approve reservation')
        }
    }

    const handleCancelClick = (id) => {
        setShowCancelModal(id)
        setCancelReason('')
    }

    const handleCancelConfirm = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation')
            return
        }

        const id = showCancelModal
        try {
            if (type === 'room') {
                await updateRoomReservationStatus(id, 'cancelled', cancelReason)
            } else if (type === 'dining') {
                await updateDiningReservationStatus(id, 'cancelled', cancelReason)
            } else if (type === 'event') {
                await updateEventPlanStatus(id, 'cancelled', cancelReason)
            }

            setSuccess('Reservation cancelled. Customer will receive an email notification.')
            setShowCancelModal(null)
            setCancelReason('')
            await loadReservations()
            if (onRefresh) onRefresh()

            // Second refresh after a small delay
            setTimeout(async () => {
                await loadReservations()
                if (onRefresh) onRefresh()
            }, 1000)
        } catch (err) {
            setError(err.message || 'Failed to cancel reservation')
        }
    }

    const handleEditClick = (reservation) => {
        if (type === 'room') {
            setEditFormData({
                id: reservation.id,
                roomType: reservation.roomType || '',
                checkInDate: reservation.checkInDate || '',
                checkOutDate: reservation.checkOutDate || '',
                guestName: reservation.guestName || '',
                guestEmail: reservation.guestEmail || '',
                guestPhone: reservation.guestPhone || '',
                totalPrice: reservation.totalPrice || 0
            })
        } else if (type === 'dining') {
            setEditFormData({
                id: reservation.id,
                occasion: reservation.occasion || '',
                reservationDate: reservation.reservationDate || '',
                reservationTime: reservation.reservationTime || '',
                guestCount: reservation.guestCount || 1,
                guestName: reservation.guestName || '',
                guestEmail: reservation.guestEmail || '',
                guestPhone: reservation.guestPhone || '',
                specialRequests: reservation.specialRequests || ''
            })
        } else if (type === 'event') {
            setEditFormData({
                id: reservation.id,
                eventType: reservation.eventType || '',
                eventDate: reservation.eventDate || '',
                venue: reservation.venue || '',
                guestCount: reservation.guestCount || 1,
                guestName: reservation.guestName || '',
                guestEmail: reservation.guestEmail || '',
                guestPhone: reservation.guestPhone || '',
                specialRequests: reservation.specialRequests || ''
            })
        }
        setShowEditModal(reservation.id)
    }

    const handleEditSubmit = async () => {
        if (!editFormData.guestName || !editFormData.guestEmail) {
            alert('Please fill in all required fields')
            return
        }

        try {
            if (type === 'room') {
                await updateRoomReservation(editFormData.id, editFormData)
            } else if (type === 'dining') {
                await updateDiningReservation(editFormData.id, editFormData)
            } else if (type === 'event') {
                await updateEventPlan(editFormData.id, editFormData)
            }

            setSuccess('Reservation updated successfully! Customer will receive an email notification.')
            setShowEditModal(null)
            setEditFormData({})
            await loadReservations()
            if (onRefresh) onRefresh()

            // Second refresh after a small delay
            setTimeout(async () => {
                await loadReservations()
                if (onRefresh) onRefresh()
            }, 1000)
        } catch (err) {
            setError(err.message || 'Failed to update reservation')
        }
    }

    const getTitle = () => {
        if (type === 'room') return 'Room Reservations'
        if (type === 'dining') return 'Dining Reservations'
        if (type === 'event') return 'Event Reservations'
        return 'Reservations'
    }

    const formatDate = (date) => {
        if (!date) return 'N/A'
        const d = new Date(date)
        return d.toLocaleDateString()
    }

    const formatDateForInput = (date) => {
        if (!date) return ''
        const d = new Date(date)
        return d.toISOString().split('T')[0]
    }

    const getStatusColor = (status) => {
        if (status === 'approved' || status === 'confirmed' || status === 'completed') {
            return {
                bg: 'rgba(52, 211, 153, 0.2)',
                color: '#10b981',
                border: '#10b981'
            }
        } else if (status === 'pending') {
            return {
                bg: 'rgba(250, 204, 21, 0.2)',
                color: '#eab308',
                border: '#eab308'
            }
        } else {
            return {
                bg: 'rgba(248, 113, 113, 0.2)',
                color: '#ef4444',
                border: '#ef4444'
            }
        }
    }

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 9998,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: 'linear-gradient(135deg, #1e3a5f 0%, #0b132b 100%)',
                        borderRadius: '16px',
                        maxWidth: '1200px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{getTitle()}</h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                        {loading ? (
                            <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Loading reservations...</p>
                        ) : reservations.length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>No reservations found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reservations.map((reservation) => {
                                    const statusStyle = getStatusColor(reservation.status)

                                    return (
                                        <div
                                            key={reservation.id}
                                            style={{
                                                background: '#334155',
                                                borderRadius: '12px',
                                                padding: '1.5rem',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.125rem' }}>
                                                            {reservation.guestName || 'Guest'}
                                                        </h3>
                                                        <span
                                                            style={{
                                                                background: statusStyle.bg,
                                                                color: statusStyle.color,
                                                                padding: '0.25rem 0.75rem',
                                                                borderRadius: '999px',
                                                                fontSize: '0.85rem',
                                                                textTransform: 'capitalize',
                                                                border: `1px solid ${statusStyle.border}`
                                                            }}
                                                        >
                                                            {reservation.status === 'pending' ? 'Booking' : reservation.status}
                                                        </span>
                                                    </div>

                                                    <div style={{ color: '#fff', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                                                        {type === 'room' && (
                                                            <>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Room Type:</strong> {reservation.roomType}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Check-in:</strong> {formatDate(reservation.checkInDate)}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Check-out:</strong> {formatDate(reservation.checkOutDate)}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Total Price:</strong> Rs. {reservation.totalPrice?.toLocaleString() || 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {type === 'dining' && (
                                                            <>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Occasion:</strong> {reservation.occasion || 'Dining'}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Date:</strong> {formatDate(reservation.reservationDate)}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Time:</strong> {reservation.reservationTime || 'N/A'}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Guests:</strong> {reservation.guestCount}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Unit Price:</strong> Rs. {(reservation.totalPrice ? Math.round(reservation.totalPrice / reservation.guestCount) : 1500).toLocaleString()}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Total Price:</strong> Rs. {(reservation.totalPrice || (reservation.guestCount * 1500)).toLocaleString()}</p>
                                                            </>
                                                        )}
                                                        {type === 'event' && (
                                                            <>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Event Type:</strong> {reservation.eventType}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Date:</strong> {formatDate(reservation.eventDate)}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Venue:</strong> {reservation.venue || 'TBD'}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Guests:</strong> {reservation.guestCount}</p>
                                                                <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Total Price:</strong> Rs. {(reservation.totalPrice || 50000).toLocaleString()}</p>
                                                            </>
                                                        )}
                                                        <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Email:</strong> {reservation.guestEmail}</p>
                                                        <p style={{ margin: '0.25rem 0', color: '#fff' }}><strong>Phone:</strong> {reservation.guestPhone || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {reservation.status !== 'cancelled' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditClick(reservation)}
                                                                className="btn-outline"
                                                                style={{
                                                                    fontSize: '0.875rem',
                                                                    padding: '0.5rem 1rem',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelClick(reservation.id)}
                                                                className="btn-outline"
                                                                style={{
                                                                    fontSize: '0.875rem',
                                                                    padding: '0.5rem 1rem',
                                                                    color: '#ef4444',
                                                                    borderColor: '#ef4444',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                ✕ Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                    onClick={() => setShowEditModal(null)}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #0b132b 100%)',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Edit {getTitle().slice(0, -1)}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {type === 'room' && (
                                <>
                                    <label style={{ color: '#fff' }}>
                                        Room Type *
                                        <input
                                            type="text"
                                            value={editFormData.roomType || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, roomType: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Check-in Date *
                                        <input
                                            type="date"
                                            value={formatDateForInput(editFormData.checkInDate)}
                                            onChange={(e) => setEditFormData({ ...editFormData, checkInDate: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Check-out Date *
                                        <input
                                            type="date"
                                            value={formatDateForInput(editFormData.checkOutDate)}
                                            onChange={(e) => setEditFormData({ ...editFormData, checkOutDate: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Total Price (Rs.) *
                                        <input
                                            type="number"
                                            value={editFormData.totalPrice || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, totalPrice: parseFloat(e.target.value) })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                </>
                            )}

                            {type === 'dining' && (
                                <>
                                    <label style={{ color: '#fff' }}>
                                        Occasion
                                        <input
                                            type="text"
                                            value={editFormData.occasion || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, occasion: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Reservation Date *
                                        <input
                                            type="date"
                                            value={formatDateForInput(editFormData.reservationDate)}
                                            onChange={(e) => setEditFormData({ ...editFormData, reservationDate: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Reservation Time *
                                        <input
                                            type="time"
                                            value={editFormData.reservationTime || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, reservationTime: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Guest Count *
                                        <input
                                            type="number"
                                            value={editFormData.guestCount || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, guestCount: parseInt(e.target.value) })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                </>
                            )}

                            {type === 'event' && (
                                <>
                                    <label style={{ color: '#fff' }}>
                                        Event Type *
                                        <input
                                            type="text"
                                            value={editFormData.eventType || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, eventType: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Event Date *
                                        <input
                                            type="date"
                                            value={formatDateForInput(editFormData.eventDate)}
                                            onChange={(e) => setEditFormData({ ...editFormData, eventDate: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Venue
                                        <input
                                            type="text"
                                            value={editFormData.venue || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                    <label style={{ color: '#fff' }}>
                                        Guest Count *
                                        <input
                                            type="number"
                                            value={editFormData.guestCount || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, guestCount: parseInt(e.target.value) })}
                                            style={styles.modalInput}
                                        />
                                    </label>
                                </>
                            )}

                            <label style={{ color: '#fff' }}>
                                Guest Name *
                                <input
                                    type="text"
                                    value={editFormData.guestName || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, guestName: e.target.value })}
                                    style={styles.modalInput}
                                />
                            </label>

                            <label style={{ color: '#fff' }}>
                                Guest Email *
                                <input
                                    type="email"
                                    value={editFormData.guestEmail || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, guestEmail: e.target.value })}
                                    style={styles.modalInput}
                                />
                            </label>

                            <label style={{ color: '#fff' }}>
                                Guest Phone
                                <input
                                    type="tel"
                                    value={editFormData.guestPhone || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, guestPhone: e.target.value })}
                                    style={styles.modalInput}
                                />
                            </label>

                            {(type === 'dining' || type === 'event') && (
                                <label style={{ color: '#fff' }}>
                                    Special Requests
                                    <textarea
                                        value={editFormData.specialRequests || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, specialRequests: e.target.value })}
                                        style={{ ...styles.modalInput, height: '80px', resize: 'vertical' }}
                                    />
                                </label>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={handleEditSubmit}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setShowEditModal(null)}
                                className="btn-outline"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                    onClick={() => setShowCancelModal(null)}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #0b132b 100%)',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Cancel Reservation</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
                            Please provide a reason for cancelling this reservation. This will be sent to the customer via email.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="e.g., Fully booked, Maintenance required, etc."
                            rows="4"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={handleCancelConfirm}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    background: '#ef4444',
                                    borderColor: '#ef4444'
                                }}
                            >
                                Confirm Cancellation
                            </button>
                            <button
                                onClick={() => setShowCancelModal(null)}
                                className="btn-outline"
                                style={{ flex: 1 }}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

const styles = {
    modalInput: {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.05)',
        color: '#fff',
        fontSize: '1rem',
        marginTop: '0.5rem',
        fontFamily: 'inherit'
    }
}
