import axios from 'axios'
import type { TokenResponse, CalendarName } from '@/types/calendar'

// axios instance and set base url to api url
const api = axios.create({
  //baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5232',
  baseURL: 'http://localhost:5232',
})

// jwt token => memory
let jwtToken: string | null = null

async function getToken(): Promise<string> {
  const response = await api.post<TokenResponse>('/auth/generate-token', {
    username: 'guest',
    role: 'user',
  })
  jwtToken = response.data.token
  return jwtToken
}

export async function getCalendarNames(): Promise<CalendarName[]> {
  if (!jwtToken) {
    await getToken()
  }

  const response = await api.get<CalendarName[]>('/data/names', {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  })

  return response.data
}

export async function getCalendar(name: string): Promise<string> {
  if (!jwtToken) {
    await getToken()
  }

  const response = await api.get<string>(`/data/cal/${name}`, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  })
  return response.data
}
