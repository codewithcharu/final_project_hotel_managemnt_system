import AnimatedSection from './AnimatedSection'

const features = [
  {
    icon: '🏊',
    title: 'Swimming Pool',
    description: 'Take a dip in our enormous outdoor pool on a warm day for soothing relaxation.'
  },
  {
    icon: '📶',
    title: 'Free Wi-Fi',
    description: 'We offer free Wi-Fi access throughout the hotel. Add a special value to your vacation.'
  },
  {
    icon: '🅿️',
    title: 'Parking Space',
    description: 'We give you a perfect parking space. Enjoy your holidays with our valuable service.'
  },
  {
    icon: '🛏️',
    title: 'Luxury Accommodation',
    description: 'Experience the epitome of luxury in our range of elegant rooms and suites.'
  },
  {
    icon: '🍽️',
    title: 'Fine Dining Restaurant',
    description: 'Indulge in authentic Sri Lankan cuisine and international favorites at Piyakaru Hotel\'s restaurant.'
  },
  {
    icon: '💒',
    title: 'Weddings & Events',
    description: 'Let our dedicated events team bring your vision to life amidst the grandeur of our property.'
  }
]

export default function Features() {
  return (
    <AnimatedSection style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: '4rem 1.5rem',
      background: '#f9fafb'
    }}>
      <div className="section-title">
        <h2>Hotel Facilities</h2>
        <p style={{ maxWidth: 600, margin: '1rem auto', fontSize: '1.125rem' }}>
          Discover the amenities and services that make your stay exceptional
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
      }}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              border: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
              e.currentTarget.style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {feature.icon}
            </div>
            <h4 style={{ 
              marginBottom: '0.75rem', 
              fontSize: '1.25rem',
              color: 'var(--text-primary)'
            }}>
              {feature.title}
            </h4>
            <p style={{ 
              margin: 0, 
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </AnimatedSection>
  )
}

