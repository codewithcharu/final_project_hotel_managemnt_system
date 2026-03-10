import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const heroNavLinks = [
  { href: '#about', label: 'About' },
  { href: '#dining', label: 'Dining' },
  { href: '#accommodation', label: 'Stay' },
  { href: '#weddings-events', label: 'Events' },
  { href: '#contact', label: 'Contact' },
]

export default function Hero({ title, subtitle, imageUrl }) {
  const [resolved, setResolved] = useState(imageUrl)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const test = new Image()
    test.onload = () => {
      setResolved(imageUrl)
      setLoaded(true)
    }
    test.onerror = () => {
      setResolved('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop')
      setLoaded(true)
    }
    test.src = imageUrl
  }, [imageUrl])

  const bg = {
    backgroundImage: `url(${resolved})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '85vh',
    position: 'relative',
    transition: 'opacity 0.6s ease',
    opacity: loaded ? 1 : 0,
  }

  return (
    <section style={bg}>
      <div
        style={{
          minHeight: '85vh',
          background: 'linear-gradient(135deg, rgba(11, 19, 43, 0.78) 0%, rgba(11, 19, 43, 0.55) 100%)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '4rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(212, 175, 55, 0.18) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '3rem 1.5rem',
            color: '#fff',
            position: 'relative',
            zIndex: 1,
            width: '100%',
          }}
        >
          <div
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease 0.2s',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 6vw, 3.5rem)',
                margin: 0,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '0.75rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.35)',
                color: '#ffffff',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                marginTop: '0.75rem',
                fontSize: 'clamp(1rem, 2.3vw, 1.25rem)',
                lineHeight: 1.6,
                maxWidth: '540px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.35)',
                opacity: 0.96,
                color: 'rgba(255,255,255,0.96)',
              }}
            >
              {subtitle}
            </p>

            <div className="hero-nav-row">
              {heroNavLinks.map((item) => (
                <a key={item.href} href={item.href} className="hero-nav-link">
                  {item.label}
                </a>
              ))}
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/accommodation"
                className="btn-primary"
                style={{
                  fontSize: '1rem',
                  padding: '0.75rem 1.75rem',
                  boxShadow: '0 3px 10px rgba(212, 175, 55, 0.35)',
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                }}
              >
                BOOK NOW
              </Link>
              <a
                href="#accommodation"
                className="btn-outline hero-outline"
                style={{
                  fontSize: '1rem',
                  padding: '0.7rem 1.6rem',
                  borderColor: '#fff',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                Explore Rooms
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'rgba(255,255,255,0.8)',
            animation: 'bounce 2s infinite',
            cursor: 'pointer',
          }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.2em' }}>SCROLL</span>
          <span style={{ fontSize: '1.35rem' }}>↓</span>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
      `}</style>
    </section>
  )
}