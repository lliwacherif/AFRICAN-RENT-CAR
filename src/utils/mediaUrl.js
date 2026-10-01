export function normalizeMediaUrl(value, apiBase = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api') {
  if (typeof value !== 'string') return ''
  const url = value.trim()
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) {
    return url.replace(/^http:\/\/res\.cloudinary\.com\//i, 'https://res.cloudinary.com/')
  }
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('res.cloudinary.com/')) return `https://${url}`
  const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
  const storedImage = url.match(/^\/?(?:api\/)?(upload\/images\/[a-f\d]{24})$/i)
  if (storedImage) {
    const base = new URL(apiBase, origin).href.replace(/\/+$/, '')
    return new URL(storedImage[1], `${base}/`).href
  }
  if (/^\/?(?:api\/)?uploads\//.test(url)) return new URL(`/${url.replace(/^\//, '')}`, new URL(apiBase, origin)).href
  if (url.startsWith('/') && !url.startsWith('//')) return url
  return ''
}

export function normalizeMediaFields(data, apiBase) {
  if (Array.isArray(data)) return data.map(item => normalizeMediaFields(item, apiBase))
  if (!data || typeof data !== 'object') return data
  return Object.fromEntries(Object.entries(data).map(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) return [key, value.map(url => normalizeMediaUrl(url, apiBase)).filter(Boolean)]
    if (['image', 'imageUrl', 'thumbnail', 'thumbnailUrl', 'model3dUrl'].includes(key) && typeof value === 'string') {
      return [key, normalizeMediaUrl(value, apiBase)]
    }
    return [key, normalizeMediaFields(value, apiBase)]
  }))
}
