import { useEffect, useState, useRef } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { Link, useLocation } from 'react-router-dom'
import { getPublicEventTypes } from '../api/client'
import EventBookingModal from '../components/EventBookingModal'

export default function WeddingsEvents() {
  const [hero, setHero] = useState('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&h=800&fit=crop')
  const [eventTypes, setEventTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const location = useLocation()
  const previousEventTypesRef = useRef(JSON.stringify([]))

  useEffect(() => {
    const img = new Image()
    img.onload = () => setHero('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&h=800&fit=crop')
    img.onerror = () => setHero('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&h=800&fit=crop')
    img.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&h=800&fit=crop'
  }, [])

  // Refresh when navigating to this page
  useEffect(() => {
    loadEventTypes()
  }, [location.pathname])

  // Also refresh on initial mount
  useEffect(() => {
    loadEventTypes()
  }, [])

  const loadEventTypes = async () => {
    try {
      // Always show loading to indicate refresh
      setLoading(true)

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      console.log('Fetching event types from API:', `${API_BASE_URL}/api/public/event-types`)

      const response = await getPublicEventTypes()
      console.log('Raw API response:', response)
      console.log('Response type:', typeof response)
      console.log('Is array?', Array.isArray(response))

      // Handle different response formats
      let eventTypesData = []
      if (Array.isArray(response)) {
        eventTypesData = response
        console.log('Response is direct array, count:', eventTypesData.length)
      } else if (response?.data) {
        eventTypesData = Array.isArray(response.data) ? response.data : []
        console.log('Response has data property, count:', eventTypesData.length)
        console.log('Response data:', response.data)
      } else if (response?.success && response?.data) {
        eventTypesData = Array.isArray(response.data) ? response.data : []
        console.log('Response has success and data, count:', eventTypesData.length)
        console.log('Response success:', response.success)
        console.log('Response data:', response.data)
      } else {
        console.warn('Unexpected response format:', response)
        console.warn('Response keys:', Object.keys(response || {}))
      }

      console.log('Extracted event types data:', eventTypesData)
      console.log('First event type sample:', eventTypesData[0])

      // Map event types to the format expected by the component
      const mappedEvents = eventTypesData
        .map((et) => {
          const price = et.basePrice || et.base_price || 0
          const name = et.name || 'Unnamed Event'
          const description = et.description || 'Perfect venue for your special occasion.'
          const imageUrl = et.imageUrl || et.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=800&fit=crop'
          const venueOptions = et.venueOptions || et.venue_options || ''
          const isAvailable = et.isAvailable !== undefined ? et.isAvailable : (et.is_available !== false)

          console.log(`Processing event: ${name}, isAvailable: ${isAvailable}`)

          // Only include if available
          if (!isAvailable) {
            console.log('Skipping unavailable event type:', name)
            return null
          }

          // Parse venue options as features if they exist
          const features = venueOptions ? venueOptions.split(',').map(v => v.trim()).filter(v => v) : [
            'Professional event coordination',
            'Customized catering options',
            'Flexible venue arrangements',
            'Dedicated event manager'
          ]

          return {
            id: et.id || et.eventTypeId,
            name: name,
            description: description,
            image: imageUrl,
            fallback: imageUrl,
            price: `LKR ${typeof price === 'number' ? price.toLocaleString() : price}`,
            capacity: et.capacity || 0,
            features: features,
          }
        })
        .filter(event => event !== null) // Remove null entries

      console.log('Mapped event types (after filtering):', mappedEvents)
      console.log('Total available event types:', mappedEvents.length)

      // Always update state to ensure fresh data (removed comparison check)
      previousEventTypesRef.current = JSON.stringify(mappedEvents)
      setEventTypes(mappedEvents)
    } catch (err) {
      console.error('Error loading event types:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      // Don't clear event types on error, keep existing ones
      // setEventTypes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="accom-hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="overlay">
          <div className="content">
            <h1 style={{ margin: 0 }}>Weddings & Events</h1>
            <p style={{ marginTop: 8, fontSize: '1.125rem' }}>
              Enchanting settings and attentive service for your special moments
            </p>
          </div>
        </div>
      </div>

      <AnimatedSection style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div className="section-title" style={{ position: 'relative' }}>
          <h2>Event Spaces</h2>
          <p style={{ maxWidth: 600, margin: '1rem auto', fontSize: '1.125rem' }}>
            Piyakaru Hotel offers versatile venues perfect for weddings, corporate events,
            and celebrations. Our dedicated team ensures every detail is perfect.
          </p>

        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          marginTop: '3rem'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p>Loading event types...</p>
            </div>
          ) : eventTypes.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <p style={{ marginBottom: '1rem' }}>No event types available at the moment.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Make sure event types are marked as "Available" in the Admin panel.
              </p>
              <button
                onClick={loadEventTypes}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            eventTypes.map((event) => (
              <div
                key={event.id}
                className="gallery-card"
                style={{
                  background: '#fff',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={event.image}
                  alt={event.name}
                  style={{ height: '240px', width: '100%', objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.src = event.fallback)}
                />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: 'var(--bg)' }}>
                    {event.price}
                  </div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                    {event.name}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    fontSize: '1rem'
                  }}>
                    {event.description}
                  </p>
                  {event.capacity > 0 && (
                    <p style={{
                      color: 'var(--text-secondary)',
                      marginBottom: '1rem',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Capacity: {event.capacity} guests
                    </p>
                  )}
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    marginBottom: '1.5rem'
                  }}>
                    {event.features.map((feature, index) => (
                      <li
                        key={index}
                        style={{
                          padding: '0.5rem 0',
                          paddingLeft: '1.5rem',
                          position: 'relative',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          color: 'var(--accent)'
                        }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedEvent(event)
                      setModalOpen(true)
                    }}
                    className="btn-primary"
                    style={{ width: '100%', textAlign: 'center', display: 'block' }}
                  >
                    Book Event
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{
          marginTop: '4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            padding: '2.5rem',
            borderRadius: '16px',
            color: 'var(--bg)'
          }}>
            <h3 style={{ color: 'var(--bg)', marginBottom: '1rem', fontSize: '1.75rem' }}>
              Capacity
            </h3>
            <p style={{ color: 'var(--bg)', margin: 0, fontSize: '1.125rem', lineHeight: 1.8 }}>
              Our venues can accommodate from intimate gatherings of 20 guests
              to grand celebrations of up to 200 guests.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, var(--bg) 0%, #1a2540 100%)',
            padding: '2.5rem',
            borderRadius: '16px',
            color: '#fff'
          }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.75rem' }}>
              Services
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.125rem', lineHeight: 1.8 }}>
              Full event planning, customized menus, decoration, photography coordination,
              and dedicated event managers to ensure perfection.
            </p>
          </div>

          <div style={{
            background: '#f9fafb',
            padding: '2.5rem',
            borderRadius: '16px',
            border: '2px solid var(--accent)'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>
              Packages
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.125rem', lineHeight: 1.8 }}>
              Customizable packages tailored to your needs and budget.
              Contact us for detailed pricing and availability.
            </p>
          </div>
        </div>

        <div style={{
          marginTop: '4rem',
          textAlign: 'center',
          padding: '3rem',
          background: 'linear-gradient(135deg, var(--bg) 0%, #1a2540 100%)',
          borderRadius: '16px',
          color: '#fff'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '2rem' }}>
            Let's Plan Your Perfect Event
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
            Our experienced event team is ready to help you create unforgettable memories.
            Contact us to discuss your vision and let us bring it to life.
          </p>
          <Link to="/contact" className="btn-primary" style={{ color: 'var(--bg)', fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Get Started
          </Link>
        </div>
      </AnimatedSection>

      <EventBookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eventType={selectedEvent}
      />
    </div>
  )
}

