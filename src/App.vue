<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img src="../src/assets/UM-calendar-logo.png" class="h-[4em] object-contain">

          <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            UM Calendar
          </h1>
        </div>

        <button @click="themeStore.toggleTheme"
          class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
          :title="themeStore.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'">
          <svg v-if="themeStore.theme === 'dark'" class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
            </path>
          </svg>
          <svg v-else class="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        </button>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<style scoped></style>
