import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCalendar } from '@/services/api'
import { parseICS } from '@/services/calendarParser'
import type { CalendarEvent } from '@/types/calendar'

export const useCalendarStore = defineStore('calendar', () => {
    const selectedCalendar = ref<string>('');
    const events = ref<CalendarEvent[]>([]);
    const loading = ref(false);

    async function loadCalendar(calendarName: string) {
        loading.value = true;
        selectedCalendar.value = calendarName;

        const icsData = await getCalendar(calendarName);
        const parsedEvents = parseICS(icsData);

        events.value = parsedEvents;
        loading.value = false;
    }

    // Return what other components can use
    return {
        selectedCalendar,
        events,
        loading,
        loadCalendar
    };
})