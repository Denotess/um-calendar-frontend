<script setup lang="ts">
import CalendarSelector from '@/components/CalendarSelector.vue';
import MonthView from '@/components/MonthView.vue';
</script>

<template>
  <main class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
    <CalendarSelector />
    <MonthView />
  </main>
</template>