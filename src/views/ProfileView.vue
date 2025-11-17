<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const user = ref<{ name: string; email: string; createdAt: string } | null>(null)
const auth = useAuthStore()

onMounted(async () => {
  const token = auth.token || localStorage.getItem('token')
  if (!token) return
	try {
		const response = await fetch('http://localhost:5232/user/profile', {
			headers: { Authorization: `Bearer ${token}` }
		})
		if (response.ok) {
			user.value = await response.json()
		}
	} catch {}
})
</script>
<template>
	<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
		<div class="w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800">
			<h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Profile Settings</h2>
			<div v-if="user" class="flex flex-col gap-4">
				<div>
					<span class="font-semibold text-gray-700 dark:text-gray-300">Username:</span>
					<span class="ml-2 text-gray-900 dark:text-white">{{ user.name }}</span>
				</div>
				<div>
					<span class="font-semibold text-gray-700 dark:text-gray-300">Gmail:</span>
					<span class="ml-2 text-gray-900 dark:text-white">{{ user.email }}</span>
				</div>
				<div>
					<span class="font-semibold text-gray-700 dark:text-gray-300">Created At:</span>
					<span class="ml-2 text-gray-900 dark:text-white">{{ new Date(user.createdAt).toLocaleString() }}</span>
				</div>
			</div>
			<div v-else class="text-center text-gray-500 dark:text-gray-400">Loading profile...</div>
		</div>
	</div>
</template>
