import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCalendar } from '@/services/api'
import { parseICS } from '@/services/calendarParser'
import type { CalendarEvent } from '@/types/calendar'

const STORAGE_KEY = 'um-calendar-selected'
const GROUP_STORAGE_KEY = 'um-calendar-selected-group'

export const useCalendarStore = defineStore('calendar', () => {
    const selectedCalendar = ref<string>('');
    const events = ref<CalendarEvent[]>([]);
    const loading = ref(false);
    const selectedGroup = ref<string | null>(null);

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

    function setSelectedGroup(group: string | null) {
        selectedGroup.value = group;
        if (group === null) {
            localStorage.removeItem(GROUP_STORAGE_KEY);
        } else {
            localStorage.setItem(GROUP_STORAGE_KEY, group);
        }
    }

    function loadSavedGroup(): string | null {
        const saved = localStorage.getItem(GROUP_STORAGE_KEY);
        if (saved) {
            selectedGroup.value = saved;
        }
        return saved;
    }

    return {
        selectedCalendar,
        events,
        loading,
        selectedGroup,
        loadCalendar,
        loadSavedCalendar,
        setSelectedGroup,
        loadSavedGroup
    };
})
