<script setup lang="ts">
import CalendarSelector from '@/components/CalendarSelector.vue';
import MonthView from '@/components/MonthView.vue';
</script>

<template>
  <main class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">UM Calendar Viewer</h1>
    <CalendarSelector />
    <MonthView />
  </main>
</template>