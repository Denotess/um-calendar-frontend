import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const THEME_STORAGE_KEY = 'um-calendar-theme'

export const useThemeStore = defineStore('theme', () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null
    const theme = ref<'light' | 'dark'>(savedTheme || 'light')

    watch(theme, (newTheme) => {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, { immediate: true })

    function toggleTheme() {
        console.log('Toggle clicked, current theme:', theme.value)
        theme.value = theme.value === 'light' ? 'dark' : 'light'
        console.log('New theme:', theme.value)
    }

    return {
        theme,
        toggleTheme
    }
})
