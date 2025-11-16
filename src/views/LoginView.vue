<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password.'
    return
  }
  try {
    const response = await fetch('http://localhost:5232/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await response.json()
    if (response.ok) {
      // Save JWT token (example: localStorage)
      localStorage.setItem('token', data.token)
      // Redirect to home page
      error.value = ''
      router.push('/')
    } else {
      error.value = data.message || 'Login failed.'
    }
  } catch (e) {
    error.value = 'Network error.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Login</h2>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <input v-model="email" type="email" placeholder="Email" class="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="password" type="password" placeholder="Password" class="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" class="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Login</button>
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
      <div class="mt-4 text-center">
        <router-link to="/register" class="text-blue-600 hover:underline">Don't have an account? Register</router-link>
      </div>
    </div>
  </div>
</template>
