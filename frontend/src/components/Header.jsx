import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginModal from './LoginModal'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, token } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHomePage = location.pathname === '/'

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      background: isScrolled ? 'rgba(11, 19, 43, 0.98)' : 'var(--bg)',
      color: '#fff',
      zIndex: 1000,
      boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
      transition: 'all 0.3s ease',
      backdropFilter: isScrolled ? 'blur(10px)' : 'none'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '0.5px',
          color: 'var(--accent)',
          textDecoration: 'none',
          fontFamily: '"Playfair Display", serif'
        }}>
          Piyakaru Hotel
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }} className="desktop-nav">
          <Link
            to="/"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: location.pathname === '/' ? 600 : 400,
              position: 'relative',
              paddingBottom: '0.25rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#fff'
            }}
          >
            Home
          </Link>
          <Link
            to="/accommodation"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: location.pathname === '/accommodation' ? 600 : 400,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#fff'
            }}
          >
            Accommodation
          </Link>
          <Link
            to="/dining"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: location.pathname === '/dining' ? 600 : 400,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#fff'
            }}
          >
            Dining
          </Link>
          <Link
            to="/weddings-events"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: location.pathname === '/weddings-events' ? 600 : 400,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#fff'
            }}
          >
            Events
          </Link>
          <Link
            to="/contact"
            style={{
              color: '#fff',
              textDecoration: 'none',
              fontWeight: location.pathname === '/contact' ? 600 : 400,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#fff'
            }}
          >
            Contact
          </Link>
          {isHomePage && (
            <a
              href="#gallery"
              style={{
                color: '#fff',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fff'
              }}
            >
              Gallery
            </a>
          )}
          {token ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
                {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'My Account'}
              </span>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="btn-outline"
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff',
                    textDecoration: 'none'
                  }}
                >
                  Admin
                </Link>
              )}
              {(user?.role === 'kitchen_admin' || user?.role === 'admin') && (
                <Link
                  to="/kitchen-admin"
                  className="btn-outline"
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff',
                    textDecoration: 'none'
                  }}
                >
                  Kitchen
                </Link>
              )}
              {user?.role === 'staff' && (
                <Link
                  to="/staff"
                  className="btn-outline"
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff',
                    textDecoration: 'none'
                  }}
                >
                  Staff
                </Link>
              )}
              {(user?.role === 'customer' || !user?.role || !['admin', 'kitchen_admin', 'staff'].includes(user?.role)) && (
                <Link
                  to="/profile"
                  className="btn-outline"
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff',
                    textDecoration: 'none'
                  }}
                >
                  Customer
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn-outline"
                style={{
                  fontSize: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="btn-outline"
                style={{
                  fontSize: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>

            </div>
          )}
          <Link
            to="/accommodation"
            className="btn-primary"
            style={{
              fontSize: '0.875rem',
              padding: '0.625rem 1.25rem',
              marginLeft: '0.75rem'
            }}
          >
            BOOK NOW
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav style={{
        display: isMenuOpen ? 'flex' : 'none',
        flexDirection: 'column',
        padding: '1rem 1.5rem',
        background: 'rgba(11, 19, 43, 0.98)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        gap: '1rem'
      }} className="mobile-nav">
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 0' }}
        >
          Home
        </Link>
        <Link
          to="/accommodation"
          onClick={() => setIsMenuOpen(false)}
          style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 0' }}
        >
          Accommodation
        </Link>
        <Link
          to="/dining"
          onClick={() => setIsMenuOpen(false)}
          style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 0' }}
        >
          Dining
        </Link>
        <Link
          to="/weddings-events"
          onClick={() => setIsMenuOpen(false)}
          style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 0' }}
        >
          Weddings & Events
        </Link>
        <Link
          to="/contact"
          onClick={() => setIsMenuOpen(false)}
          style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 0' }}
        >
          Contact Us
        </Link>
        {token ? (
          <>
            {(user?.role === 'customer' || !user?.role || !['admin', 'kitchen_admin', 'staff'].includes(user?.role)) && (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '0.5rem 0',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '999px',
                  textAlign: 'center'
                }}
              >
                Customer Panel
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '0.5rem 0',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '999px',
                  textAlign: 'center'
                }}
              >
                Admin Panel
              </Link>
            )}
            {(user?.role === 'kitchen_admin' || user?.role === 'admin') && (
              <Link
                to="/kitchen-admin"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '0.5rem 0',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '999px',
                  textAlign: 'center'
                }}
              >
                Kitchen Panel
              </Link>
            )}
            {user?.role === 'staff' && (
              <Link
                to="/staff"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '0.5rem 0',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '999px',
                  textAlign: 'center'
                }}
              >
                Staff Panel
              </Link>
            )}
            <button
              onClick={() => {
                handleLogout()
                setIsMenuOpen(false)
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '999px',
                padding: '0.5rem 1.25rem',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              style={{
                color: '#fff',
                textDecoration: 'none',
                padding: '0.5rem 0',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '999px',
                textAlign: 'center'
              }}
            >
              Register
            </Link>
            <button
              onClick={() => {
                setIsLoginOpen(true)
                setIsMenuOpen(false)
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '999px',
                padding: '0.5rem 1.25rem',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </>
        )}
        {isHomePage && (
          <a
            href="#gallery"
            onClick={() => setIsMenuOpen(false)}
            style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 0' }}
          >
            Gallery
          </a>
        )}
      </nav>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  )
}