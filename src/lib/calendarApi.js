const API_BASE = import.meta.env.VITE_API_BASE ?? ''

function toApiUrl(path) {
  return `${API_BASE}${path}`
}

export async function fetchCalendarNames() {
  const response = await fetch(toApiUrl('/data/names'))

  if (!response.ok) {
    throw new Error(`Failed to load calendar names: ${response.status}`)
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
