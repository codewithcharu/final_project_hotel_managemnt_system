import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkBackendHealth, getErrorMessage } from '../utils/apiHelper'
import ReservationsModal from '../components/ReservationsModal'
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getDiningTypes,
  createDiningType,
  updateDiningType,
  deleteDiningType,
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  getKitchenOrders,
  updateKitchenOrderStatus,
  getUsers,
  updateUser,
  getReports,
  getRevenueReport,
  getAllRoomReservations,
  updateRoomReservationStatus,
  updateRoomReservation,
  getAllDiningReservations,
  updateDiningReservationStatus,
  getAllEventPlans,
  updateEventPlanStatus,
  getContactInquiries,
  updateInquiryStatus,
  replyToInquiry,
} from '../api/client'

export default function Admin() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [backendOnline, setBackendOnline] = useState(true)

  // Check backend health and authentication on mount
  useEffect(() => {
    async function checkConnection() {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
      if (!isOnline) {
        setError('Backend server is not accessible. Please ensure Spring Boot is running on http://localhost:3000')
        return
      }

      // Test authentication if user is logged in
      if (token && user?.role === 'admin') {
        try {
          const { testAuth } = await import('../api/client')
          const authInfo = await testAuth()
          console.log('Auth info:', authInfo)
          if (!authInfo?.authenticated) {
            setError('Authentication failed. Please log out and log in again.')
          }
        } catch (err) {
          console.error('Auth test failed:', err)
          // Don't show error for test endpoint failures
        }
      }
    }

    checkConnection()
  }, [token, user])

  useEffect(() => {
    if (!authLoading && (!token || user?.role !== 'admin')) {
      navigate('/', { replace: true })
    }
  }, [authLoading, token, user, navigate])

  // Clear error/success messages when switching tabs
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

  if (!token || user?.role !== 'admin') {
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
            <p style={styles.kicker}>Administration</p>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Manage all aspects of the hotel management system</p>
          </div>
        </div>

        {!backendOnline && (
          <div style={styles.alertError}>
            <strong>⚠️ Backend Offline:</strong> Cannot connect to server at http://localhost:3000. Please start the Spring Boot backend.
            <br />
            <small>Run: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>cd backend && mvn spring-boot:run</code></small>
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
          {!token || user?.role !== 'admin' ? (
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading authentication...</p>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'room-types' && (
                <RoomTypesManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'dining-types' && (
                <DiningTypesManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'event-types' && (
                <EventTypesManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'staff' && (
                <StaffManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'inventory' && (
                <InventoryManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'kitchen-orders' && (
                <KitchenOrdersManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'users' && (
                <UserManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'contact-inquiries' && (
                <InquiriesManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'reservations' && (
                <ReservationsManagement setError={setError} setSuccess={setSuccess} />
              )}
              {activeTab === 'reports' && (
                <ReportsManagement setError={setError} setSuccess={setSuccess} />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'reservations', label: 'Reservations' },
  { id: 'room-types', label: 'Room Types' },
  { id: 'dining-types', label: 'Dining Types' },
  { id: 'event-types', label: 'Event Types' },
  { id: 'staff', label: 'Staff' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'kitchen-orders', label: 'Kitchen Orders' },
  { id: 'users', label: 'Users' },
  { id: 'contact-inquiries', label: 'Contact Inquiries' },
  { id: 'reports', label: 'Reports' },
]

// Dashboard Component
function Dashboard({ setError, setSuccess }) {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRoomReservations, setShowRoomReservations] = useState(false)
  const [showDiningReservations, setShowDiningReservations] = useState(false)
  const [showEventReservations, setShowEventReservations] = useState(false)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading dashboard reports...')
      const response = await getReports()
      console.log('Reports response:', response)
      const reportsData = response?.data || response
      console.log('Reports data:', reportsData)
      setReports(reportsData)
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(getErrorMessage(err, 'Failed to load dashboard reports'))
      // Set default empty reports structure so UI doesn't break
      setReports({
        rooms: { total_reservations: 0, pending: 0, approved: 0, completed: 0, total_revenue: 0 },
        dining: { total_reservations: 0, pending: 0, confirmed: 0, total_revenue: 0 },
        events: { total_events: 0, pending: 0, approved: 0, total_revenue: 0 },
        users: { total_users: 0, customers: 0, staff_count: 0 },
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading dashboard...</p>

  // Show default structure if reports is null
  if (!reports) {
    return (
      <div>
        <h2 style={styles.sectionTitle}>System Overview</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>No data available. Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ ...styles.sectionTitle, color: '#fff', fontWeight: 'bold' }}>System Overview</h2>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={{ color: '#fff', margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Room Reservations</h3>
          <p style={styles.statNumber}>{reports.rooms?.total_reservations || 0}</p>
          <div style={styles.statDetails}>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Booking: {reports.rooms?.pending || 0}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Approved: {reports.rooms?.approved || 0}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Completed: {reports.rooms?.completed || 0}</span>
          </div>
          <p style={styles.statRevenue}>Revenue: Rs. {reports.rooms?.total_revenue?.toLocaleString() || 0}</p>
          <button
            className="btn-primary"
            onClick={() => setShowRoomReservations(true)}
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}
          >
            View All Room Reservations
          </button>
        </div>

        <div style={styles.statCard}>
          <h3 style={{ color: '#fff', margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: '600', wordBreak: 'break-word' }}>Dining Reservations</h3>
          <p style={styles.statNumber}>{reports.dining?.total_reservations || 0}</p>
          <div style={styles.statDetails}>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Booking: {reports.dining?.pending || 0}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Confirmed: {reports.dining?.confirmed || 0}</span>
          </div>
          <p style={styles.statRevenue}>Revenue: Rs. {reports.dining?.total_revenue?.toLocaleString() || 0}</p>
          <button
            className="btn-primary"
            onClick={() => setShowDiningReservations(true)}
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}
          >
            View All Dining Reservations
          </button>
        </div>

        <div style={styles.statCard}>
          <h3 style={{ color: '#fff', margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Events</h3>
          <p style={styles.statNumber}>{reports.events?.total_events || 0}</p>
          <div style={styles.statDetails}>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Booking: {reports.events?.pending || 0}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Approved: {reports.events?.approved || 0}</span>
          </div>
          <p style={styles.statRevenue}>Revenue: Rs. {reports.events?.total_revenue?.toLocaleString() || 0}</p>
          <button
            className="btn-primary"
            onClick={() => setShowEventReservations(true)}
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}
          >
            View All Event Reservations
          </button>
        </div>

        <div style={styles.statCard}>
          <h3 style={{ color: '#fff', margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Users</h3>
          <p style={styles.statNumber}>{reports.users?.total_users || 0}</p>
          <div style={styles.statDetails}>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Customers: {reports.users?.customers || 0}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Staff: {reports.users?.staff_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Room Reservations Modal */}
      {showRoomReservations && (
        <ReservationsModal
          type="room"
          onClose={() => setShowRoomReservations(false)}
          setError={setError}
          setSuccess={setSuccess}
          onRefresh={loadReports}
        />
      )}

      {/* Dining Reservations Modal */}
      {showDiningReservations && (
        <ReservationsModal
          type="dining"
          onClose={() => setShowDiningReservations(false)}
          setError={setError}
          setSuccess={setSuccess}
          onRefresh={loadReports}
        />
      )}

      {/* Event Reservations Modal */}
      {showEventReservations && (
        <ReservationsModal
          type="event"
          onClose={() => setShowEventReservations(false)}
          setError={setError}
          setSuccess={setSuccess}
          onRefresh={loadReports}
        />
      )}
    </div>
  )
}

// Room Types Management Component
function RoomTypesManagement({ setError, setSuccess }) {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deletedRoomType, setDeletedRoomType] = useState(null)
  const [showUndo, setShowUndo] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_night: '',
    capacity: '2',
    room_count: '1',
    amenities: '',
    image_url: '',
    is_available: true,
  })

  useEffect(() => {
    loadRoomTypes()
  }, [])

  const loadRoomTypes = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading room types...')
      const response = await getRoomTypes()
      console.log('Room types response:', response)

      // Handle different response formats
      let roomTypesData = []
      if (Array.isArray(response)) {
        roomTypesData = response
      } else if (response?.data) {
        roomTypesData = Array.isArray(response.data) ? response.data : []
      } else if (response?.success && response?.data) {
        roomTypesData = Array.isArray(response.data) ? response.data : []
      }

      console.log('Processed room types:', roomTypesData)
      setRoomTypes(roomTypesData)
    } catch (err) {
      console.error('Room types load error:', err)
      setError(getErrorMessage(err, 'Failed to load room types'))
      setRoomTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      const payload = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        capacity: parseInt(formData.capacity),
        room_count: parseInt(formData.room_count) || 1,
      }
      if (editing) {
        await updateRoomType(editing.id, payload)
        setSuccess('Room type updated successfully')
      } else {
        const result = await createRoomType(payload)
        console.log('Room type created, response:', result)
        setSuccess('Room type created successfully')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({
        name: '',
        description: '',
        price_per_night: '',
        capacity: '2',
        room_count: '1',
        amenities: '',
        image_url: '',
        is_available: true,
      })
      // Reload data immediately and again after a delay to ensure backend has processed
      await loadRoomTypes()
      setTimeout(async () => {
        await loadRoomTypes()
      }, 1000)
    } catch (err) {
      console.error('Error saving room type:', err)
      let errorMessage = getErrorMessage(err, 'Failed to save room type')

      // Check if it's the image_url truncation error
      if (errorMessage.includes('Data too long for column') || errorMessage.includes('image_url')) {
        errorMessage = `Image is too large for database. Please run this SQL script in MySQL Workbench to fix:\n\nUSE hotel_management_system;\nALTER TABLE room_types MODIFY COLUMN image_url LONGTEXT;\n\nOr execute: backend/models/fix_image_url_size.sql\n\nThen restart the backend and try again.`
      }

      setError(errorMessage)
    }
  }

  const handleEdit = (roomType) => {
    setEditing(roomType)
    setFormData({
      name: roomType.name || '',
      description: roomType.description || '',
      price_per_night: roomType.pricePerNight || roomType.price_per_night || '',
      capacity: String(roomType.capacity || 2),
      room_count: String(roomType.roomCount || roomType.room_count || 1),
      amenities: roomType.amenities || '',
      image_url: roomType.imageUrl || roomType.image_url || '',
      is_available: roomType.isAvailable !== undefined ? roomType.isAvailable : roomType.is_available !== false,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return

    // Find the room type to be deleted
    const roomTypeToDelete = roomTypes.find(rt => rt.id === id || rt.roomTypeId === id)

    try {
      await deleteRoomType(id)

      // Store deleted room type data for undo
      if (roomTypeToDelete) {
        setDeletedRoomType({
          ...roomTypeToDelete,
          deletedId: id
        })
        setShowUndo(true)
        // Hide undo option after 10 seconds
        setTimeout(() => {
          setShowUndo(false)
          setDeletedRoomType(null)
        }, 10000)
      }

      setSuccess('Room type deleted successfully. You can undo this action.')
      loadRoomTypes()
    } catch (err) {
      setError(err.message || 'Failed to delete room type')
    }
  }

  const handleUndo = async () => {
    if (!deletedRoomType) return

    try {
      setError('')
      const payload = {
        name: deletedRoomType.name,
        description: deletedRoomType.description || '',
        price_per_night: deletedRoomType.pricePerNight || deletedRoomType.price_per_night || 0,
        capacity: deletedRoomType.capacity || 2,
        amenities: deletedRoomType.amenities || '',
        image_url: deletedRoomType.imageUrl || deletedRoomType.image_url || '',
        is_available: deletedRoomType.isAvailable !== undefined ? deletedRoomType.isAvailable : (deletedRoomType.is_available !== false),
      }

      await createRoomType(payload)
      setSuccess('Room type restored successfully')
      setShowUndo(false)
      setDeletedRoomType(null)
      await loadRoomTypes()
      setTimeout(async () => {
        await loadRoomTypes()
      }, 1000)
    } catch (err) {
      console.error('Error restoring room type:', err)
      setError(err.message || 'Failed to restore room type')
    }
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading room types...</p>

  return (
    <div>
      {showUndo && deletedRoomType && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '1px solid rgba(34, 197, 94, 0.5)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <span style={{ color: '#fff', flex: 1 }}>
            Room type "{deletedRoomType.name}" was deleted.
          </span>
          <button
            className="btn-primary"
            onClick={handleUndo}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap'
            }}
          >
            Undo
          </button>
        </div>
      )}
      <div style={styles.sectionHeader}>
        <h2 style={{ ...styles.sectionTitle, color: '#fff', fontWeight: 'bold', margin: 0 }}>Room Types</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', description: '', price_per_night: '', capacity: '2', room_count: '1', amenities: '', image_url: '', is_available: true }) }}>
          Add Room Type
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>{editing ? 'Edit' : 'Create'} Room Type</h3>
          <div style={styles.formGrid}>
            <label>
              Name *
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
              />
            </label>
            <label>
              Price per Night (Rs.) *
              <input
                type="number"
                step="0.01"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                required
                style={styles.input}
              />
            </label>
            <label>
              Capacity *
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
                style={styles.input}
              />
            </label>
            <label>
              Total Rooms *
              <input
                type="number"
                min="1"
                value={formData.room_count}
                onChange={(e) => setFormData({ ...formData, room_count: e.target.value })}
                required
                style={styles.input}
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Image (JPG/JPEG) or Image URL</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    id="room-image-upload"
                    accept="image/jpeg,image/jpg,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        // Validate file extension
                        const fileName = file.name.toLowerCase()
                        const validExtensions = ['.jpg', '.jpeg']
                        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

                        // Validate file type
                        if (!file.type.match(/image\/(jpeg|jpg)/i) && !hasValidExtension) {
                          setError('Please select a JPG or JPEG image file')
                          e.target.value = '' // Clear the input
                          return
                        }
                        // Validate file size (max 5MB before compression)
                        if (file.size > 5 * 1024 * 1024) {
                          setError('Image size must be less than 5MB')
                          e.target.value = '' // Clear the input
                          return
                        }
                        // Clear any existing URL when file is selected
                        setError('')

                        // Compress and convert to base64
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const img = new Image()
                          img.onload = () => {
                            // Create canvas for compression
                            const canvas = document.createElement('canvas')
                            let width = img.width
                            let height = img.height

                            // Calculate new dimensions (max 600px, maintain aspect ratio)
                            // Smaller size = smaller base64 string (more aggressive compression)
                            const maxWidth = 600
                            const maxHeight = 600
                            if (width > maxWidth) {
                              height = (height * maxWidth) / width
                              width = maxWidth
                            }
                            if (height > maxHeight) {
                              width = (width * maxHeight) / height
                              height = maxHeight
                            }

                            canvas.width = width
                            canvas.height = height

                            // Draw and compress
                            const ctx = canvas.getContext('2d')
                            ctx.drawImage(img, 0, 0, width, height)

                            // Try multiple quality levels to get under size limit
                            // Using smaller max size (200KB) to work with TEXT column (65KB) or LONGTEXT
                            let compressedBase64 = null
                            const qualities = [0.5, 0.4, 0.3, 0.2, 0.15] // More aggressive compression
                            const maxSize = 200 * 1024 // Max 200KB base64 string (safe limit)

                            for (const quality of qualities) {
                              compressedBase64 = canvas.toDataURL('image/jpeg', quality)
                              if (compressedBase64.length <= maxSize) {
                                break
                              }
                            }

                            // Final check - if still too large, reject
                            if (compressedBase64.length > maxSize) {
                              setError(`Image is too large even after compression (${(compressedBase64.length / 1024).toFixed(1)}KB). Please use a smaller image or image URL. IMPORTANT: Run SQL script: backend/models/fix_image_url_size.sql to fix database column.`)
                              e.target.value = ''
                              setFormData({ ...formData, image_url: '' })
                              return
                            }

                            setFormData({ ...formData, image_url: compressedBase64 })
                            setSuccess(`Image compressed successfully (${(compressedBase64.length / 1024).toFixed(1)}KB)`)
                          }
                          img.onerror = () => {
                            setError('Failed to load image file')
                            e.target.value = ''
                          }
                          img.src = reader.result
                        }
                        reader.onerror = () => {
                          setError('Failed to read image file')
                          e.target.value = '' // Clear the input
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    style={{ ...styles.input, padding: '0.5rem' }}
                  />
                  <small style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '0.25rem' }}>
                    Select a JPG/JPEG image file (max 5MB, will be compressed automatically)
                  </small>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    placeholder="Or enter image URL"
                    value={formData.image_url && !formData.image_url.startsWith('data:') ? formData.image_url : ''}
                    onChange={(e) => {
                      const urlValue = e.target.value
                      // Clear file input when URL is entered
                      const fileInput = document.getElementById('room-image-upload')
                      if (fileInput) fileInput.value = ''
                      setFormData({ ...formData, image_url: urlValue })
                    }}
                    style={styles.input}
                  />
                  <small style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '0.25rem' }}>
                    Or paste an image URL
                  </small>
                </div>
              </div>
              {formData.image_url && (
                <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image_url: '' })
                      const fileInput = document.getElementById('room-image-upload')
                      if (fileInput) fileInput.value = ''
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                style={styles.input}
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Amenities
              <textarea
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                rows="2"
                style={styles.input}
              />
            </label>
            <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              />
              Available
            </label>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.table}>
        {!loading && roomTypes.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.9)', padding: '2rem', textAlign: 'center' }}>No room types found. Create one to get started.</p>
        ) : roomTypes.length > 0 ? (
          roomTypes.map((rt) => {
            const roomTypeId = rt.id || rt.roomTypeId
            const roomTypeName = rt.name || 'Unnamed Room Type'
            const price = rt.pricePerNight || rt.price_per_night || 0
            const capacity = rt.capacity || 2
            const isAvailable = rt.isAvailable !== undefined ? rt.isAvailable : (rt.is_available !== false)

            return (
              <div key={roomTypeId} style={styles.tableRow}>
                <div style={styles.tableRowContent}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{roomTypeName}</strong>
                    <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>{rt.description || 'No description'}</p>
                    <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                      Rs. {typeof price === 'number' ? price.toLocaleString() : price} per night • Capacity: {capacity} • Total Rooms: {rt.roomCount || rt.room_count || 1} • {isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                  <div style={styles.tableActions}>
                    <button className="btn-outline" onClick={() => handleEdit(rt)}>Edit</button>
                    <button className="btn-outline" onClick={() => handleDelete(roomTypeId)} style={{ color: '#f87171' }}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.9)', padding: '2rem', textAlign: 'center' }}>Loading room types...</p>
        )}
      </div>
    </div>
  )
}

// Dining Types Management Component
function DiningTypesManagement({ setError, setSuccess }) {
  const [diningTypes, setDiningTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'breakfast',
    price: '',
    image_url: '',
    is_available: true,
  })

  useEffect(() => {
    loadDiningTypes()
  }, [])

  const loadDiningTypes = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading dining types...')
      const data = await getDiningTypes()
      console.log('Dining types response:', data)
      setDiningTypes(data?.data || data || [])
    } catch (err) {
      console.error('Dining types load error:', err)
      setError(getErrorMessage(err, 'Failed to load dining types'))
      setDiningTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
      }
      if (editing) {
        await updateDiningType(editing.id, payload)
        setSuccess('Dining type updated successfully')
      } else {
        await createDiningType(payload)
        setSuccess('Dining type created successfully')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', description: '', category: 'breakfast', price: '', image_url: '', is_available: true })
      // Reload data after a short delay to ensure backend has processed
      setTimeout(() => {
        loadDiningTypes()
      }, 500)
    } catch (err) {
      setError(err.message || 'Failed to save dining type')
    }
  }

  const handleEdit = (dt) => {
    setEditing(dt)
    setFormData({
      name: dt.name || '',
      description: dt.description || '',
      category: dt.category || 'breakfast',
      price: dt.price || '',
      image_url: dt.imageUrl || dt.image_url || '',
      is_available: dt.isAvailable !== undefined ? dt.isAvailable : dt.is_available !== false,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dining type?')) return
    try {
      await deleteDiningType(id)
      setSuccess('Dining type deleted successfully')
      loadDiningTypes()
    } catch (err) {
      setError(err.message || 'Failed to delete dining type')
    }
  }

  if (loading) return <p>Loading dining types...</p>

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Dining Types</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', description: '', category: 'breakfast', price: '', image_url: '', is_available: true }) }}>
          Add Dining Type
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>{editing ? 'Edit' : 'Create'} Dining Type</h3>
          <div style={styles.formGrid}>
            <label>
              Name *
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
            </label>
            <label>
              Category *
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required style={styles.input}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="beverages">Beverages</option>
                <option value="snacks">Snacks</option>
              </select>
            </label>
            <label>
              Price (Rs.) *
              <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required style={styles.input} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" style={styles.input} />
            </label>
            <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} />
              Available
            </label>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.table}>
        {diningTypes.length === 0 ? (
          <p>No dining types found. Create one to get started.</p>
        ) : (
          diningTypes.map((dt) => (
            <div key={dt.id} style={styles.tableRow}>
              <div style={styles.tableRowContent}>
                <div>
                  <strong>{dt.name}</strong>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>{dt.description || 'No description'}</p>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    {dt.category} • Rs. {dt.price} • {dt.isAvailable !== false && dt.is_available !== false ? 'Available' : 'Unavailable'}
                  </p>
                </div>
                <div style={styles.tableActions}>
                  <button className="btn-outline" onClick={() => handleEdit(dt)}>Edit</button>
                  <button className="btn-outline" onClick={() => handleDelete(dt.id)} style={{ color: '#f87171' }}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Event Types Management Component
function EventTypesManagement({ setError, setSuccess }) {
  const [eventTypes, setEventTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    capacity: '',
    venue_options: '',
    image_url: '',
    is_available: true,
  })

  useEffect(() => {
    loadEventTypes()
  }, [])

  const loadEventTypes = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading event types...')
      const response = await getEventTypes()
      console.log('Event types response:', response)

      // Handle different response formats
      let eventTypesData = []
      if (Array.isArray(response)) {
        eventTypesData = response
      } else if (response?.data) {
        eventTypesData = Array.isArray(response.data) ? response.data : []
      } else if (response?.success && response?.data) {
        eventTypesData = Array.isArray(response.data) ? response.data : []
      }

      console.log('Processed event types:', eventTypesData)
      setEventTypes(eventTypesData)
    } catch (err) {
      console.error('Event types load error:', err)
      setError(getErrorMessage(err, 'Failed to load event types'))
      setEventTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')

      // Validate image size before submitting
      if (formData.image_url && formData.image_url.startsWith('data:')) {
        const imageSize = formData.image_url.length
        const maxSize = 200 * 1024

        if (imageSize > maxSize) {
          setError(`Image is too large (${(imageSize / 1024).toFixed(1)}KB). Please compress it further or use an image URL.`)
          return
        }
      }

      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        capacity: parseInt(formData.capacity),
      }
      if (editing) {
        await updateEventType(editing.id, payload)
        setSuccess('Event type updated successfully')
      } else {
        await createEventType(payload)
        setSuccess('Event type created successfully')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', description: '', base_price: '', capacity: '', venue_options: '', image_url: '', is_available: true })
      // Clear file input
      const fileInput = document.getElementById('event-image-upload')
      if (fileInput) fileInput.value = ''
      // Reload data immediately and again after a delay to ensure backend has processed
      await loadEventTypes()
      setTimeout(async () => {
        await loadEventTypes()
      }, 1000)
    } catch (err) {
      console.error('Error saving event type:', err)
      let errorMessage = getErrorMessage(err, 'Failed to save event type')

      // Check if it's the image_url truncation error
      if (errorMessage.includes('Data too long for column') || errorMessage.includes('image_url')) {
        errorMessage = `Image is too large for database. Please run this SQL script in MySQL Workbench to fix:\n\nUSE hotel_management_system;\nALTER TABLE event_types MODIFY COLUMN image_url LONGTEXT;\n\nOr execute: backend/models/fix_image_url_size.sql\n\nThen restart the backend and try again.`
      }

      setError(errorMessage)
    }
  }

  const handleEdit = (et) => {
    setEditing(et)
    setFormData({
      name: et.name || '',
      description: et.description || '',
      base_price: et.basePrice || et.base_price || '',
      capacity: String(et.capacity || ''),
      venue_options: et.venueOptions || et.venue_options || '',
      image_url: et.imageUrl || et.image_url || '',
      is_available: et.isAvailable !== undefined ? et.isAvailable : et.is_available !== false,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event type?')) return
    try {
      await deleteEventType(id)
      setSuccess('Event type deleted successfully')
      loadEventTypes()
    } catch (err) {
      setError(err.message || 'Failed to delete event type')
    }
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading event types...</p>

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Event Types</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', description: '', base_price: '', capacity: '', venue_options: '', image_url: '', is_available: true }) }}>
          Add Event Type
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>{editing ? 'Edit' : 'Create'} Event Type</h3>
          <div style={styles.formGrid}>
            <label>
              <span style={{ color: '#fff', fontWeight: '500' }}>Name *</span>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
            </label>
            <label>
              <span style={{ color: '#fff', fontWeight: '500' }}>Base Price (Rs.) *</span>
              <input type="number" step="0.01" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} required style={styles.input} />
            </label>
            <label>
              <span style={{ color: '#fff', fontWeight: '500' }}>Capacity *</span>
              <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required style={styles.input} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#fff', fontWeight: '500' }}>Description</span>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" style={styles.input} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#fff', fontWeight: '500' }}>Venue Options</span>
              <textarea value={formData.venue_options} onChange={(e) => setFormData({ ...formData, venue_options: e.target.value })} rows="2" style={styles.input} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#fff', display: 'block', marginBottom: '0.5rem' }}>Image (JPG/JPEG) or Image URL</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    id="event-image-upload"
                    accept="image/jpeg,image/jpg,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const fileName = file.name.toLowerCase()
                        const validExtensions = ['.jpg', '.jpeg']
                        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

                        if (!file.type.match(/image\/(jpeg|jpg)/i) && !hasValidExtension) {
                          setError('Please select a JPG or JPEG image file')
                          e.target.value = ''
                          return
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          setError('Image size must be less than 5MB')
                          e.target.value = ''
                          return
                        }
                        setError('')

                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const img = new Image()
                          img.onload = () => {
                            const canvas = document.createElement('canvas')
                            let width = img.width
                            let height = img.height

                            const maxWidth = 600
                            const maxHeight = 600
                            if (width > maxWidth) {
                              height = (height * maxWidth) / width
                              width = maxWidth
                            }
                            if (height > maxHeight) {
                              width = (width * maxHeight) / height
                              height = maxHeight
                            }

                            canvas.width = width
                            canvas.height = height

                            const ctx = canvas.getContext('2d')
                            ctx.drawImage(img, 0, 0, width, height)

                            let compressedBase64 = null
                            const qualities = [0.5, 0.4, 0.3, 0.2, 0.15]
                            const maxSize = 200 * 1024

                            for (const quality of qualities) {
                              compressedBase64 = canvas.toDataURL('image/jpeg', quality)
                              if (compressedBase64.length <= maxSize) {
                                break
                              }
                            }

                            if (compressedBase64.length > maxSize) {
                              setError(`Image is too large even after compression. Please use a smaller image or image URL.`)
                              e.target.value = ''
                              setFormData({ ...formData, image_url: '' })
                              return
                            }

                            setFormData({ ...formData, image_url: compressedBase64 })
                            setSuccess(`Image compressed successfully (${(compressedBase64.length / 1024).toFixed(1)}KB)`)
                          }
                          img.onerror = () => {
                            setError('Failed to load image file')
                            e.target.value = ''
                          }
                          img.src = reader.result
                        }
                        reader.onerror = () => {
                          setError('Failed to read image file')
                          e.target.value = ''
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    style={{ ...styles.input, padding: '0.5rem' }}
                  />
                  <small style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '0.25rem' }}>
                    Select a JPG/JPEG image file (max 5MB, will be compressed automatically)
                  </small>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    placeholder="Or enter image URL"
                    value={formData.image_url && !formData.image_url.startsWith('data:') ? formData.image_url : ''}
                    onChange={(e) => {
                      const urlValue = e.target.value
                      const fileInput = document.getElementById('event-image-upload')
                      if (fileInput) fileInput.value = ''
                      setFormData({ ...formData, image_url: urlValue })
                    }}
                    style={styles.input}
                  />
                  <small style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '0.25rem' }}>
                    Or paste an image URL
                  </small>
                </div>
              </div>
              {formData.image_url && (
                <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image_url: '' })
                      const fileInput = document.getElementById('event-image-upload')
                      if (fileInput) fileInput.value = ''
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </label>
            <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} />
              <span style={{ color: '#fff' }}>Available</span>
            </label>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.table}>
        {eventTypes.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.9)', padding: '2rem', textAlign: 'center' }}>No event types found. Create one to get started.</p>
        ) : (
          eventTypes.map((et) => {
            const eventTypeId = et.id || et.eventTypeId
            const eventTypeName = et.name || 'Unnamed Event Type'
            const price = et.basePrice || et.base_price || 0
            const capacity = et.capacity || 0
            const isAvailable = et.isAvailable !== undefined ? et.isAvailable : (et.is_available !== false)

            return (
              <div key={eventTypeId} style={styles.tableRow}>
                <div style={styles.tableRowContent}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{eventTypeName}</strong>
                    <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>{et.description || 'No description'}</p>
                    <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                      Rs. {typeof price === 'number' ? price.toLocaleString() : price} • Capacity: {capacity} • {isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                  <div style={styles.tableActions}>
                    <button className="btn-outline" onClick={() => handleEdit(et)}>Edit</button>
                    <button className="btn-outline" onClick={() => handleDelete(eventTypeId)} style={{ color: '#f87171' }}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Staff Management Component
function StaffManagement({ setError, setSuccess }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nic: '',
    phone_number: '',
    address: '',
    role: 'staff',
    employee_id: '', // Will be auto-generated by backend
    department: '',
    position: '',
    hire_date: '',
    salary: '',
  })

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading staff...')
      const data = await getStaff()
      console.log('Staff response:', data)
      setStaff(data?.data || data || [])
    } catch (err) {
      console.error('Staff load error:', err)
      setError(getErrorMessage(err, 'Failed to load staff'))
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      // Remove employee_id from payload - backend will auto-generate it
      delete payload.employee_id
      if (formData.salary) payload.salary = parseFloat(formData.salary)
      if (editing) {
        // For updates, include employee_id if it exists
        if (editing.employee_id) payload.employee_id = editing.employee_id
        await updateStaff(editing.id, payload)
        setSuccess('Staff member updated successfully')
      } else {
        const result = await createStaff(payload)
        if (result?.data?.password) {
          setSuccess(`Staff created! Employee ID: ${result.data.employee_id || 'Generated'}, Password: ${result.data.password} (Email may have failed to send)`)
        } else {
          setSuccess('Staff member created successfully. Credentials sent to email.')
        }
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', email: '', nic: '', phone_number: '', address: '', role: 'staff', employee_id: '', department: '', position: '', hire_date: '', salary: '' })
      // Reload data after a short delay to ensure backend has processed
      setTimeout(() => {
        loadStaff()
      }, 500)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save staff member'))
    }
  }

  const handleEdit = (s) => {
    setEditing(s)
    setFormData({
      name: s.name || '',
      email: s.email || '',
      nic: s.nic || '',
      phone_number: s.phone_number || '',
      address: s.address || '',
      role: s.role || 'staff',
      employee_id: s.employee_id || '',
      department: s.department || '',
      position: s.position || '',
      hire_date: s.hire_date || '',
      salary: s.salary || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to disable this staff member?')) return
    try {
      await deleteStaff(id)
      setSuccess('Staff member disabled successfully')
      loadStaff()
    } catch (err) {
      setError(err.message || 'Failed to disable staff member')
    }
  }

  if (loading) return <p>Loading staff...</p>

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Staff Management</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', email: '', nic: '', phone_number: '', address: '', role: 'staff', employee_id: '', department: '', position: '', hire_date: '', salary: '' }) }}>
          Add Staff
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>{editing ? 'Edit' : 'Create'} Staff Member</h3>
          <div style={styles.formGrid}>
            <label>
              Name *
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
            </label>
            <label>
              Email *
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={styles.input} />
            </label>
            <label>
              NIC
              <input type="text" value={formData.nic} onChange={(e) => setFormData({ ...formData, nic: e.target.value })} style={styles.input} />
            </label>
            <label>
              Phone Number
              <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} style={styles.input} />
            </label>
            <label>
              Role *
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required style={styles.input}>
                <option value="staff">Staff</option>
                <option value="kitchen_admin">Kitchen Admin</option>
              </select>
            </label>
            <label>
              Employee ID
              <input type="text" value={formData.employee_id || 'Auto-generated'} disabled style={{ ...styles.input, opacity: 0.6, cursor: 'not-allowed' }} />
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Employee ID will be auto-generated</small>
            </label>
            <label>
              Department
              <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} style={styles.input} />
            </label>
            <label>
              Position
              <select
                value={formData.position}
                onChange={(e) => {
                  const position = e.target.value
                  const positionSalaries = {
                    'Branch Manager': 120000,
                    'Receptionist': 70000,
                    'Chef': 80000,
                    'Kitchen Staff': 80000,
                    'Housekeeping Staff': 55000,
                    'Maintenance Staff': 65000,
                    'Technical Staff': 65000
                  }
                  setFormData({
                    ...formData,
                    position: position,
                    salary: positionSalaries[position] || formData.salary
                  })
                }}
                style={styles.input}
              >
                <option value="">Select Position</option>
                <option value="Branch Manager">Branch Manager (Rs. 120,000)</option>
                <option value="Receptionist">Receptionist (Rs. 70,000)</option>
                <option value="Chef">Chef (Rs. 80,000)</option>
                <option value="Kitchen Staff">Kitchen Staff (Rs. 80,000)</option>
                <option value="Housekeeping Staff">Housekeeping Staff (Rs. 55,000)</option>
                <option value="Maintenance Staff">Maintenance Staff (Rs. 65,000)</option>
                <option value="Technical Staff">Technical Staff (Rs. 65,000)</option>
              </select>
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Salary will be auto-filled based on position</small>
            </label>
            <label>
              Hire Date
              <input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} style={styles.input} />
            </label>
            <label>
              Salary (Rs.)
              <input
                type="number"
                step="0.01"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                style={styles.input}
                placeholder="Auto-filled based on position"
              />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Address
              <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows="2" style={styles.input} />
            </label>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.table}>
        {staff.length === 0 ? (
          <p>No staff members found. Create one to get started.</p>
        ) : (
          staff.map((s) => (
            <div key={s.id} style={styles.tableRow}>
              <div style={styles.tableRowContent}>
                <div>
                  <strong>{s.name}</strong>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    {s.employee_id && `Employee ID: ${s.employee_id} • `}
                    {s.email} • {s.role}
                  </p>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    {s.department && `${s.department} • `}
                    {s.position && `${s.position} • `}
                    {s.salary && `Salary: Rs. ${s.salary} • `}
                    {s.is_active !== false ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div style={styles.tableActions}>
                  <button className="btn-outline" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="btn-outline" onClick={() => handleDelete(s.id)} style={{ color: '#f87171' }}>Disable</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Inventory Management Component
function InventoryManagement({ setError, setSuccess }) {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    quantity: '0',
    unit: 'unit',
    min_stock_level: '10',
    max_stock_level: '1000',
    cost_per_unit: '',
    supplier: '',
  })

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading inventory...')
      const response = await getInventory()
      console.log('Inventory response:', response)
      // Handle both response formats: {data: [...]} or direct array
      const inventoryData = response?.data || response || []
      console.log('Inventory data:', inventoryData)
      setInventory(Array.isArray(inventoryData) ? inventoryData : [])
      if (inventoryData.length === 0) {
        console.log('No inventory items found')
      }
    } catch (err) {
      console.error('Inventory load error:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      setError(getErrorMessage(err, 'Failed to load inventory'))
      // Set empty array on error to prevent further issues
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        quantity: parseInt(formData.quantity),
        min_stock_level: parseInt(formData.min_stock_level),
        max_stock_level: parseInt(formData.max_stock_level),
      }
      if (formData.cost_per_unit) payload.cost_per_unit = parseFloat(formData.cost_per_unit)
      if (editing) {
        await updateInventory(editing.id, payload)
        setSuccess('Inventory item updated successfully')
      } else {
        await createInventory(payload)
        setSuccess('Inventory item created successfully')
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ category_id: '', name: '', description: '', quantity: '0', unit: 'unit', min_stock_level: '10', max_stock_level: '1000', cost_per_unit: '', supplier: '' })
      loadInventory()
    } catch (err) {
      setError(err.message || 'Failed to save inventory item')
    }
  }

  const handleEdit = (inv) => {
    setEditing(inv)
    setFormData({
      category_id: String(inv.categoryId || inv.category_id || ''),
      name: inv.name || '',
      description: inv.description || '',
      quantity: String(inv.quantity || 0),
      unit: inv.unit || 'unit',
      min_stock_level: String(inv.minStockLevel || inv.min_stock_level || 10),
      max_stock_level: String(inv.maxStockLevel || inv.max_stock_level || 1000),
      cost_per_unit: inv.costPerUnit || inv.cost_per_unit || '',
      supplier: inv.supplier || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return
    try {
      await deleteInventory(id)
      setSuccess('Inventory item deleted successfully')
      loadInventory()
    } catch (err) {
      setError(err.message || 'Failed to delete inventory item')
    }
  }

  if (loading) return <p>Loading inventory...</p>

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Inventory Management</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setFormData({ category_id: '', name: '', description: '', quantity: '0', unit: 'unit', min_stock_level: '10', max_stock_level: '1000', cost_per_unit: '', supplier: '' }) }}>
          Add Inventory Item
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>{editing ? 'Edit' : 'Create'} Inventory Item</h3>
          <div style={styles.formGrid}>
            <label>
              Name *
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
            </label>
            <label>
              Category ID *
              <input type="number" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required style={styles.input} />
            </label>
            <label>
              Quantity *
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required style={styles.input} />
            </label>
            <label>
              Unit *
              <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required style={styles.input} />
            </label>
            <label>
              Min Stock Level
              <input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })} style={styles.input} />
            </label>
            <label>
              Max Stock Level
              <input type="number" value={formData.max_stock_level} onChange={(e) => setFormData({ ...formData, max_stock_level: e.target.value })} style={styles.input} />
            </label>
            <label>
              Cost per Unit (Rs.)
              <input type="number" step="0.01" value={formData.cost_per_unit} onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })} style={styles.input} />
            </label>
            <label>
              Supplier
              <input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} style={styles.input} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" style={styles.input} />
            </label>
          </div>
          <div style={styles.formActions}>
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.table}>
        {inventory.length === 0 ? (
          <p>No inventory items found. Create one to get started.</p>
        ) : (
          inventory.map((inv) => (
            <div key={inv.id} style={styles.tableRow}>
              <div style={styles.tableRowContent}>
                <div>
                  <strong>{inv.name}</strong>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>{inv.description || 'No description'}</p>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    Quantity: {inv.quantity} {inv.unit} • Min: {inv.minStockLevel || inv.min_stock_level} • Max: {inv.maxStockLevel || inv.max_stock_level}
                    {inv.costPerUnit || inv.cost_per_unit ? ` • Rs. ${inv.costPerUnit || inv.cost_per_unit} per ${inv.unit}` : ''}
                  </p>
                </div>
                <div style={styles.tableActions}>
                  <button className="btn-outline" onClick={() => handleEdit(inv)}>Edit</button>
                  <button className="btn-outline" onClick={() => handleDelete(inv.id)} style={{ color: '#f87171' }}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Kitchen Orders Management Component
function KitchenOrdersManagement({ setError, setSuccess }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading kitchen orders...')
      const data = await getKitchenOrders(statusFilter || undefined)
      console.log('Kitchen orders response:', data)
      const rawData = data?.data || data || []
      const sortedOrders = (Array.isArray(rawData) ? rawData : []).sort((a, b) => (b.id || 0) - (a.id || 0))
      setOrders(sortedOrders)
    } catch (err) {
      console.error('Kitchen orders load error:', err)
      setError(getErrorMessage(err, 'Failed to load kitchen orders'))
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateKitchenOrderStatus(id, newStatus)
      setSuccess('Order status updated successfully')
      loadOrders()
    } catch (err) {
      setError(err.message || 'Failed to update order status')
    }
  }

  if (loading) return <p>Loading kitchen orders...</p>

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Kitchen Orders</h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.input}>
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={styles.table}>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={styles.tableRow}>
              <div style={styles.tableRowContent}>
                <div>
                  <strong>{order.occasion || 'Dining Reservation'}</strong>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    {order.guestName || order.guest_name} • {order.guestCount || order.guest_count} guests
                  </p>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    {order.reservationDate || order.reservation_date} at {order.reservationTime || order.reservation_time}
                  </p>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    Status: <span style={styles.statusPill(order.orderStatus || order.order_status)}>{order.orderStatus || order.order_status}</span>
                  </p>
                </div>
                <div style={styles.tableActions}>
                  <select
                    value={order.orderStatus || order.order_status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    style={styles.input}
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// User Management Component
function UserManagement({ setError, setSuccess }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading users...')
      const data = await getUsers()
      console.log('Users response:', data)
      setUsers(data?.data || data || [])
    } catch (err) {
      console.error('Users load error:', err)
      setError(getErrorMessage(err, 'Failed to load users'))
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id, isActive) => {
    try {
      await updateUser(id, { is_active: !isActive })
      setSuccess('User status updated successfully')
      setTimeout(() => {
        loadUsers()
      }, 500)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update user status'))
    }
  }

  const handleChangePassword = async (e, userId) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    try {
      await updateUser(userId, { password: passwordForm.newPassword })
      setSuccess('Password changed successfully')
      setEditingUser(null)
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to change password'))
    }
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading users...</p>

  return (
    <div>
      <h2 style={styles.sectionTitle}>User Management</h2>
      <div style={styles.table}>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((u) => (
            <div key={u.id} style={styles.tableRow}>
              <div style={styles.tableRowContent}>
                <div style={{ flex: 1 }}>
                  <strong>{u.name}</strong>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>{u.email} • {u.role}</p>
                  <p style={{ ...styles.tableSubtext, color: 'rgba(255,255,255,0.9)' }}>
                    {u.is_active !== false ? 'Active' : 'Inactive'} • Created: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  {editingUser === u.id && (
                    <form style={{ ...styles.form, marginTop: '1rem', padding: '1rem', background: '#475569' }} onSubmit={(e) => handleChangePassword(e, u.id)}>
                      <h4 style={{ margin: '0 0 0.5rem' }}>Change Password</h4>
                      <div style={styles.formGrid}>
                        <label>
                          New Password *
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            minLength={6}
                            style={styles.input}
                          />
                        </label>
                        <label>
                          Confirm Password *
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                            style={styles.input}
                          />
                        </label>
                      </div>
                      <div style={styles.formActions}>
                        <button type="submit" className="btn-primary">Change Password</button>
                        <button type="button" className="btn-outline" onClick={() => { setEditingUser(null); setPasswordForm({ newPassword: '', confirmPassword: '' }) }}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
                <div style={styles.tableActions}>
                  <button
                    className="btn-outline"
                    onClick={() => {
                      if (editingUser === u.id) {
                        setEditingUser(null)
                        setPasswordForm({ newPassword: '', confirmPassword: '' })
                      } else {
                        setEditingUser(u.id)
                        setPasswordForm({ newPassword: '', confirmPassword: '' })
                      }
                    }}
                  >
                    {editingUser === u.id ? 'Cancel' : 'Change Password'}
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                    style={{ color: u.is_active !== false ? '#f87171' : '#34d399' }}
                  >
                    {u.is_active !== false ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Inquiries Management Component
function InquiriesManagement({ setError, setSuccess }) {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    loadInquiries()
  }, [])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      const res = await getContactInquiries()
      console.log('Inquiries:', res)
      const rawData = Array.isArray(res.data) ? res.data : []
      const sortedInquiries = rawData.sort((a, b) => (b.id || 0) - (a.id || 0))
      setInquiries(sortedInquiries)
    } catch (e) {
      console.error(e)
      setError('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInquiryStatus(id, status)
      setSuccess(`Inquiry marked as ${status}`)
      await loadInquiries()
      setTimeout(async () => {
        await loadInquiries()
      }, 1000)
    } catch (e) {
      setError('Failed to update status')
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyMessage.trim()) return

    try {
      await replyToInquiry(replyingTo.id, replyMessage)
      setSuccess('Reply sent successfully')
      setReplyingTo(null)
      setReplyMessage('')
      await loadInquiries()
      setTimeout(async () => {
        await loadInquiries()
      }, 1000)
    } catch (e) {
      setError('Failed to send reply')
    }
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading inquiries...</p>

  return (
    <div>
      <h2 style={{ ...styles.sectionTitle, color: '#fff', fontWeight: 'bold' }}>Contact Inquiries</h2>

      {replyingTo && (
        <div style={{ background: '#334155', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: '#fff', marginTop: 0 }}>Reply to {replyingTo.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>"{replyingTo.message}"</p>
          <form onSubmit={handleReply}>
            <textarea
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              rows={4}
              style={{ ...styles.input, marginBottom: '1rem' }}
              placeholder="Type your reply here..."
              required
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary">Send Email Reply</button>
              <button type="button" className="btn-outline" onClick={() => setReplyingTo(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.table}>
        {inquiries.length === 0 && <p style={{ color: 'rgba(255,255,255,0.5)' }}>No inquiries found.</p>}
        {inquiries.map(inquiry => (
          <div key={inquiry.id} style={styles.tableRow}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>{inquiry.subject || 'No Subject'}</h3>
                <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>{inquiry.inquiryType}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={styles.statusPill(inquiry.status || 'new_status')}>
                  {(inquiry.status || 'new_status').replace('_', ' ')}
                </span>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : ''}
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, whiteSpace: 'pre-wrap' }}>{inquiry.message}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <strong>From:</strong> {inquiry.name} ({inquiry.email}) • {inquiry.phone}
              </div>
              <div style={styles.tableActions}>
                {/* Status Actions */}
                {inquiry.status === 'new_status' && (
                  <button onClick={() => handleStatusUpdate(inquiry.id, 'read')} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.3rem', background: '#475569', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Mark Read</button>
                )}

                {/* Approval Actions */}
                {(inquiry.status !== 'approved' && inquiry.status !== 'cancelled' && inquiry.status !== 'replied') && (
                  <>
                    <button onClick={() => handleStatusUpdate(inquiry.id, 'approved')} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.3rem', background: '#059669', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Approve</button>
                    <button onClick={() => handleStatusUpdate(inquiry.id, 'cancelled')} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.3rem', background: '#dc2626', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                  </>
                )}

                <button onClick={() => setReplyingTo(inquiry)} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.3rem', background: 'var(--accent)', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Reports Management Component
function ReportsManagement({ setError, setSuccess }) {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ month: '', date: '' })

  useEffect(() => {
    loadRevenueReport()
  }, [filters])

  const loadRevenueReport = async () => {
    try {
      setLoading(true)
      const res = await getRevenueReport(filters)
      setReportData(res.data)
    } catch (e) {
      setError('Failed to load revenue reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading reports...</p>
  if (!reportData) return <p style={{ color: 'rgba(255,255,255,0.7)' }}>No report data available.</p>

  const categories = [
    { id: 'rooms', label: 'Room Reservations', color: '#60a5fa' },
    { id: 'dining', label: 'Dining Reservations', color: '#34d399' },
    { id: 'events', label: 'Event Reservations', color: '#a78bfa' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ ...styles.sectionTitle, color: '#fff', fontWeight: 'bold', margin: 0 }}>Revenue Reports</h2>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Filter by Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={e => setFilters({ ...filters, month: e.target.value, date: '' })}
              style={{ ...styles.input, marginTop: 0, padding: '0.5rem', width: '160px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Filter by Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value, month: '' })}
              style={{ ...styles.input, marginTop: 0, padding: '0.5rem', width: '160px' }}
            />
          </div>
          <button
            onClick={() => setFilters({ month: '', date: '' })}
            style={{
              marginTop: '1.25rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={styles.reportsGrid}>
        {categories.map(cat => {
          const data = reportData[cat.id]
          const monthlyData = Object.entries(data.monthly).sort((a, b) => a[0].localeCompare(b[0]))
          // Ensure at least 1 for maxVal to avoid division by zero and provide some height for small values
          const maxVal = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d[1]), 1) : 1

          return (
            <div key={cat.id} style={styles.reportCard}>
              <h3 style={{
                color: '#fff',
                borderBottom: `2px solid ${cat.color}`,
                paddingBottom: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '1.25rem'
              }}>
                {cat.label}
              </h3>

              <div style={styles.totalRevenueBox}>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Revenue to Date
                </span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: cat.color, marginTop: '0.25rem' }}>
                  Rs. {data.total.toLocaleString()}
                </span>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                  Monthly Revenue Performance
                </h4>
                <div style={styles.chartContainer}>
                  {monthlyData.length === 0 ? (
                    <div style={{
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '0.75rem',
                      border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>No monthly data available</p>
                    </div>
                  ) : (
                    <div style={styles.chartBars}>
                      {monthlyData.map(([month, value]) => {
                        const barHeight = Math.max((value / maxVal) * 150, 5)
                        return (
                          <div key={month} style={styles.chartBarWrapper}>
                            <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                              <div
                                style={{
                                  ...styles.chartBar,
                                  height: `${barHeight}px`,
                                  background: `linear-gradient(to top, ${cat.color}44, ${cat.color})`,
                                  boxShadow: `0 4px 12px ${cat.color}33`
                                }}
                                title={`Rs. ${value.toLocaleString()}`}
                              >
                                <div style={styles.chartBarTooltip}>
                                  Rs. {value.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <span style={styles.chartLabel}>{month}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Reservations Management Component
function ReservationsManagement({ setError, setSuccess }) {
  const [subTab, setSubTab] = useState('room')
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={{ ...styles.sectionTitle, color: '#fff', fontWeight: 'bold', margin: 0 }}>Reservation Management</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={subTab === 'room' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setSubTab('room')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Rooms
          </button>
          <button
            className={subTab === 'dining' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setSubTab('dining')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Dining
          </button>
          <button
            className={subTab === 'event' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setSubTab('event')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Events
          </button>
        </div>
      </div>

      <div style={{
        background: '#334155',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Manage {subTab.charAt(0).toUpperCase() + subTab.slice(1)} Reservations</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
          Click the button below to view, approve, or cancel {subTab} reservations.
        </p>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ padding: '0.75rem 2rem' }}
        >
          Open {subTab.charAt(0).toUpperCase() + subTab.slice(1)} Manager
        </button>
      </div>

      {showModal && (
        <ReservationsModal
          type={subTab}
          onClose={() => setShowModal(false)}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}
    </div>
  )
}

const styles = {
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    marginTop: '1.5rem',
  },
  reportCard: {
    padding: '2rem',
    borderRadius: '1.25rem',
    background: '#1e293b',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  totalRevenueBox: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '1rem',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  chartContainer: {
    position: 'relative',
    width: '100%',
    padding: '0 0.5rem',
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: '1rem',
    height: '200px',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  chartBarWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: '50px',
  },
  chartBar: {
    width: '100%',
    maxWidth: '40px',
    borderRadius: '6px 6px 0 0',
    transition: 'all 0.3s ease',
    position: 'relative',
    cursor: 'pointer',
    '&:hover': {
      filter: 'brightness(1.2)',
    }
  },
  chartBarTooltip: {
    position: 'absolute',
    top: '-35px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#000',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    opacity: 0,
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
  },
  // Note: hover effects for CSS-in-JS like this need extra care, 
  // but for simplicity I'll skip the complex pseudo-hover logic
  chartLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.75rem',
    transform: 'rotate(-45deg)',
    whiteSpace: 'nowrap',
    height: '20px',
  },
  section: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '4rem 1.5rem',
    color: '#fff',
  },
  card: {
    width: '100%',
    maxWidth: 1400,
    margin: '0 auto',
    background: '#1e293b',
    borderRadius: '1.5rem',
    padding: '2.5rem',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
  },
  header: {
    marginBottom: '2rem',
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontSize: '0.8rem',
    color: 'var(--accent)',
    margin: 0,
  },
  title: {
    fontSize: '2rem',
    margin: '0.5rem 0',
    fontFamily: '"Playfair Display", serif',
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.5,
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: '#334155',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '0.5rem',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
  tabActive: {
    background: '#475569',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
  },
  content: {
    minHeight: '400px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
    width: '100%',
    overflow: 'visible',
  },
  sectionTitle: {
    margin: '0 0 1.5rem',
    fontSize: '1.5rem',
    fontFamily: '"Playfair Display", serif',
    color: '#fff',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'clip',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '1.5rem',
    borderRadius: '1rem',
    background: '#334155',
    border: '1px solid rgba(255,255,255,0.1)',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0.5rem 0',
    color: 'var(--accent)',
  },
  statDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.95)',
    flex: 1,
  },
  statRevenue: {
    marginTop: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#34d399',
  },
  form: {
    background: '#334155',
    padding: '1.5rem',
    borderRadius: '1rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255,255,255,0.2)',
    background: '#1e293b',
    color: '#fff',
    fontSize: '1rem',
    marginTop: '0.25rem',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  tableRow: {
    padding: '1.5rem',
    borderRadius: '1rem',
    background: '#334155',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  tableRowContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  tableSubtext: {
    margin: '0.25rem 0',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.9rem',
  },
  tableActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  statusPill: (status) => ({
    display: 'inline-flex',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    textTransform: 'capitalize',
    background:
      status === 'approved' || status === 'confirmed' || status === 'completed' || status === 'calculated' || status === 'paid'
        ? 'rgba(52, 211, 153, 0.15)'
        : status === 'pending'
          ? 'rgba(250, 204, 21, 0.15)'
          : 'rgba(248, 113, 113, 0.15)',
    color:
      status === 'approved' || status === 'confirmed' || status === 'completed' || status === 'calculated' || status === 'paid'
        ? '#34d399'
        : status === 'pending'
          ? '#facc15'
          : '#f87171',
  }),
  alertError: {
    padding: '1rem',
    background: 'rgba(248, 113, 113, 0.15)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '0.5rem',
    color: '#f87171',
    marginBottom: '1rem',
  },
  alertSuccess: {
    padding: '1rem',
    background: 'rgba(52, 211, 153, 0.15)',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    borderRadius: '0.5rem',
    color: '#34d399',
    marginBottom: '1rem',
  },
}

