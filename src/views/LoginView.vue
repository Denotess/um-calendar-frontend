<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const auth = useAuthStore()

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
      // Save JWT token
      localStorage.setItem('token', data.token)
      auth.login(data.token)
      // Redirect to home page
      error.value = ''
      router.push('/');
      setTimeout(() => window.location.reload(), 100)
    } else {
      error.value = data.message || 'Login failed.'
    }
  } catch (e) {
    error.value = 'Network error.'
  }
}

 onMounted(() => {
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get('token');
   if (token) {
     localStorage.setItem('token', token);
     auth.login(token);
     router.push('/');
     setTimeout(() => window.location.reload(), 100);
   }
 });

function handleGoogleLogin () {
  window.location.href = "http://localhost:5232/user/signin-google";
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
        <div class="mt-4">
          <button
            @click="handleGoogleLogin"
            class="w-full py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.16 2.36 30.45 0 24 0 14.64 0 6.4 5.64 2.44 14.02l8.01 6.23C12.6 13.16 17.87 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.54-.14-3.02-.39-4.45H24v8.43h12.45c-.54 2.92-2.18 5.39-4.65 7.05l7.19 5.59C43.98 37.36 46.1 31.41 46.1 24.55z"/><path fill="#FBBC05" d="M10.45 28.25c-.62-1.84-.98-3.8-.98-5.75s.36-3.91.98-5.75l-8.01-6.23C.8 14.91 0 19.32 0 24s.8 9.09 2.44 13.48l8.01-6.23z"/><path fill="#EA4335" d="M24 48c6.45 0 11.86-2.13 15.81-5.81l-7.19-5.59c-2.01 1.35-4.59 2.15-8.62 2.15-6.13 0-11.4-3.66-13.55-8.75l-8.01 6.23C6.4 42.36 14.64 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
