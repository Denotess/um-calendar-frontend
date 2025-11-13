<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCalendarNames } from '@/services/api';
import { useCalendarStore } from '@/stores/calendar';
import { watch } from 'vue';

const calendarStore = useCalendarStore();

const calendars = ref<string[]>([]);
const selectedCalendar = ref<string>('');
const loading = ref(false);

watch(selectedCalendar, (newValue) => {
    if (newValue) {
        calendarStore.loadCalendar(newValue)
    }
})

async function loadCalendars() {
    loading.value = true;
    calendars.value = await getCalendarNames();
    loading.value = false;
}

onMounted(() => {
    loadCalendars()
})
</script>
<template>
    <div class="p-4">
        <label class="block text-lg font-bold mb-2 text-gray-900 dark:text-white">
            Select Calendar:
        </label>

        <select v-model="selectedCalendar"
            class="w-full p-2 border rounded bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Choose a calendar --</option>
            <option v-for="calendar in calendars" :key="calendar" :value="calendar">
                {{ calendar }}
            </option>
        </select>

        <p v-if="loading" class="mt-2 text-gray-600">Loading calendars...</p>
    </div>
</template>