<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCalendarStore } from '@/stores/calendar';
import type { CalendarEvent } from '@/types/calendar';

const emit = defineEmits<{
    dayClick: [date: Date]
}>();

const calendarStore = useCalendarStore();

const currentDate = ref(new Date());

const weekStart = computed(() => {
    const date = new Date(currentDate.value);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
});

const weekDays = computed(() => {
    const days = [];
    const start = new Date(weekStart.value);

    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        days.push(date);
    }

    return days;
});

function getEventsForDay(date: Date): CalendarEvent[] {
    return calendarStore.events.filter(event => {
        return event.start.getFullYear() === date.getFullYear() &&
            event.start.getMonth() === date.getMonth() &&
            event.start.getDate() === date.getDate();
    }).sort((a, b) => a.start.getTime() - b.start.getTime());
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function getDayName(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()] || '';
}

function getEventColorClass(eventTitle: string): string {
    const title = eventTitle.trim().toLowerCase();

    // Check most specific patterns first
    if (title.startsWith('e-v-') || title.startsWith('e-v ')) {
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
    }
    if (title.startsWith('e-p-') || title.startsWith('e-p ')) {
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
    }
    if (title.startsWith('v-')) {
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
    }
    if (title.startsWith('p-')) {
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
    if (title.includes('izpit') || title.includes('kolokvij')) {
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
    }

    return 'border-l-gray-500 bg-gray-50 dark:bg-gray-700/20';
}

function getEventIcon(eventTitle: string): string {
    const title = eventTitle.trim().toLowerCase();

    // Check most specific patterns first
    if (title.startsWith('e-v-') || title.startsWith('e-v ')) {
        return '🌐';
    }
    if (title.startsWith('e-p-') || title.startsWith('e-p ')) {
        return '🌐';
    }
    if (title.startsWith('v-')) {
        return '💻';
    }
    if (title.startsWith('p-')) {
        return '📚';
    }
    if (title.includes('izpit') || title.includes('kolokvij')) {
        return '📝';
    }

    return '📅';
}

function isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
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

function shortenTitle(title: string, maxLength: number = 40): string {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
}

function handlePreviousWeek() {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() - 7);
    currentDate.value = newDate;
}

function handleNextWeek() {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() + 7);
    currentDate.value = newDate;
}

function handleThisWeek() {
    currentDate.value = new Date();
}

function getMonthYear(): string {
    const start = weekStart.value;
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startMonth = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (startMonth === endMonth) {
        return startMonth;
    }

    return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function handleDayClick(date: Date) {
    emit('dayClick', date);
}

function getTodayDate(): string {
    const today = new Date();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return `${month} ${day}, ${year}`;
}
</script>

<template>
    <div class="p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="space-y-3 sm:space-y-0 mb-4">
            <div class="text-center sm:text-left">
                <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {{ getMonthYear() }}
                </h2>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 mb-1">
                    Today: {{ getTodayDate() }}
                </p>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
                <button @click="handlePreviousWeek"
                    class="px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium">
                    ← Previous Week
                </button>

                <button @click="handleThisWeek"
                    class="px-4 py-2.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium">
                    This Week
                </button>

                <button @click="handleNextWeek"
                    class="px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium">
                    Next Week →
                </button>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
                <div class="flex items-center gap-2">
                    <label for="group-select" class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <span class="text-base">👥</span>
                        <span>My Group:</span>
                    </label>
                    <select
                        id="group-select"
                        :value="calendarStore.selectedGroup || 'all'"
                        @change="handleGroupChange"
                        class="min-h-[44px] px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer font-medium">
                        <option value="all">All Groups</option>
                        <option value="1">Group 1</option>
                        <option value="2">Group 2</option>
                        <option value="3">Group 3</option>
                        <option value="4">Group 4</option>
                        <option value="5">Group 5</option>
                    </select>
                </div>

                <div v-if="calendarStore.selectedGroup" class="flex flex-col items-center gap-1">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        <span>🔍 Filtering: Group {{ calendarStore.selectedGroup }}</span>
                        <button
                            @click="calendarStore.setSelectedGroup(null)"
                            class="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
                            title="Clear filter">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="text-[0.65rem] text-gray-500 dark:text-gray-400 italic">Other groups shown dimmed</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-2">
            <div v-for="(day, index) in weekDays" :key="index" :class="[
                'border rounded-lg overflow-hidden',
                isToday(day)
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-300 dark:border-gray-600'
            ]">
                <button @click="handleDayClick(day)" :class="[
                    'w-full p-2 text-center border-b hover:opacity-80 transition-opacity',
                    isToday(day)
                        ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                ]">
                    <div class="font-bold text-sm text-gray-900 dark:text-white">
                        {{ getDayName(day) }}
                    </div>
                    <div :class="[
                        'text-xs',
                        isToday(day) ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-gray-600 dark:text-gray-400'
                    ]">
                        {{ day.getDate() }}
                    </div>
                </button>

                <div class="p-2 space-y-1.5 min-h-[100px] bg-white dark:bg-gray-800">
                    <div v-if="getEventsForDay(day).length === 0" class="text-center py-4">
                        <p class="text-xs text-gray-400 dark:text-gray-500">No events</p>
                    </div>

                    <div v-else v-for="event in getEventsForDay(day)" :key="event.id"
                        :class="[getEventColorClass(event.title), shouldDimEvent(event.title) ? 'opacity-45' : 'opacity-100']"
                        class="p-1.5 rounded border-l-4 hover:shadow-sm transition-all cursor-pointer"
                        :title="event.title">
                        <div class="flex items-start gap-1.5">
                            <span class="text-sm flex-shrink-0">{{ getEventIcon(event.title) }}</span>
                            <div class="flex-1 min-w-0">
                                <div class="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                    {{ shortenTitle(event.title, 30) }}
                                </div>
                                <div class="text-[0.65rem] text-gray-600 dark:text-gray-400 mt-0.5">
                                    {{ formatTime(event.start) }}
                                </div>
                                <div v-if="event.location"
                                    class="text-[0.65rem] text-gray-500 dark:text-gray-500 truncate">
                                    📍 {{ event.location }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
