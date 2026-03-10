import { useState } from 'react'

export default function ImageFromUrl() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const onChange = (e) => {
    setUrl(e.target.value.trim())
    setError('')
  }

  const show = Boolean(url)

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="url"
          placeholder="Paste image URL (https://...)"
          value={url}
          onChange={onChange}
          style={{ flex: 1, padding: '0.5rem' }}
        />
      </div>
      {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
      {show && (
        <div style={{ marginTop: '1rem' }}>
          <img
            src={url}
            alt="Remote"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            onError={() => setError('Cannot load image from the provided URL')}
            onLoad={() => setError('')}
          />
        </div>
      )}
    </div>
  )
}