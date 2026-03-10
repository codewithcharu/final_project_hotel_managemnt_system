import { useState } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { submitContactInquiry } from '../api/client'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitted(false)

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      await submitContactInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message,
        inquiryType: formData.inquiryType
      })
      
    setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
      
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="accom-hero" style={{ 
        backgroundImage: 'url(https://media-cdn.tripadvisor.com/media/photo-s/2f/a4/13/c9/caption.jpg?cacheBust=1)',
        minHeight: '50vh'
      }}>
        <div className="overlay">
          <div className="content">
            <h1 style={{ margin: 0 }}>Contact Us</h1>
            <p style={{ marginTop: 8, fontSize: '1.125rem' }}>
              We're here to help make your stay exceptional
            </p>
          </div>
        </div>
      </div>

      <AnimatedSection style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          <div>
            <h3 style={{ 
              color: 'var(--accent)', 
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              Get in Touch
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Whether you're planning a stay, event, or simply have questions, 
              we'd love to hear from you.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                📍 Address
              </h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Tangalle Road, Beliatta, Sri Lanka
            </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                📞 Phone
              </h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
                <a href="tel:+94472251207" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'block' }}>
                  +94 47 225 1207
                </a>
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                ✉️ Email
              </h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                <a href="mailto:infopiyakaru@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  infopiyakaru@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                🕒 Business Hours
              </h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8 }}>
                Monday - Sunday: 24/7<br />
                Reception: 6:00 AM - 11:00 PM
              </p>
            </div>
          </div>

          <div style={{
            background: '#fff',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              Send us a Message
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="inquiryType">Inquiry Type *</label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="reservation">Reservation</option>
                  <option value="dining">Dining</option>
                  <option value="events">Events & Weddings</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+94 XX XXX XXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tell us how we can help..."
                />
              </div>

              {error && (
                <div style={{ 
                  color: 'crimson', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: '#fee',
                  borderRadius: '8px',
                  border: '1px solid #fcc'
                }}>
                  {error}
                </div>
              )}

              {submitted && (
                <div style={{ 
                  color: 'green', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: '#efe',
                  borderRadius: '8px',
                  border: '1px solid #cfc'
                }}>
                  ✓ Thank you! Your message has been sent. We'll get back to you soon.
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <div style={{
          marginTop: '4rem',
          background: 'linear-gradient(135deg, var(--bg) 0%, #1a2540 100%)',
          borderRadius: '16px',
          padding: '3rem',
          color: '#fff',
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '2rem' }}>
            Visit Us
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
            Visit Piyakaru Hotel in person. We're conveniently located on Tangalle Road in Beliatta, 
            offering easy access to beautiful beaches and local attractions.
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.1234567890123!2d80.3456789!3d7.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMDcnMjQuNCJOIDgwwrAyMCc0NC40IkU!5e0!3m2!1sen!2slk!4v1234567890123!5m2!1sen!2slk"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Piyakaru Hotel Location"
            />
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}


