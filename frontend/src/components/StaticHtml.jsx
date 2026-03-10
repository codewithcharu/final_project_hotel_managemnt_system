import { useEffect, useState } from 'react'

function rewriteResourceUrls(html, basePath = '/saved') {
  return html
    .replace(/(src|href)=["']\.\/([^"']+)["']/g, (_m, attr, path) => `${attr}="${basePath}/${path}"`)
    .replace(/(src|href)=["']\/(?!saved)([^"']+)["']/g, (_m, attr, path) => `${attr}="/${path}"`)
}

export default function StaticHtml({ path = '/saved/index.html' }) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}`)
        return res.text()
      })
      .then((text) => setContent(rewriteResourceUrls(text)))
      .catch((e) => setError(e.message))
  }, [path])

  if (error) return <div>{error}</div>
  if (!content) return <div>Loading…</div>

  return <div dangerouslySetInnerHTML={{ __html: content }} />
}