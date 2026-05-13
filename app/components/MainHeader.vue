<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)
const headerSearchQuery = ref('')
const router = useRouter()

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const submitHeaderSearch = () => {
  const q = headerSearchQuery.value.trim()
  router.push(q ? { path: '/search', query: { q } } : '/search')
}

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    updateTheme()
  }
})
</script>

<template>
  <header class="main-header">
    <nav class="nav-container">
      <div class="nav-links">
        <NuxtLink to="/" class="nav-item">首页</NuxtLink>
        <NuxtLink to="/blog" class="nav-item">博客</NuxtLink>
        <NuxtLink to="/wiki" class="nav-item">Wiki</NuxtLink>
        <NuxtLink to="/about" class="nav-item">关于</NuxtLink>
        <NuxtLink to="/more" class="nav-item">更多页面</NuxtLink>
      </div>

      <form class="header-search" role="search" aria-label="全站搜索" @submit.prevent="submitHeaderSearch">
        <input
          v-model="headerSearchQuery"
          type="search"
          name="q"
          autocomplete="off"
          placeholder="搜索"
          aria-label="搜索全站内容"
        >
        <button type="submit" aria-label="搜索">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z" />
            <path d="m16.3 16.3 4.2 4.2" />
          </svg>
        </button>
      </form>
    </nav>
  </header>

  <button
    @click="toggleDarkMode"
    class="theme-toggle floating-theme-toggle"
    :title="isDark ? '切换到浅色' : '切换到深色'"
  >
    {{ isDark ? '🌙' : '☀️' }}
  </button>
</template>

<style src="~/assets/css/header.css"></style>
