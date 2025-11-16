<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const isOpen = ref(false)
const themeStore = useThemeStore()
const auth = useAuthStore()
</script>
<template>
  <!-- Hamburger Icon -->
  <button @click="isOpen = !isOpen" aria-label="Open menu"
    class="flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 dark:bg-gray-700">
    <span :class="['block w-7 h-1 rounded transition-all duration-300', isOpen ? 'rotate-45 translate-y-2 bg-blue-500 dark:bg-blue-400' : 'bg-gray-800 dark:bg-gray-200 mb-1']"></span>
    <span :class="['block w-7 h-1 rounded transition-all duration-300', isOpen ? 'opacity-0' : 'bg-gray-800 dark:bg-gray-200 mb-1']"></span>
    <span :class="['block w-7 h-1 rounded transition-all duration-300', isOpen ? '-rotate-45 -translate-y-2 bg-blue-500 dark:bg-blue-400' : 'bg-gray-800 dark:bg-gray-200']"></span>
  </button>

  <!-- Overlay -->
  <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 bg-black bg-opacity-40 z-40"></div>

  <!-- Side Menu Panel -->
  <nav v-if="isOpen" class="fixed top-0 left-0 w-2/3 max-w-xs h-full bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col p-6 gap-4 animate-slide-in">
    <div class="flex items-center justify-between mb-6">
      <span class="text-xl font-bold text-gray-900 dark:text-white">Menu</span>
      <button @click="isOpen = false" aria-label="Close menu" class="text-gray-500 dark:text-gray-400 hover:text-blue-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  <router-link to="/" class="mb-2 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400">Home</router-link>
  <router-link to="/about" class="mb-2 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400">About</router-link>
  <router-link v-if="!auth.isLoggedIn" to="/login" class="mb-2 text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline">Login</router-link>
  <router-link v-if="!auth.isLoggedIn" to="/register" class="mb-2 text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline">Register</router-link>
  <button v-if="auth.isLoggedIn" @click="auth.logout" class="mb-2 text-lg font-medium text-red-600 dark:text-red-400 hover:underline">Sign Out</button>
  <a href="#" class="mb-2 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400">Contact</a>
    <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
      <button @click="themeStore.toggleTheme"
        class="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        :title="themeStore.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'">
        <svg v-if="themeStore.theme === 'dark'" class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
          </path>
        </svg>
        <svg v-else class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
        <span class="text-base font-medium text-gray-800 dark:text-gray-200">
          {{ themeStore.theme === 'light' ? 'Dark Mode' : 'Light Mode' }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
@keyframes slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in {
  animation: slide-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
