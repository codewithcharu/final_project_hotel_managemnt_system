import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import DiningBookingModal from '../components/DiningBookingModal'
import { getPublicDiningTypes } from '../api/client'
import { useAuth } from '../context/AuthContext'

const MENU_CATEGORIES_ORDER = ['breakfast', 'lunch', 'dinner', 'beverages', 'snacks']

export default function Dining() {
  const { user } = useAuth()
  const [hero, setHero] = useState('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop')
  const [activeCategory, setActiveCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [reservationNote, setReservationNote] = useState('')

  const [diningTypes, setDiningTypes] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMenu()
    const img = new Image()
    img.onload = () => setHero('/royal-bandalow/dining-hero.jpg')
    img.onerror = () => setHero('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=800&fit=crop')
    img.src = '/royal-bandalow/dining-hero.jpg'
  }, [])

  async function loadMenu() {
    try {
      setLoading(true)
      const res = await getPublicDiningTypes()
      const data = Array.isArray(res) ? res : (res && res.data ? res.data : [])
      setDiningTypes(data)

      const uniqueCats = [...new Set((data || []).map(item => item.category?.toLowerCase()))].filter(Boolean)

      uniqueCats.sort((a, b) => {
        const indexA = MENU_CATEGORIES_ORDER.indexOf(a)
        const indexB = MENU_CATEGORIES_ORDER.indexOf(b)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return a.localeCompare(b)
      })

      setAvailableCategories(uniqueCats)

      if (uniqueCats.length > 0 && (!activeCategory || !uniqueCats.includes(activeCategory))) {
        setActiveCategory(uniqueCats[0])
      } else if (uniqueCats.length === 0) {
        setAvailableCategories(MENU_CATEGORIES_ORDER)
        setActiveCategory('breakfast')
      }

    } catch (e) {
      console.error("Failed load menu", e)
      setAvailableCategories(MENU_CATEGORIES_ORDER)
      setActiveCategory('breakfast')
      setDiningTypes([])
    } finally {
      setLoading(false)
    }
  }

  const currentItems = (diningTypes || []).filter(item => (item.category?.toLowerCase() || '') === activeCategory)

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

  const handleReserve = (itemName) => {
    setReservationNote(`Requesting item: ${itemName}`)
    setModalOpen(true)
  }

  return (
    <div>
      <div className="accom-hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="overlay">
          <div className="content">
            <h1 style={{ margin: 0 }}>Dining Experience</h1>
            <p style={{ marginTop: 8, fontSize: '1.125rem' }}>
              A culinary journey celebrating the flavors of Sri Lanka and the world
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div className="section-title">
          <h2>Our Menu</h2>
          <p style={{ maxWidth: 600, margin: '1rem auto', fontSize: '1.125rem' }}>
            Our culinary team crafts each dish with passion.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {availableCategories.map((category) => (
            <button
              key={category}
              className={`chip ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', textTransform: 'capitalize' }}
            >
              {category}
            </button>
          ))}
        </div>

        {activeCategory && (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '2.5rem',
            boxShadow: 'var(--shadow-lg)', maxWidth: 800, margin: '0 auto',
            marginBottom: '3rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ color: 'var(--accent)', margin: 0, fontSize: '2rem', textTransform: 'capitalize' }}>
                {activeCategory}
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
              Selections for {capitalize(activeCategory)}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {loading && <p>Loading menu items...</p>}
              {!loading && currentItems.length === 0 && <p style={{ fontStyle: 'italic', color: '#999' }}>No items available in this category.</p>}
              {currentItems.map((item) => (
                <div key={item.id} style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      {item.name}
                    </h4>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.125rem', display: 'block' }}>
                        LKR {item.price ? item.price.toLocaleString() : '0'}
                      </span>

                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleReserve(item.name)}
                          style={{
                            background: '#f59e0b',
                            color: '#fff',
                            border: 'none',
                            padding: '0.4rem 1rem',
                            borderRadius: '0.3rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: 'linear-gradient(135deg, var(--bg) 0%, #1a2540 100%)', borderRadius: '16px', color: '#fff' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Private Dining & Special Events</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', maxWidth: 600, margin: '0 auto 1.5rem' }}>
            Host your special occasions in our elegant dining spaces.
          </p>
          <Link to="/contact" className="btn-primary" style={{ color: 'var(--bg)' }}>Inquire About Private Dining</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)', borderRadius: '16px', color: 'var(--bg)' }}>
          <h3 style={{ color: 'var(--bg)', marginBottom: '1rem' }}>Ready to Dine with Us?</h3>
          <button onClick={() => { setReservationNote(''); setModalOpen(true) }} className="btn-primary" style={{ color: 'var(--accent)', background: 'white', fontSize: '1.125rem', padding: '1rem 2rem' }}>
            Book a Table
          </button>
        </div>
      </div>

      <DiningBookingModal
        key={modalOpen ? `open-${reservationNote}` : 'closed'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialNote={reservationNote}
      />
    </div>
  )
}
