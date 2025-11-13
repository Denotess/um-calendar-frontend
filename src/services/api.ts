import axios from 'axios'
import type { TokenResponse, CalendarName } from '@/types/calendar'


// get from env
const API_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY


// axios instance and set base url to api url
const api = axios.create({
    baseURL: 'https://um-calendar-backend.azurewebsites.net'
})

// jwt token => memory
let jwtToken: string | null = null

async function getToken(): Promise<string> {

    const response = await api.get<TokenResponse>("/generate-token/", {
        headers: {
            'X-API-Key': API_KEY
        }
    })
    jwtToken = response.data.token
    return jwtToken
}

export async function getCalendarNames(): Promise<CalendarName[]> {
    if (!jwtToken) {
        await getToken()
    }

    const response = await api.get<CalendarName[]>("/names", {
        headers: {
            Authorization: `Bearer ${jwtToken}`
        }
    })

    return response.data
}

export async function getCalendar(name: string): Promise<string> {
    if (!jwtToken) {
        await getToken()
    }

    const response = await api.get<string>(`/cal/${name}`, {
        headers: {
            Authorization: `Bearer ${jwtToken}`
        }
    })
    return response.data
}