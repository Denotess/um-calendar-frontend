<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCalendarStore } from '@/stores/calendar';
import type { CalendarEvent } from '@/types/calendar';
import MonthNavigation from './MonthNavigation.vue';
import DayView from './DayView.vue';
import WeekView from './WeekView.vue';

const calendarStore = useCalendarStore();

const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const currentView = ref<'month' | 'day' | 'week'>('month');
const previousView = ref<'month' | 'week'>('month');
const selectedDate = ref<Date>(new Date());

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

    return days;
});

function getEventsForDay(day: number): CalendarEvent[] {
    const dayDate = new Date(currentYear.value, currentMonth.value, day)

    return calendarStore.events.filter(event => {
        return event.start.getFullYear() === dayDate.getFullYear() &&
            event.start.getMonth() === dayDate.getMonth() &&
            event.start.getDate() === dayDate.getDate()
    })
}

function getEventColor(eventTitle: string): string {
    const title = eventTitle.trim().toLowerCase()

    // Check most specific patterns first
    if (title.startsWith('e-v-') || title.startsWith('e-v ')) {
        return 'text-purple-500'
    }
    if (title.startsWith('e-p-') || title.startsWith('e-p ')) {
        return 'text-orange-500'
    }
    if (title.startsWith('v-')) {
        return 'text-green-500'
    }
    if (title.startsWith('p-')) {
        return 'text-blue-500'
    }
    if (title.includes('izpit') || title.includes('kolokvij')) {
        return 'text-red-500'
    }

    return 'text-gray-500'
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
    selectedDate.value = new Date(currentYear.value, currentMonth.value, day);
    previousView.value = 'month';
    currentView.value = 'day';
}

function handleBackToPreviousView() {
    currentView.value = previousView.value;
}

function handleDateChanged(newDate: Date) {
    selectedDate.value = newDate;
}

function switchToWeekView() {
    currentView.value = 'week';
}

function switchToMonthView() {
    currentView.value = 'month';
}

function handleWeekDayClick(date: Date) {
    selectedDate.value = date;
    previousView.value = 'week';
    currentView.value = 'day';
}

function isToday(day: number): boolean {
    const today = new Date()
    return day === today.getDate() &&
        currentMonth.value === today.getMonth() &&
        currentYear.value === today.getFullYear()
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
    <div v-if="currentView === 'day'">
        <DayView :selected-date="selectedDate" :previous-view="previousView" @back-to-month="handleBackToPreviousView"
            @date-changed="handleDateChanged" />
    </div>

    <div v-else>
        <div class="flex justify-center gap-2 mb-4">
            <button @click="switchToMonthView" class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                :class="currentView === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'">
                Month
            </button>
            <button @click="switchToWeekView" class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                :class="currentView === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'">
                Week
            </button>
        </div>

        <WeekView v-if="currentView === 'week'" @day-click="handleWeekDayClick" />

        <div v-else class="p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <MonthNavigation :current-month="currentMonth" :current-year="currentYear"
                @previous-month="handlePreviousMonth" @next-month="handleNextMonth" @go-to-today="handleGoToToday" />

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <div class="grid grid-cols-2 sm:flex sm:gap-3 md:gap-4 gap-2 text-xs sm:text-sm">
                    <div class="flex items-center gap-1">
                        <span class="text-red-500">●</span>
                        <span class="text-gray-700 dark:text-gray-300">Izpit/Kolokvij</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-blue-500">●</span>
                        <span class="text-gray-700 dark:text-gray-300">Predavanje</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-green-500">●</span>
                        <span class="text-gray-700 dark:text-gray-300">Vaje</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-orange-500">●</span>
                        <span class="text-gray-700 dark:text-gray-300">e-Predavanje</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-purple-500">●</span>
                        <span class="text-gray-700 dark:text-gray-300">e-Vaje</span>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <label for="group-select-month" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        My Group:
                    </label>
                    <select
                        id="group-select-month"
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
            </div>

            <div class="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <div class="min-w-[280px]">
                    <div class="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                        <div v-for="dayName in dayNames" :key="dayName"
                            class="text-center font-bold text-gray-700 dark:text-gray-300 p-1 sm:p-2 text-xs sm:text-sm">
                            {{ dayName }}
                        </div>
                    </div>

                    <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
                        <div v-for="(day, index) in calendarDays" :key="index" class="text-center aspect-square">
                            <div v-if="day === null" class="p-1 sm:p-2"></div>
                            <button v-else @click="onDayClick(day)" :class="[
                                'w-full h-full p-1 sm:p-2 border rounded transition-colors text-xs sm:text-sm md:text-base flex flex-col items-center justify-center',
                                isToday(day)
                                    ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-100 font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/60'
                                    : 'text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                            ]">
                                <span class="font-medium">{{ day }}</span>
                                <div class="flex gap-0.5 sm:gap-1 justify-center mt-0.5 sm:mt-1 flex-wrap">
                                    <span v-for="event in getEventsForDay(day)" :key="event.id"
                                        :class="[getEventColor(event.title), shouldDimEvent(event.title) ? 'opacity-30' : 'opacity-100']"
                                        class="text-[0.5rem] sm:text-xs leading-none transition-opacity">
                                        ●
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
