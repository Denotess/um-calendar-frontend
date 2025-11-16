<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')

const passwordMinLength = computed(() => password.value.length >= 8)
const passwordHasUppercase = computed(() => /[A-Z]/.test(password.value))
const passwordHasSpecial = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(password.value))
const passwordsMatch = computed(() => password.value === confirmPassword.value && confirmPassword.value.length > 0)
const passwordStarted = computed(() => password.value.length > 0)
const error = ref('')
const router = useRouter()

async function handleRegister() {
  error.value = ''
  if (!email.value || !name.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill out all fields.'
    return
  }
  // Gmail restrictions
  const gmailRegex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9_-])*@gmail\.com$/
  if (!gmailRegex.test(email.value)) {
    error.value = 'Please enter a valid Gmail address.'
    return
  }
  // Password restrictions
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (!/[A-Z]/.test(password.value)) {
    error.value = 'Password must contain at least one uppercase letter.'
    return
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password.value)) {
    error.value = 'Password must contain at least one special character.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  try {
    const response = await fetch('http://localhost:5232/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, name: name.value, password: password.value })
    })
    const data = await response.json()
    if (response.ok) {
      // Registration success, redirect to login
      error.value = ''
      router.push('/login')
    } else {
      error.value = data.message || 'Registration failed.'
    }
  } catch (e) {
    error.value = 'Network error.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Register</h2>
      <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
        <input v-model="email" type="email" placeholder="Email" class="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="name" type="text" placeholder="Name" class="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="password" type="password" placeholder="Password" class="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <ul v-if="passwordStarted" class="text-xs mb-2">
          <li :class="passwordMinLength ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
            <span v-if="passwordMinLength">✔</span><span v-else>✖</span>
            Minimum 8 characters
          </li>
          <li :class="passwordHasUppercase ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
            <span v-if="passwordHasUppercase">✔</span><span v-else>✖</span>
            At least one uppercase letter
          </li>
          <li :class="passwordHasSpecial ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
            <span v-if="passwordHasSpecial">✔</span><span v-else>✖</span>
            At least one special character
          </li>
        </ul>
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" class="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div v-if="confirmPassword.length > 0" class="text-xs mb-2" :class="passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
          <span v-if="passwordsMatch">✔</span><span v-else>✖</span>
          Passwords match
        </div>
        <button type="submit" class="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Register</button>
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
      <div class="mt-4 text-center">
        <router-link to="/login" class="text-blue-600 hover:underline">Already have an account? Login</router-link>
      </div>
    </div>
  </div>
</template>
