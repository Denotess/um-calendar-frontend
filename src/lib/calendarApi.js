const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

function toApiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export async function fetchCalendarNames() {
  const response = await fetch(toApiUrl('/data/names'))

  if (!response.ok) {
    throw new Error(`Failed to load calendar names: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    const bodyPreview = (await response.text()).slice(0, 120)
    throw new Error(
      `Expected JSON from /data/names but received ${contentType || 'unknown content type'}. ` +
        `Response starts with: ${JSON.stringify(bodyPreview)}. ` +
        `Check VITE_API_BASE (use origin only, e.g. https://example.com, not https://example.com/data).`
    )
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

export async function fetchCalendarIcs(calendarName) {
  const encodedName = encodeURIComponent(calendarName)
  const response = await fetch(toApiUrl(`/data/cal/${encodedName}`))

  if (!response.ok) {
    throw new Error(`Failed to load calendar: ${response.status}`)
  }

  return response.text()
}
