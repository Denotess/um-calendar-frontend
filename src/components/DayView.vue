<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCalendarStore } from '@/stores/calendar';

const props = defineProps<{
    selectedDate: Date;
    previousView?: 'month' | 'week';
}>();

const emit = defineEmits<{
    backToMonth: [];
    dateChanged: [date: Date];
}>();

const calendarStore = useCalendarStore()

const currentDay = ref(props.selectedDate.getDate())
const currentMonth = ref(props.selectedDate.getMonth())
const currentYear = ref(props.selectedDate.getFullYear())

const dayEvents = computed(() => {
    const targetDate = new Date(currentYear.value, currentMonth.value, currentDay.value)

    return calendarStore.events.filter(event => {
        return event.start.getFullYear() === targetDate.getFullYear() &&
            event.start.getMonth() === targetDate.getMonth() &&
            event.start.getDate() === targetDate.getDate()
    })
})

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}

function getEventColor(eventTitle: string): string {
    const title = eventTitle.trim().toLowerCase()

    // Check most specific patterns first
    if (title.startsWith('e-v-') || title.startsWith('e-v ')) {
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-400'
    }
    if (title.startsWith('e-p-') || title.startsWith('e-p ')) {
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 dark:border-orange-400'
    }
    if (title.startsWith('v-')) {
        return 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400'
    }
    if (title.startsWith('p-')) {
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400'
    }
    if (title.includes('izpit') || title.includes('kolokvij')) {
        return 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-400'
    }

    return 'bg-gray-100 dark:bg-gray-700 border-gray-500 dark:border-gray-400';
}

function handlePreviousDay() {
    currentDay.value--
    if (currentDay.value < 1) {
        currentMonth.value--
        if (currentMonth.value < 0) {
            currentMonth.value = 11
            currentYear.value--
        }
        const daysInNewMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
        currentDay.value = daysInNewMonth
    }
    emitDateChange()
}

function handleNextDay() {
    const daysInCurrentMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
    currentDay.value++
    if (currentDay.value > daysInCurrentMonth) {
        currentDay.value = 1
        currentMonth.value++
        if (currentMonth.value > 11) {
            currentMonth.value = 0
            currentYear.value++
        }
    }
    emitDateChange()
}
function handleGoToToday() {
    const today = new Date()
    currentDay.value = today.getDate()
    currentMonth.value = today.getMonth()
    currentYear.value = today.getFullYear()
    emitDateChange()
}

function emitDateChange() {
    const newDate = new Date(currentYear.value, currentMonth.value, currentDay.value)
    emit('dateChanged', newDate)
}

function getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()] || ''
}

function getMonthName(monthIndex: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[monthIndex] || 'Unknown'
}

function formatFullDate(): string {
    return `${getMonthName(currentMonth.value)} ${currentDay.value}, ${currentYear.value}`
}

function extractGroupNumber(title: string): string | null {
    const match = title.match(/(\d+)\.\s*skupina/i);
    return match ? (match[1] ?? null) : null;
}

function shouldDimEvent(eventTitle: string): boolean {
    const title = eventTitle.trim().toLowerCase();

    // Only apply dimming to vaje events
    if (!title.startsWith('v-') && !title.startsWith('e-v-') && !title.startsWith('e-v ')) {
        return false;
    }

    // If no group is selected, don't dim anything
    if (!calendarStore.selectedGroup) {
        return false;
    }

    const groupNumber = extractGroupNumber(eventTitle);

    // If event has no group, don't dim it
    if (!groupNumber) {
        return false;
    }

    // Dim if the group doesn't match the selected group
    return groupNumber !== calendarStore.selectedGroup;
}

function handleGroupChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value === 'all' ? null : target.value;
    calendarStore.setSelectedGroup(value);
}
</script>

<template>
    <div class="p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <button @click="emit('backToMonth')"
            class="mb-4 px-4 py-2.5 sm:py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium w-full sm:w-auto">
            ← Back to {{ props.previousView === 'week' ? 'Week' : 'Month' }}
        </button>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 mb-4">
            <button @click="handlePreviousDay"
                class="px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium">
                ← Previous Day
            </button>

            <button @click="handleGoToToday"
                class="px-4 py-2.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium">
                Today
            </button>

            <button @click="handleNextDay"
                class="px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium">
                Next Day →
            </button>
        </div>

        <div class="flex items-center justify-center gap-2 mb-4">
            <label for="group-select-day" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                My Group:
            </label>
            <select
                id="group-select-day"
                :value="calendarStore.selectedGroup || 'all'"
                @change="handleGroupChange"
                class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Groups</option>
                <option value="1">Group 1</option>
                <option value="2">Group 2</option>
                <option value="3">Group 3</option>
                <option value="4">Group 4</option>
                <option value="5">Group 5</option>
            </select>
        </div>

        <div class="mb-6 text-center">
            <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {{ getDayName(new Date(currentYear, currentMonth, currentDay)) }}
            </h3>
            <p class="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mt-1">
                {{ formatFullDate() }}
            </p>
        </div>

        <div v-if="dayEvents.length > 0" class="space-y-3 sm:space-y-4">
            <h4 class="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Events ({{ dayEvents.length }})
            </h4>

            <div v-for="event in dayEvents" :key="event.id" :class="[getEventColor(event.title), shouldDimEvent(event.title) ? 'opacity-30' : 'opacity-100']"
                class="p-3 sm:p-4 rounded-lg border-l-4 transition-opacity">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h5 class="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-1">
                            {{ event.title }}
                        </h5>

                        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                            🕒 {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
                        </p>

                        <p v-if="event.location" class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                            📍 {{ event.location }}
                        </p>

                        <p v-if="event.description" class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-2">
                            {{ event.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                No events scheduled for this day
            </p>
        </div>
    </div>
</template>
