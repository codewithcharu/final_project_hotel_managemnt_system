import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  changePassword,
  getMyDiningReservations,
  getMyEventPlans,
  getMyRoomReservations,
  updateProfile,
} from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [roomReservations, setRoomReservations] = useState([])
  const [diningReservations, setDiningReservations] = useState([])
  const [eventPlans, setEventPlans] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    nic: '',
    phoneNumber: '',
    address: ''
  })
  const [profileStatus, setProfileStatus] = useState({ type: '', text: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeReservationTab, setActiveReservationTab] = useState('all') // 'all', 'room', 'dining', 'event'
  const reservationsSectionRef = useRef(null)

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        nic: user.nic || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      })
    }
  }, [user])

  const handleProfileUpdate = async (event) => {
    event.preventDefault()
    setProfileLoading(true)
    setProfileStatus({ type: '', text: '' })
    try {
      await updateProfile(profileForm)
      setProfileStatus({ type: 'success', text: 'Profile updated successfully' })
      setIsEditingProfile(false)
      window.location.reload()
    } catch (err) {
      setProfileStatus({ type: 'error', text: err.message || 'Failed to update profile' })
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !token) {
      navigate('/', { replace: true })
    }
  }, [authLoading, token, navigate])

  useEffect(() => {
    async function loadData() {
      if (!token) {
        setIsLoadingData(false)
        return
      }
      setIsLoadingData(true)
      setError('')
      try {
        const [rooms, dining, events] = await Promise.all([
          getMyRoomReservations(),
          getMyDiningReservations(),
          getMyEventPlans(),
        ])
        setRoomReservations(rooms?.data || rooms || [])
        setDiningReservations(dining?.data || dining || [])
        setEventPlans(events?.data || events || [])
      } catch (err) {
        setError(err.message || 'Failed to load your reservations')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [token])

  const totalBookings = useMemo(
    () => roomReservations.length + diningReservations.length + eventPlans.length,
    [roomReservations.length, diningReservations.length, eventPlans.length],
  )

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setPasswordLoading(true)
    setPasswordStatus({ type: '', text: '' })
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordStatus({ type: 'success', text: 'Password updated successfully' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.message || 'Failed to update password' })
    } finally {
      setPasswordLoading(false)
    }
  }

  if (authLoading || isLoadingData) {
    return (
      <section style={styles.section}>
        <div style={styles.card}>
          <p>Loading your dashboard...</p>
        </div>
      </section>
    )
  }

  if (!token) {
    return null
  }

  return (
    <section style={styles.section}>
      <div style={{ ...styles.card, marginBottom: '2rem' }}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Your royal stay</p>
            <h1 style={styles.title}>Guest dashboard</h1>
            <p style={styles.subtitle}>
              Review your reservations, dining plans, and curated events—all in one elegant view.
            </p>
          </div>
        </div>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span>Total bookings</span>
            <strong>{totalBookings}</strong>
          </div>
          <div 
            onClick={() => {
              setActiveReservationTab('room')
              setTimeout(() => {
                reservationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 100)
            }}
            style={{
              ...styles.statCard,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: activeReservationTab === 'room' ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)'
            }}
            onMouseEnter={(e) => {
              if (activeReservationTab !== 'room') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeReservationTab !== 'room') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            <span>Room stays</span>
            <strong>{roomReservations.length}</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Click to view</p>
          </div>
          <div 
            onClick={() => {
              setActiveReservationTab('dining')
              setTimeout(() => {
                reservationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 100)
            }}
            style={{
              ...styles.statCard,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: activeReservationTab === 'dining' ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)'
            }}
            onMouseEnter={(e) => {
              if (activeReservationTab !== 'dining') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeReservationTab !== 'dining') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            <span>Dining experiences</span>
            <strong>{diningReservations.length}</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Click to view</p>
          </div>
          <div 
            onClick={() => {
              setActiveReservationTab('event')
              setTimeout(() => {
                reservationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 100)
            }}
            style={{
              ...styles.statCard,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: activeReservationTab === 'event' ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)'
            }}
            onMouseEnter={(e) => {
              if (activeReservationTab !== 'event') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeReservationTab !== 'event') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            <span>Celebrations</span>
            <strong>{eventPlans.length}</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Click to view</p>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ ...styles.panelTitle, marginBottom: 0 }}>Profile</h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              style={{ background: 'transparent', border: '1px solid #fbbf24', color: '#fbbf24', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {profileStatus.text && (
            <p style={{ ...styles.message, color: profileStatus.type === 'success' ? '#34d399' : '#f87171', marginBottom: '1rem' }}>
              {profileStatus.text}
            </p>
          )}

          {isEditingProfile ? (
            <form style={styles.form} onSubmit={handleProfileUpdate}>
              <label style={styles.label}>
                Name
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} style={styles.input} required />
              </label>
              <label style={styles.label}>
                Email (cannot be changed)
                <input type="text" value={user?.email} disabled style={{ ...styles.input, opacity: 0.6 }} />
              </label>
              <label style={styles.label}>
                NIC
                <input type="text" value={profileForm.nic} onChange={e => setProfileForm({ ...profileForm, nic: e.target.value })} style={styles.input} />
              </label>
              <label style={styles.label}>
                Phone
                <input type="text" value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} style={styles.input} />
              </label>
              <label style={styles.label}>
                Address
                <input type="text" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} style={styles.input} />
              </label>
              <button type="submit" className="btn-primary" disabled={profileLoading} style={styles.submit}>
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div style={styles.infoList}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.2rem', display: 'block' }}>Name</label>
                <p style={{ color: '#fff', fontWeight: 500, margin: 0 }}>{user?.name}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.2rem', display: 'block' }}>Email</label>
                <p style={{ color: '#fff', fontWeight: 500, margin: 0 }}>{user?.email}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.2rem', display: 'block' }}>NIC</label>
                <p style={{ color: '#fff', fontWeight: 500, margin: 0 }}>{user?.nic || 'Not provided'}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.2rem', display: 'block' }}>Phone</label>
                <p style={{ color: '#fff', fontWeight: 500, margin: 0 }}>{user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.2rem', display: 'block' }}>Address</label>
                <p style={{ color: '#fff', fontWeight: 500, margin: 0 }}>{user?.address || 'Not provided'}</p>
              </div>
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Change password</h2>
          <form style={styles.form} onSubmit={handlePasswordChange}>
            <label style={styles.label}>
              Current password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              New password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Confirm new password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
                style={styles.input}
              />
            </label>

            {passwordStatus.text && (
              <p
                style={{
                  ...styles.message,
                  color: passwordStatus.type === 'success' ? '#34d399' : '#f87171',
                }}
              >
                {passwordStatus.text}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={passwordLoading} style={styles.submit}>
              {passwordLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>

      {/* Navigation buttons for reservations */}
      <div ref={reservationsSectionRef} style={{
        background: '#0f172a',
        padding: '1.5rem',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setActiveReservationTab('all')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            background: activeReservationTab === 'all' ? '#fbbf24' : 'rgba(255,255,255,0.1)',
            color: activeReservationTab === 'all' ? '#0b132b' : '#fff',
            transition: 'all 0.3s ease'
          }}
        >
          All Reservations
        </button>
        <button
          onClick={() => setActiveReservationTab('room')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            background: activeReservationTab === 'room' ? '#fbbf24' : 'rgba(255,255,255,0.1)',
            color: activeReservationTab === 'room' ? '#0b132b' : '#fff',
            transition: 'all 0.3s ease'
          }}
        >
          Room Reservations ({roomReservations.length})
        </button>
        <button
          onClick={() => setActiveReservationTab('dining')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            background: activeReservationTab === 'dining' ? '#fbbf24' : 'rgba(255,255,255,0.1)',
            color: activeReservationTab === 'dining' ? '#0b132b' : '#fff',
            transition: 'all 0.3s ease'
          }}
        >
          Dining Reservations ({diningReservations.length})
        </button>
        <button
          onClick={() => setActiveReservationTab('event')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            background: activeReservationTab === 'event' ? '#fbbf24' : 'rgba(255,255,255,0.1)',
            color: activeReservationTab === 'event' ? '#0b132b' : '#fff',
            transition: 'all 0.3s ease'
          }}
        >
          Event Plans ({eventPlans.length})
        </button>
      </div>

      {/* Display reservations based on active tab */}
      {(activeReservationTab === 'all' || activeReservationTab === 'room') && (
        <ReservationList
          title="Room reservations"
          items={roomReservations}
          type="room"
          onViewDetails={(item) => { setSelectedReservation({ ...item, type: 'room' }); setIsDetailsOpen(true); }}
        />
      )}
      {(activeReservationTab === 'all' || activeReservationTab === 'dining') && (
        <ReservationList
          title="Dining reservations"
          items={diningReservations}
          type="dining"
          onViewDetails={(item) => { setSelectedReservation({ ...item, type: 'dining' }); setIsDetailsOpen(true); }}
        />
      )}
      {(activeReservationTab === 'all' || activeReservationTab === 'event') && (
        <ReservationList
          title="Event plans"
          items={eventPlans}
          type="event"
          onViewDetails={(item) => { setSelectedReservation({ ...item, type: 'event' }); setIsDetailsOpen(true); }}
        />
      )}

      {isDetailsOpen && selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => { setIsDetailsOpen(false); setSelectedReservation(null); }}
          type={selectedReservation.type}
        />
      )}
    </section>
  )
}

function ReservationDetailsModal({ reservation, onClose, type }) {
  if (!reservation) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem', backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#0f172a', borderRadius: '1rem', padding: '2rem',
        maxWidth: '500px', width: '100%', border: '1px solid rgba(255,255,255,0.1)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: '"Playfair Display", serif', color: '#fff', margin: 0 }}>
            Booking Details
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <DetailRow label="ID" value={reservation.id || reservation._id} />
          <DetailRow label="Status" value={
            <span style={styles.statusPill(reservation.status)}>{formatStatus(reservation.status)}</span>
          } />

          {type === 'room' && (
            <>
              <DetailRow label="Room Type" value={reservation.roomType} />
              <DetailRow label="Guest Name" value={reservation.guestName} />
              <DetailRow label="Check-in" value={formatDate(reservation.checkInDate)} />
              <DetailRow label="Check-out" value={formatDate(reservation.checkOutDate)} />
              <DetailRow label="Total Price" value={`LKR ${reservation.totalPrice}`} />
              <DetailRow label="Add-ons" value={reservation.addons || 'None'} />
            </>
          )}

          {type === 'dining' && (
            <>
              <DetailRow label="Occasion" value={reservation.occasion} />
              <DetailRow label="Date" value={formatDate(reservation.reservationDate)} />
              <DetailRow label="Time" value={reservation.reservationTime} />
              <DetailRow label="Guests" value={reservation.guestCount} />
              <DetailRow label="Special Requests" value={reservation.specialRequests || 'None'} />
              {reservation.orderStatus && (
                <DetailRow label="Order Progress" value={
                  <span style={styles.orderStatusPill(reservation.orderStatus)}>{formatOrderStatus(reservation.orderStatus)}</span>
                } />
              )}
            </>
          )}

          {type === 'event' && (
            <>
              <DetailRow label="Event Type" value={reservation.eventType} />
              <DetailRow label="Venue" value={reservation.venue} />
              <DetailRow label="Date" value={formatDate(reservation.eventDate)} />
              <DetailRow label="Guests" value={reservation.guestCount} />
              <DetailRow label="Special Requests" value={reservation.specialRequests || 'None'} />
            </>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem', paddingTop: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              Contact hotel support to make changes to this booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.85rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <div style={{ color: '#fff', fontSize: '1rem' }}>{value}</div>
    </div>
  )
}

function ReservationList({ title, items, type, onViewDetails }) {
  if (!items.length) {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>{title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>No {type} bookings yet.</p>
      </div>
    )
  }

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>{title}</h2>
      <div style={styles.table}>
        {items.map((item, index) => (
          <div key={item.id || item._id || `${type}-${index}`} style={styles.tableRow}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#fff' }}>{renderTitle(item, type)}</strong>
              <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.9)' }}>{renderSubtitle(item, type)}</p>
              {type === 'dining' && item.orderStatus && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>Order Progress: </span>
                  <span style={styles.orderStatusPill(item.orderStatus)}>{formatOrderStatus(item.orderStatus)}</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span style={styles.statusPill(item.status)}>{formatStatus(item.status)}</span>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                {formatDate(item.eventDate || item.reservationDate || item.date)}
              </p>
              <button
                onClick={() => onViewDetails(item)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '0.2rem'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Booking',
    'approved': 'Approved',
    'confirmed': 'Confirmed',
    'cancelled': 'Cancelled',
    'completed': 'Completed',
    'checked_in': 'Checked In',
    'checked_out': 'Checked Out'
  }
  return statusMap[status] || status
}

function formatOrderStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'preparing': 'Preparing',
    'ready': 'Ready',
    'served': 'Served',
    'completed': 'Completed'
  }
  return statusMap[status] || status
}

function renderTitle(item, type) {
  if (type === 'room') {
    return `${item.roomType || 'Room'} • ${item.guestName || item.fullName || 'Guest'}`
  }
  if (type === 'dining') {
    return `${item.occasion || 'Dining'} • ${item.guestCount || 0} guests`
  }
  return `${item.eventType || 'Event'} • ${item.venue || 'Venue'}`
}

function renderSubtitle(item, type) {
  if (type === 'room') {
    return `${formatDate(item.checkInDate)} → ${formatDate(item.checkOutDate)}`
  }
  if (type === 'dining') {
    return `${formatDate(item.reservationDate)} at ${item.reservationTime || 'N/A'}`
  }
  return `${formatDate(item.eventDate)} · ${item.guestCount || 0} guests`
}

function formatDate(value) {
  if (!value) return 'Date pending'
  const date = new Date(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const styles = {
  section: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0b132b, #1c2541)',
    padding: '4rem 1.5rem',
    color: '#fff',
  },
  card: {
    width: '100%',
    background: '#0f172a',
    borderRadius: '1.5rem',
    padding: '2.5rem',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontSize: '0.8rem',
    color: '#fbbf24',
    margin: 0,
  },
  title: {
    fontSize: '2rem',
    margin: '0.5rem 0',
    fontFamily: '"Playfair Display", serif',
    color: '#fff',
  },
  subtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.5,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    padding: '1rem',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  panel: {
    background: '#0f172a',
    padding: '2rem',
    borderRadius: '1.5rem',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '2rem',
  },
  panelTitle: {
    margin: '0 0 1.5rem',
    fontSize: '1.5rem',
    fontFamily: '"Playfair Display", serif',
    color: '#fff',
  },
  infoList: {
    display: 'grid',
    gap: '1rem',
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
    padding: '0.9rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '1rem',
  },
  submit: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  message: {
    margin: 0,
    fontSize: '0.9rem',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  tableRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  statusPill: (status) => ({
    display: 'inline-flex',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    textTransform: 'capitalize',
    background:
      status === 'approved' || status === 'confirmed'
        ? 'rgba(52, 211, 153, 0.15)'
        : status === 'pending'
          ? 'rgba(250, 204, 21, 0.15)'
          : 'rgba(248, 113, 113, 0.15)',
    color:
      status === 'approved' || status === 'confirmed'
        ? '#34d399'
        : status === 'pending'
          ? '#facc15'
          : '#f87171',
  }),
  orderStatusPill: (status) => ({
    display: 'inline-flex',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    textTransform: 'capitalize',
    fontWeight: '600',
    background:
      status === 'served' || status === 'completed'
        ? 'rgba(52, 211, 153, 0.2)'
        : status === 'ready'
          ? 'rgba(59, 130, 246, 0.2)'
          : status === 'preparing'
            ? 'rgba(251, 146, 60, 0.2)'
            : 'rgba(250, 204, 21, 0.2)',
    color:
      status === 'served' || status === 'completed'
        ? '#10b981'
        : status === 'ready'
          ? '#3b82f6'
          : status === 'preparing'
            ? '#f97316'
            : '#eab308',
  }),
}

