import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkBackendHealth, getErrorMessage } from '../utils/apiHelper'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FaDownload } from 'react-icons/fa'
import {
  getStaffProfile,
  updateStaffProfile,
  getStaffRoomReservations,
  updateStaffRoomReservationStatus,
  getStaffDiningReservations,
  updateStaffDiningReservationStatus,
  getStaffEventPlans,
  updateStaffEventPlanStatus,
} from '../api/client'

export default function Staff() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [backendOnline, setBackendOnline] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
    }
    checkConnection()
  }, [])

  useEffect(() => {
    if (!authLoading && (!token || (user?.role !== 'staff' && user?.role !== 'kitchen_admin'))) {
      navigate('/', { replace: true })
    }
  }, [authLoading, token, user, navigate])

  useEffect(() => {
    setError('')
    setSuccess('')
  }, [activeTab])

  if (authLoading) {
    return (
      <section style={styles.section}>
        <div style={styles.card}>
          <p>Loading...</p>
        </div>
      </section>
    )
  }

  if (!token || (user?.role !== 'staff' && user?.role !== 'kitchen_admin')) {
    return null
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  return (
    <section style={styles.section}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Staff Portal</p>
            <h1 style={styles.title}>Staff Dashboard</h1>
            <p style={styles.subtitle}>Manage your profile and reservations</p>
          </div>
        </div>

        {!backendOnline && (
          <div style={styles.alertError}>
            <strong>⚠️ Backend Offline:</strong> Cannot connect to server at http://localhost:3000. Please start the Spring Boot backend.
          </div>
        )}
        {error && (
          <div style={styles.alertError} onClick={clearMessages}>
            <strong>Error:</strong> {getErrorMessage(error)} <span style={{ float: 'right', cursor: 'pointer', fontSize: '1.2rem' }}>×</span>
          </div>
        )}
        {success && (
          <div style={styles.alertSuccess} onClick={clearMessages}>
            <strong>Success:</strong> {success} <span style={{ float: 'right', cursor: 'pointer', fontSize: '1.2rem' }}>×</span>
          </div>
        )}

        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                clearMessages()
              }}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {activeTab === 'profile' && (
            <ProfileManagement setError={setError} setSuccess={setSuccess} />
          )}
          {activeTab === 'rooms' && (
            <ReservationsManagement type="room" setError={setError} setSuccess={setSuccess} />
          )}
          {activeTab === 'dining' && (
            <ReservationsManagement type="dining" setError={setError} setSuccess={setSuccess} />
          )}
          {activeTab === 'events' && (
            <ReservationsManagement type="event" setError={setError} setSuccess={setSuccess} />
          )}
        </div>
      </div>
    </section>
  )
}

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'rooms', label: 'Room Reservations' },
  { id: 'dining', label: 'Dining Reservations' },
  { id: 'events', label: 'Event Reservations' },
]

