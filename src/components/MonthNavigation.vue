<script setup lang="ts">
const props = defineProps<{
    currentMonth: number
    currentYear: number
}>()

const emit = defineEmits<{
    previousMonth: []
    nextMonth: []
    goToToday: []
}>()

function getMonthName(monthIndex: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[monthIndex] || 'Unknown'
}
</script>

<template>
    <div class="flex items-center justify-between mb-4">
        <button @click="emit('previousMonth')"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            ← Previous
        </button>

        <h2 class="text-2xl font-bold text-gray-900">
            {{ getMonthName(currentMonth) }} {{ currentYear }}
        </h2>

        <button @click="emit('nextMonth')"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Next →
        </button>
    </div>

    <div class="flex justify-center mb-4">
        <button @click="emit('goToToday')"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
            Today
        </button>
    </div>
</template>
