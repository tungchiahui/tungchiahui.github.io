<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  updateTheme()
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
        <NuxtLink to="/stats" class="nav-item">数据</NuxtLink>
        <NuxtLink to="/about" class="nav-item">关于</NuxtLink>
      </div>
      <button
        @click="toggleDarkMode"
        class="theme-toggle"
        :title="isDark ? '切换到浅色' : '切换到深色'"
      >
        {{ isDark ? '🌙' : '☀️' }}
      </button>
    </nav>
  </header>
</template>

<style src="~/assets/css/header.css"></style>


