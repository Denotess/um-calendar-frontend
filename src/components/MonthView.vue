<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCalendarStore } from '@/stores/calendar'
import type { CalendarEvent } from '@/types/calendar'
import MonthNavigation from './MonthNavigation.vue'

const calendarStore = useCalendarStore()

const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const daysInMonth = computed(() => {
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
    return lastDay.getDate()
})

const firstDayOfWeek = computed(() => {
    const firstDay = new Date(currentYear.value, currentMonth.value, 1)
    return firstDay.getDay()
})

const calendarDays = computed(() => {
    const days: (number | null)[] = []

    for (let i = 0; i < firstDayOfWeek.value; i++) {
        days.push(null)
    }

    for (let day = 1; day <= daysInMonth.value; day++) {
        days.push(day)
    }

    return days
})

function hasEvents(day: number): boolean {
    const dayDate = new Date(currentYear.value, currentMonth.value, day)

    return calendarStore.events.some(event => {
        return event.start.getFullYear() === dayDate.getFullYear() &&
            event.start.getMonth() === dayDate.getMonth() &&
            event.start.getDate() === dayDate.getDate()
    })
}

function getEventsForDay(day: number): CalendarEvent[] {
    const dayDate = new Date(currentYear.value, currentMonth.value, day)

    return calendarStore.events.filter(event => {
        return event.start.getFullYear() === dayDate.getFullYear() &&
            event.start.getMonth() === dayDate.getMonth() &&
            event.start.getDate() === dayDate.getDate()
    })
}

function getEventColor(eventTitle: string): string {
    const title = eventTitle.toLowerCase()

    if (title.includes('izpit') || title.includes('kolokvij')) return 'text-red-500'
    if (title.includes('v-')) return 'text-green-500'
    if (title.includes('p-')) return 'text-blue-500'
    if (title.includes('e-p') || title.includes('e-V')) return 'text-yellow-500'

    return 'text-blue-900'
}

function handlePreviousMonth() {
    currentMonth.value--
    if (currentMonth.value < 0) {
        currentMonth.value = 11
        currentYear.value--
    }
}

function handleNextMonth() {
    currentMonth.value++
    if (currentMonth.value > 11) {
        currentMonth.value = 0
        currentYear.value++
    }
}

function handleGoToToday() {
    const today = new Date()
    currentMonth.value = today.getMonth()
    currentYear.value = today.getFullYear()
}

function onDayClick(day: number) {
    const events = getEventsForDay(day)
    console.log(`Clicked on day ${day}`)
    console.log('Events:', events)
    // TODO: Show day view with event details
}
</script>
<template>
    <div class="p-4 bg-white rounded-lg shadow">
        <!-- Month Navigation Component -->
        <MonthNavigation :current-month="currentMonth" :current-year="currentYear" @previous-month="handlePreviousMonth"
            @next-month="handleNextMonth" @go-to-today="handleGoToToday" />

        <!-- Legend -->
        <div class="flex gap-4 mb-4 text-sm justify-center flex-wrap">
            <div class="flex items-center gap-1">
                <span class="text-red-500">●</span>
                <span class="text-gray-700">Izpit/Kolokvij</span>
            </div>
            <div class="flex items-center gap-1">
                <span class="text-blue-500">●</span>
                <span class="text-gray-700">Predavanje</span>
            </div>
            <div class="flex items-center gap-1">
                <span class="text-green-500">●</span>
                <span class="text-gray-700">Vaje</span>
            </div>
            <div class="flex items-center gap-1">
                <span class="text-yellow-500">●</span>
                <span class="text-gray-700">E-učilnica</span>
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="dayName in dayNames" :key="dayName" class="text-center font-bold text-gray-700 p-2">
                {{ dayName }}
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
            <div v-for="(day, index) in calendarDays" :key="index" class="text-center">
                <div v-if="day === null" class="p-2"></div>
                <button v-else @click="onDayClick(day)"
                    class="w-full p-2 border rounded text-gray-900 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    {{ day }}
                    <div class="flex gap-1 justify-center mt-1">
                        <span v-for="event in getEventsForDay(day)" :key="event.id" :class="getEventColor(event.title)"
                            class="text-xs">
                            ●
                        </span>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>