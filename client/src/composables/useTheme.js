import { ref, watch } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
}

applyTheme(theme.value)

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  watch(theme, applyTheme)
  return { theme, toggleTheme }
}
