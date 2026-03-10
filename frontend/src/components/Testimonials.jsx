import AnimatedSection from './AnimatedSection'

const testimonials = [
  {
    name: 'Nuwan Ekanayake',
    role: 'Guest',
    rating: 5,
    text: 'Very lush and elegant place. The transformation of a once-dilapidated historic house into a vibrant and inviting restaurant is a testament to the power of preservation and innovation. This revitalization not only breathes new life into the past but also creates a unique dining experience that seamlessly blends history and modernity. Prices are not that much higher. Nice place for a family gathering.'
  },
  {
    name: 'Gayeshan HewaMithige',
    role: 'Guest',
    rating: 5,
    text: 'I had an unforgettable lunch experience at Piyakaru Hotel in Beliatta! The moment I stepped inside, I was captivated by the welcoming atmosphere. The restaurant offers a comfortable setting, creating the perfect ambiance for a delightful meal. The food was exceptional, with authentic Sri Lankan cuisine and international favorites. The staff was attentive and friendly, ensuring that every aspect of my dining experience was flawless.'
  },
  {
    name: 'Nethmal Warusamana',
    role: 'Guest',
    rating: 5,
    text: 'Excellent staff. Very friendly and professional. Had an awesome dining experience. Delicious food at a reasonable price. Located in a beautiful, serene spot. Highly recommended for casual dine-ins and getaways.'
  },
  {
    name: 'Luxmimalar',
    role: 'Family Guest',
    rating: 5,
    text: 'Gem not to be missed - extraordinary stay. Every aspect of the hotel was extraordinary. Must stay hotel to appreciate the intricacy of luxurious deco.'
  }
]

export default function Testimonials() {
  return (
    <AnimatedSection style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: '4rem 1.5rem',
      background: 'linear-gradient(135deg, var(--bg) 0%, #1a2540 100%)',
      color: '#fff'
    }}>
      <div className="section-title" style={{ color: '#fff' }}>
        <h2 style={{ color: 'var(--accent)' }}>What Our Guests Say</h2>
        <p style={{ 
          maxWidth: 600, 
          margin: '1rem auto', 
          fontSize: '1.125rem',
          color: 'rgba(255,255,255,0.9)'
        }}>
          Read about the experiences of our valued guests
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
      }}>
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ 
              marginBottom: '1rem',
              color: 'var(--accent)',
              fontSize: '1.25rem'
            }}>
              {'⭐'.repeat(testimonial.rating)}
            </div>
            <p style={{ 
              margin: '0 0 1.5rem 0', 
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.8,
              fontStyle: 'italic'
            }}>
              "{testimonial.text}"
            </p>
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '1rem'
            }}>
              <div style={{ 
                fontWeight: 600, 
                color: '#fff',
                marginBottom: '0.25rem'
              }}>
                {testimonial.name}
              </div>
              <div style={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.875rem'
              }}>
                {testimonial.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  )
}

