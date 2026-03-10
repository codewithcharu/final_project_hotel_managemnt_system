const images = [
  { url: 'https://images.trvl-media.com/lodging/14000000/13330000/13324200/13324157/77d8c43b.jpg?impolicy=fcrop&w=357&h=201&p=1&q=crop', title: 'Hotel Exterior' },
  { url: 'https://foto.hrsstatic.com/fotos/0/2/269/213/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2Fdms%2F909427%2FEAN%2Fff5f70e4_z.jpg/c5f171c6928b54a9c943441b504df1ca/500%2C333/6/Taru_Villas_Mawella_-_Tangalle-Beliatta-Info-19-909427.jpg?crop=375,250', title: 'Hotel Pool Area' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMul87h9XiEYThzpw2way42uNwxMb-BjBD9w&s=crop', title: 'Restaurant' },
  { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&h=900&fit=crop', title: 'Comfortable Room' },
  { url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&h=900&fit=crop', title: 'Standard Room' },
  { url: 'https://pix10.agoda.net/hotelImages/77531607/0/1c4721e65ec06b1cbc0eb3c3caa10028.jpg?ce=2&s=702x392', title: 'Hotel Grounds' },
  { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&h=900&fit=crop', title: 'Breakfast Area' },
  { url: 'https://imgservice.rentbyowner.com/375x250/piyakaru-nature-resort-lk-beliatta-bc-6233179-0.jpg?crop=375,250', title: 'Evening View' },
  { url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg3vwR47ZwjmPSBeCrK7r3Ei6H9BZJ7aNfHCplQLJnldlFrUQtj62mh_7CYXFgVVHNp19YYHgz14_P2qo7qHJ3f0J3rhCxImyBTkF4jdgNuFcOUhHbOz7lYu8jb013mAtPmLXsus9VKZJFd/s1600/piyawara_04-007399-E.jpg', title: 'Dining Hall' },
  { url: 'https://q-xx.bstatic.com/xdata/images/hotel/840x460/526936691.jpg?k=87e3f2b0a3747bc2bc1112eee123b38c5e3da5bde0e4c0175b56037aad0f0a69&o=crop', title: 'Poolside Relaxation' },
  { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&h=900&fit=crop', title: 'Reception Area' },
  { url: 'https://cf.bstatic.com/xdata/images/hotel/270x200/184846642.jpg?k=718fce2289aded225aeac380c12043de0ac9a181b0ac4e0499dbc804c97e85c0&o=crop', title: 'Garden View' },
]

import { useEffect, useState } from 'react'

export default function Gallery() {
  const [items, setItems] = useState(images)

  useEffect(() => {
    fetch('/piyakaru-hotel/manifest.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('manifest not found'))))
      .then((data) => {
        if (Array.isArray(data) && data.length) setItems(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="gallery-grid">
      {items.map((img) => (
        <div key={img.url} className="gallery-card">
          <img
            src={img.url}
            alt={img.title}
            onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop')}
          />
          <div className="overlay">
            <div>{img.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}