// Profile Management Component
function ProfileManagement({ setError, setSuccess }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getStaffProfile()
      const profileData = data?.data || data
      setProfile(profileData)
      setFormData({
        name: profileData.name || '',
        phone_number: profileData.phone_number || '',
        address: profileData.address || '',
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateStaffProfile(formData)
      setSuccess('Profile updated successfully')
      setEditing(false)
      loadProfile()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'))
    }
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading profile...</p>

  return (
    <div>
      <h2 style={styles.sectionTitle}>My Profile</h2>
      {profile && (
        <div>
          {!editing ? (
            <div>
              <div style={styles.profileCard}>
                <div style={styles.profileInfo}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{profile.name}</strong>
                    <p style={styles.tableSubtext}>{profile.email}</p>
                    <p style={styles.tableSubtext}>
                      {profile.employee_id && `Employee ID: ${profile.employee_id} • `}
                      {profile.position && `Position: ${profile.position} • `}
                      {profile.department && `Department: ${profile.department}`}
                    </p>
                    <p style={styles.tableSubtext}>
                      {profile.phone_number && `Phone: ${profile.phone_number}`}
                      {profile.phone_number && profile.address && ' • '}
                      {profile.address && `Address: ${profile.address}`}
                    </p>
                    {profile.hire_date && (
                      <p style={styles.tableSubtext}>
                        Hire Date: {new Date(profile.hire_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button className="btn-primary" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form style={styles.form} onSubmit={handleSubmit}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Edit Profile</h3>
              <div style={styles.formGrid}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'rgba(255,255,255,0.8)' }}>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'rgba(255,255,255,0.8)' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                  <label style={{ color: 'rgba(255,255,255,0.8)' }}>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="3"
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button type="button" className="btn-outline" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

// Reservations Management Component
function ReservationsManagement({ type, setError, setSuccess }) {
  const generatePDF = (res, type) => {
    try {
      const doc = new jsPDF()
      const title = `${type.toUpperCase()} RESERVATION - ${res.guestName || res.name}`

      // Header
      doc.setFontSize(22)
      doc.setTextColor(30, 58, 95)
      doc.text("HOTEL MANAGEMENT SYSTEM", 105, 20, { align: "center" })

      doc.setFontSize(16)
      doc.setTextColor(100, 100, 100)
      doc.text(title, 105, 30, { align: "center" })

      // Horizontal Line
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 35, 190, 35)

      const rows = [
        ["Guest Name", res.guestName || res.name || "N/A"],
        ["Email", res.guestEmail || res.email],
        ["Phone", res.guestPhone || res.phone || "N/A"],
        ["Status", res.status.toUpperCase()]
      ]

      if (type === 'room') {
        rows.unshift(["Reservation Category", "Room Booking"])
        rows.push(["Room Type", res.roomType])
        rows.push(["Check-in Date", formatDate(res.checkInDate)])
        rows.push(["Check-out Date", formatDate(res.checkOutDate)])
        rows.push(["Total Price", `Rs. ${res.totalPrice?.toLocaleString() || 'N/A'}`])
      } else if (type === 'dining') {
        rows.unshift(["Reservation Category", "Dining Reservation"])
        rows.push(["Occasion", res.occasion || 'Dining'])
        rows.push(["Reservation Date", formatDate(res.reservationDate)])
        rows.push(["Reservation Time", res.reservationTime])
        rows.push(["Guest Count", res.guestCount])
        rows.push(["Total Price", `Rs. ${(res.totalPrice || (res.guestCount * 1500)).toLocaleString()}`])
      } else if (type === 'event') {
        rows.unshift(["Reservation Category", "Event Plan"])
        rows.push(["Event Type", res.eventType])
        rows.push(["Event Date", formatDate(res.eventDate)])
        rows.push(["Guest Count", res.guestCount])
        rows.push(["Total Price", `Rs. ${(res.totalPrice || 50000).toLocaleString()}`])
      }

      autoTable(doc, {
        startY: 45,
        head: [["Field", "Details"]],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 11, cellPadding: 5 },
        columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } }
      })

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 285)
        doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' })
      }

      doc.save(`${type}_reservation_${res.id}.pdf`)
      setSuccess('PDF generated successfully!')
    } catch (err) {
      console.error('PDF Error:', err)
      setError('Failed to generate PDF')
    }
  }

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(null)

  useEffect(() => {
    loadReservations()
  }, [type])

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError('')
      let response
      if (type === 'room') {
        response = await getStaffRoomReservations()
      } else if (type === 'dining') {
        response = await getStaffDiningReservations()
      } else if (type === 'event') {
        response = await getStaffEventPlans()
      }

      const data = response?.data || response || []
      const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => (b.id || 0) - (a.id || 0))
      setReservations(sortedData)
    } catch (err) {
      setError(getErrorMessage(err, `Failed to load ${type} reservations`))
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this reservation?')) return

    try {
      if (type === 'room') {
        await updateStaffRoomReservationStatus(id, 'approved')
      } else if (type === 'dining') {
        await updateStaffDiningReservationStatus(id, 'confirmed')
      } else if (type === 'event') {
        await updateStaffEventPlanStatus(id, 'approved')
      }

      setSuccess('Reservation approved successfully!')
      await loadReservations()
      // Second refresh after delay
      setTimeout(async () => {
        await loadReservations()
      }, 1000)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to approve reservation'))
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

    try {
      if (type === 'room') {
        await updateStaffRoomReservationStatus(showCancelModal, 'cancelled', cancelReason)
      } else if (type === 'dining') {
        await updateStaffDiningReservationStatus(showCancelModal, 'cancelled', cancelReason)
      } else if (type === 'event') {
        await updateStaffEventPlanStatus(showCancelModal, 'cancelled', cancelReason)
      }

      setSuccess('Reservation cancelled successfully.')
      setShowCancelModal(null)
      setCancelReason('')
      await loadReservations()
      // Second refresh after delay
      setTimeout(async () => {
        await loadReservations()
      }, 1000)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to cancel reservation'))
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
    return new Date(date).toLocaleDateString()
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading {getTitle()}...</p>

  return (
    <div>
      <h2 style={styles.sectionTitle}>{getTitle()}</h2>

      <div style={styles.table}>
        {reservations.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No reservations found.</p>
        ) : (
          reservations.map((res) => (
            <div key={res.id} style={styles.tableRow}>
              <div style={styles.tableRowContent}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{res.guestName || res.name || 'Guest'}</strong>
                    <span style={styles.statusPill(res.status)}>{res.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {type === 'room' && (
                      <>
                        <p style={styles.tableSubtext}><strong>Type:</strong> {res.roomType}</p>
                        <p style={styles.tableSubtext}><strong>Dates:</strong> {formatDate(res.checkInDate)} - {formatDate(res.checkOutDate)}</p>
                        <p style={styles.tableSubtext}><strong>Total Price:</strong> Rs. {res.totalPrice?.toLocaleString() || 'N/A'}</p>
                      </>
                    )}
                    {type === 'dining' && (
                      <>
                        <p style={styles.tableSubtext}><strong>Occasion:</strong> {res.occasion || 'Dining'}</p>
                        <p style={styles.tableSubtext}><strong>Time:</strong> {formatDate(res.reservationDate)} at {res.reservationTime}</p>
                        <p style={styles.tableSubtext}><strong>Guests:</strong> {res.guestCount}</p>
                        <p style={styles.tableSubtext}><strong>Unit Price:</strong> Rs. {(res.totalPrice ? Math.round(res.totalPrice / res.guestCount) : 1500).toLocaleString()}</p>
                        <p style={styles.tableSubtext}><strong>Total Price:</strong> Rs. {(res.totalPrice || (res.guestCount * 1500)).toLocaleString()}</p>
                      </>
                    )}
                    {type === 'event' && (
                      <>
                        <p style={styles.tableSubtext}><strong>Type:</strong> {res.eventType}</p>
                        <p style={styles.tableSubtext}><strong>Date:</strong> {formatDate(res.eventDate)}</p>
                        <p style={styles.tableSubtext}><strong>Guests:</strong> {res.guestCount}</p>
                        <p style={styles.tableSubtext}><strong>Total Price:</strong> Rs. {(res.totalPrice || 50000).toLocaleString()}</p>
                      </>
                    )}
                    <p style={styles.tableSubtext}><strong>Email:</strong> {res.guestEmail || res.email}</p>
                    <p style={styles.tableSubtext}><strong>Phone:</strong> {res.guestPhone || res.phone || 'N/A'}</p>
                  </div>
                </div>

                <div style={styles.tableActions}>
                  {(res.status === 'pending' || res.status === 'ordered') && (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() => handleApprove(res.id)}
                        style={{ background: '#10b981', borderColor: '#10b981', padding: '0.5rem 1rem' }}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => handleCancelClick(res.id)}
                        style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.5rem 1rem' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    className="btn-outline"
                    onClick={() => generatePDF(res, type)}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FaDownload /> PDF
                  </button>
                  {res.status !== 'pending' && res.status !== 'cancelled' && res.status !== 'confirmed' && (
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No further actions</span>
                  )}
                  {res.status === 'confirmed' && (
                    <button
                      className="btn-outline"
                      onClick={() => handleCancelClick(res.id)}
                      style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.5rem 1rem' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1e293b',
            padding: '2rem',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Cancel Reservation</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
              Please provide a reason for cancellation.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows="4"
              style={{ ...styles.input, marginBottom: '1.5rem' }}
              placeholder="e.g. Venue unavailable, Fully booked..."
            />
            <div style={styles.formActions}>
              <button
                className="btn-primary"
                onClick={handleCancelConfirm}
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                Confirm Cancel
              </button>
              <button
                className="btn-outline"
                onClick={() => setShowCancelModal(null)}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  section: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '2rem 1rem',
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#1e293b',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    marginBottom: '2rem',
  },
  kicker: {
    color: 'var(--accent)',
    textTransform: 'uppercase',
    fontSize: '0.875rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '2rem',
    overflowX: 'auto',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: 'var(--accent)',
    borderBottomColor: 'var(--accent)',
  },
  content: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  form: {
    background: '#334155',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: '#475569',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  tableRow: {
    background: '#334155',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableRowContent: {
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  tableSubtext: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '0.25rem',
  },
  tableActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  profileCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  statCard: {
    background: '#334155',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#fff',
    marginTop: '0.5rem',
  },
  statusPill: (status) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    background:
      status === 'pending'
        ? 'rgba(245, 158, 11, 0.2)'
        : status === 'approved' || status === 'confirmed' || status === 'completed'
          ? 'rgba(16, 185, 129, 0.2)'
          : 'rgba(239, 68, 68, 0.2)',
    color:
      status === 'pending'
        ? '#f59e0b'
        : status === 'approved' || status === 'confirmed' || status === 'completed'
          ? '#10b981'
          : '#ef4444',
    border: `1px solid ${status === 'pending'
      ? '#f59e0b'
      : status === 'approved' || status === 'confirmed' || status === 'completed'
        ? '#10b981'
        : '#ef4444'
      }`,
  }),
}

