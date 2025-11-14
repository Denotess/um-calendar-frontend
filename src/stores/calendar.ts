import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCalendar } from '@/services/api'
import { parseICS } from '@/services/calendarParser'
import type { CalendarEvent } from '@/types/calendar'

const STORAGE_KEY = 'um-calendar-selected'

export const useCalendarStore = defineStore('calendar', () => {
    const selectedCalendar = ref<string>('');
    const events = ref<CalendarEvent[]>([]);
    const loading = ref(false);

    async function loadCalendar(calendarName: string) {
        loading.value = true;
        selectedCalendar.value = calendarName;

        localStorage.setItem(STORAGE_KEY, calendarName);


        const icsData = await getCalendar(calendarName);
        const parsedEvents = parseICS(icsData);

        events.value = parsedEvents;
        loading.value = false;
    }

    function loadSavedCalendar(): string | null {
        return localStorage.getItem(STORAGE_KEY);
    }

    return {
        selectedCalendar,
        events,
        loading,
        loadCalendar,
        loadSavedCalendar
    };
})