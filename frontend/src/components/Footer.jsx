import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--bg)',
      color: '#fff',
      padding: '3rem 1.5rem 1.5rem',
      marginTop: '4rem'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Piyakaru Hotel
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
            Your comfortable coastal retreat in Beliatta, Sri Lanka. 
            Experience warm hospitality and modern amenities.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Home
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/accommodation" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Accommodation
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/dining" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Dining
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/weddings-events" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Weddings & Events
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/contact" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Contact Info</h4>
          <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Address:</strong><br />
              Tangalle Road, Beliatta, Sri Lanka
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Phone:</strong><br />
              <a href="tel:+94472251207" style={{ color: 'var(--accent)', textDecoration: 'none' }}>+94 47 225 1207</a>
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Email:</strong><br />
              <a href="mailto:infopiyakaru@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                infopiyakaru@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Follow Us</h4>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <a 
              href="#" 
              style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '1.5rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            >
              📘
            </a>
            <a 
              href="#" 
              style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '1.5rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            >
              📷
            </a>
            <a 
              href="#" 
              style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '1.5rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            >
              🐦
            </a>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '1.5rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.875rem'
      }}>
        <p style={{ margin: 0 }}>
          © {currentYear} Piyakaru Hotel. All rights reserved.
        </p>
      </div>
    </footer>
  )
}


