import { useEffect, useState } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import BookingModal from '../components/BookingModal'
import { getPublicRoomTypes } from '../api/client'

export default function Accommodation() {
  const [modal, setModal] = useState({ open: false, room: null })
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState('https://q-xx.bstatic.com/xdata/images/hotel/840x460/664469406.jpg?k=cd9fe27e76b49a625afa002e7bdddf1dbe72acea3f1033682776c55c3215c2eb&o=')

  useEffect(() => {
    const img = new Image()
    img.onload = () => setHero('https://q-xx.bstatic.com/xdata/images/hotel/840x460/664469406.jpg?k=cd9fe27e76b49a625afa002e7bdddf1dbe72acea3f1033682776c55c3215c2eb&o=')
    img.onerror = () => setHero('https://q-xx.bstatic.com/xdata/images/hotel/840x460/664469406.jpg?k=cd9fe27e76b49a625afa002e7bdddf1dbe72acea3f1033682776c55c3215c2eb&o=')
    img.src = 'https://q-xx.bstatic.com/xdata/images/hotel/840x460/664469406.jpg?k=cd9fe27e76b49a625afa002e7bdddf1dbe72acea3f1033682776c55c3215c2eb&o='
  }, [])

  useEffect(() => {
    loadRoomTypes()
    // Removed auto-refresh to prevent blinking
  }, [])

  const loadRoomTypes = async () => {
    try {
      // Only set loading on initial load to prevent blinking
      if (rooms.length === 0) {
        setLoading(true)
      }
      const response = await getPublicRoomTypes()
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
      
      // Map room types to the format expected by the component
      const mappedRooms = roomTypesData.map((rt) => {
        const price = rt.pricePerNight || rt.price_per_night || 0
        const name = rt.name || 'Unnamed Room'
        const description = rt.description || 'Comfortable room with modern amenities.'
        const imageUrl = rt.imageUrl || rt.image_url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop'
        
        // Determine type based on name (fallback logic)
        let type = 'room'
        const nameLower = name.toLowerCase()
        if (nameLower.includes('suite') || nameLower.includes('presidential')) {
          type = 'suite'
        } else if (nameLower.includes('garden')) {
          type = 'garden'
        }
        
        return {
          id: rt.id || rt.roomTypeId,
          name: name,
          image: imageUrl,
          fallback: imageUrl,
          type: type,
          price: `LKR ${typeof price === 'number' ? price.toLocaleString() : price} / night`,
          description: description,
          capacity: rt.capacity || 2,
          amenities: rt.amenities || '',
        }
      })
      
      console.log('Mapped rooms:', mappedRooms)
      // Only update if data actually changed to prevent unnecessary re-renders
      if (JSON.stringify(mappedRooms) !== JSON.stringify(rooms)) {
        setRooms(mappedRooms)
      }
    } catch (err) {
      console.error('Error loading room types:', err)
      // Fallback to empty array on error
      if (rooms.length === 0) {
        setRooms([])
      }
    } finally {
      setLoading(false)
    }
  }

  const openModal = (room) => setModal({ open: true, room })
  const closeModal = () => setModal({ open: false, room: null })

  // Show all rooms (no filtering)
  const filtered = rooms

  return (
    <div>
      <div className="accom-hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="overlay">
          <div className="content">
            <h1 style={{ margin: 0 }}>Accommodation</h1>
            <p style={{ marginTop: 8 }}>Heritage charm, modern comforts, and serene garden views.</p>
          </div>
        </div>
      </div>

      <AnimatedSection style={{ maxWidth: 1024, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ margin: 0 }}>
            Explore our selection of refined rooms and suites. Choose your preferred stay and reserve.
          </p>
        </div>

        <div className="gallery-grid room-grid">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p>Loading room types...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p>No room types available at the moment.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="room-card">
                <div className="room-card__media">
                  <img src={r.image} alt={r.name} onError={(e) => (e.currentTarget.src = r.fallback)} />
                </div>
                <div className="room-card__body">
                  <div className="room-card__price">{r.price}</div>
                  <h3>{r.name}</h3>
                  <p>{r.description}</p>
                  <ul>
                    <li>Capacity: {r.capacity} guests</li>
                    {r.amenities && <li>{r.amenities}</li>}
                    <li>Complimentary Wi‑Fi</li>
                  </ul>
                </div>
                <div className="room-card__footer">
                  <button className="btn-outline" onClick={() => openModal(r)}>Check Rates</button>
                  <button className="btn-primary" onClick={() => openModal(r)}>Reserve</button>
                </div>
              </div>
            ))
          )}
        </div>
      </AnimatedSection>

      <BookingModal open={modal.open} room={modal.room} onClose={closeModal} />
    </div>
  )
}