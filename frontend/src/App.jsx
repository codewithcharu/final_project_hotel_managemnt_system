import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import AnimatedSection from './components/AnimatedSection'
import Gallery from './components/Gallery'
import Accommodation from './pages/Accommodation'
import Dining from './pages/Dining'
import WeddingsEvents from './pages/WeddingsEvents'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Staff from './pages/Staff'
import KitchenAdmin from './pages/KitchenAdmin'
import ScrollToTop from './components/ScrollToTop'
import Chatbot from './components/Chatbot/Chatbot'
import { Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Section({ id, title, children, variant = 'panel' }) {
  return (
    <AnimatedSection id={id} className={`section-block section-${variant}`}>
      <div className="section-title">
        <h2>{title}</h2>
      </div>
      <div className="section-body">{children}</div>
    </AnimatedSection>
  )
}

export default function App() {
  return (
    <div>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div id="home">
                <Hero
                  title="Piyakaru Hotel"
                  subtitle="Your perfect coastal retreat in the heart of Beliatta, Sri Lanka"
                  imageUrl="https://images.trvl-media.com/lodging/14000000/13330000/13324200/13324157/77d8c43b.jpg?impolicy=fcrop&w=357&h=201&p=1&q=crop"
                />
              </div>

              <Section id="about" title="About Us">
                <About />
              </Section>

              <Section id="dining" title="Dining">
                <div className="section-showcase" data-theme="dining">
                  <div className="section-showcase__copy">
                    <p>
                      Experience authentic Sri Lankan cuisine and international favorites at Piyakaru Hotel.
                      Our restaurant offers fresh seafood, traditional curries, and continental dishes prepared
                      with locally sourced ingredients. Enjoy your meals in our elegant dining room or al fresco
                      with beautiful coastal views.
                    </p>
                    <ul>
                      <li>Fresh seafood and traditional Sri Lankan cuisine</li>
                      <li>Breakfast buffet with local and international options</li>
                      <li>Private dining arrangements for special occasions</li>
                    </ul>
                    <Link to="/dining" className="btn-primary btn-ghost">
                      Explore Our Menu
                    </Link>
                  </div>
                  <div className="section-showcase__media">
                    <img
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop"
                      alt="Piyakaru Hotel dining"
                    />
                    <span>Restaurant</span>
                  </div>
                </div>
              </Section>

              <Section id="accommodation" title="Accommodation">
                <div className="section-showcase">
                  <div className="section-showcase__copy">
                    <p>
                      Comfortable and well-appointed rooms await you at Piyakaru Hotel. Each room is designed
                      for relaxation with modern amenities, air conditioning, and beautiful views of the surrounding
                      area. Whether you're traveling for business or leisure, we ensure a comfortable stay.
                    </p>
                    <div className="section-stats">
                      <div>
                        <strong>20+</strong>
                        <span>Comfortable rooms</span>
                      </div>
                      <div>
                        <strong>24/7</strong>
                        <span>Reception service</span>
                      </div>
                      <div>
                        <strong>Free</strong>
                        <span>WiFi & Parking</span>
                      </div>
                    </div>
                    <Link to="/accommodation" className="btn-primary btn-ghost">
                      View All Rooms
                    </Link>
                  </div>
                  <div className="section-showcase__media dual">
                    <img
                      src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop"
                      alt="Deluxe Double Room"
                      onError={(e) =>
                      (e.currentTarget.src =
                        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop')
                      }
                    />
                    <img
                      src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=800&fit=crop"
                      alt="Standard Room"
                      onError={(e) =>
                      (e.currentTarget.src =
                        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=800&fit=crop')
                      }
                    />
                  </div>
                </div>
              </Section>

              <Features />

              <Section id="gallery" title="Gallery">
                <Gallery />
              </Section>

              <Section id="weddings-events" title="Weddings & Events">
                <p style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2rem', fontSize: '1.125rem' }}>
                  Host your special moments at Piyakaru Hotel. From weddings to corporate events,
                  our versatile spaces and attentive service create unforgettable experiences.
                </p>
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <Link to="/weddings-events" className="btn-primary">Plan Your Event</Link>
                </div>
              </Section>

              <Section id="contact" title="Contact Us" variant="light">
                <p style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2rem', fontSize: '1.125rem' }}>
                  Piyakaru Hotel offers comfortable accommodation in beautiful Beliatta. Contact
                  us for reservations and inquiries.
                </p>
                <div style={{
                  textAlign: 'center',
                  marginTop: '2rem',
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Link to="/contact" className="btn-primary">Get in Touch</Link>
                  <a href="tel:+94472251207" className="btn-outline">Call Us</a>
                </div>
              </Section>
            </>
          }
        />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/weddings-events" element={<WeddingsEvents />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
      </Routes>
      <Footer />
      <Chatbot />
    </div>
  )
}
