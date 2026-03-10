const highlights = [
  { icon: '🏨', title: 'Comfortable Rooms', copy: 'Well-appointed rooms with modern amenities.', metric: '20+', label: 'Rooms available' },
  { icon: '🌊', title: 'Coastal Location', copy: 'Beautiful location in Beliatta, close to beaches.', metric: '24/7', label: 'Reception service' },
  { icon: '🍽️', title: 'Restaurant & Dining', copy: 'Authentic Sri Lankan and international cuisine.', metric: '01', label: 'Restaurant' },
]

export default function About() {
  return (
    <div className="about-wrapper">
      <div className="about-copy">
        <p>
          Piyakaru Hotel is a welcoming accommodation located in Beliatta, Sri Lanka, on the scenic
          Tangalle Road. Our hotel offers comfortable rooms, excellent service, and a convenient location
          for exploring the beautiful southern coast of Sri Lanka.
        </p>
        <p>
          Whether you're visiting for business or leisure, we provide a comfortable base for your stay.
          Our friendly staff is dedicated to ensuring you have a pleasant experience, and our restaurant
          serves delicious local and international cuisine throughout the day.
        </p>

        <div className="about-facts">
          {highlights.map((item) => (
            <div key={item.title} className="about-fact">
              <div className="about-fact__metric">
                <span>{item.metric}</span>
                <small>{item.label}</small>
              </div>
              <div>
                <div className="about-fact__title">
                  {item.icon} {item.title}
                </div>
                <p>{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-visual">
        <div className="about-frame primary">
          <img
            src="https://images.trvl-media.com/lodging/14000000/13330000/13324200/13324157/77d8c43b.jpg?impolicy=fcrop&w=357&h=201&p=1&q=crop"
            alt="Hotel Exterior"
            onError={(e) =>
              (e.currentTarget.src =
                'https://images.trvl-media.com/lodging/14000000/13330000/13324200/13324157/77d8c43b.jpg?impolicy=fcrop&w=357&h=201&p=1&q=medium')
            }
          />
          <div className="about-pass">
            Located in <strong>Beliatta</strong>
          </div>
        </div>
        <div className="about-frame secondary">
          <img
            src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&h=900&fit=crop"
            alt="Hotel Room"
            onError={(e) =>
              (e.currentTarget.src =
                'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&h=900&fit=crop')
            }
          />
        </div>
      </div>
    </div>
  )
}