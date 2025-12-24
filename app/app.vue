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
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    updateTheme()
  }
})
</script>

<template>
  <div class="app-layout">
    <header class="main-header">
      <nav class="nav-container">
        <div class="nav-links">
          <NuxtLink to="/" class="nav-item">🏠 首页</NuxtLink>
          <NuxtLink to="/about" class="nav-item">ℹ️ 关于我</NuxtLink>
        </div>
        <button @click="toggleDarkMode" class="theme-toggle" :title="isDark ? '切换到浅色' : '切换到深色'">
          {{ isDark ? '🌙' : '☀️' }}
        </button>
      </nav>
    </header>

    <main class="page-body">
      <NuxtPage />
    </main>

    <footer class="main-footer">
      © 2025 我的个人博客 - Powered by Nuxt
    </footer>
  </div>
</template>

<style>
/* 0. 全局变量定义 */
:root {
  --bg-color: #ffffff;
  --text-main: #333333;
  --nav-border: #eeeeee;
  --footer-text: #999999;
}

/* 黑暗模式变量 */
html.dark {
  --bg-color: #1a1a1a;
  --text-main: #dcdcdc;
  --nav-border: #333333;
  --footer-text: #777777;
}

/* 1. 基础全局样式 */
html, body {
  margin: 0; padding: 0;
  background-color: var(--bg-color);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-layout {
  font-family: sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  border-bottom: 1px solid var(--nav-border);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.nav-container {
  display: flex;
  justify-content: space-between; /* 链接在左，按钮在右 */
  align-items: center;
}

.nav-item {
  margin-right: 15px;
  font-weight: bold;
  text-decoration: none;
  color: inherit; /* 跟随主题文字颜色 */
}

.theme-toggle {
  background: var(--nav-border);
  border: 1px solid transparent;
  padding: 5px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.2s;
}
.theme-toggle:hover { transform: scale(1.1); }

.page-body { flex: 1; }

.main-footer {
  margin-top: 50px;
  color: var(--footer-text);
  font-size: 0.8rem;
  text-align: center;
  padding-bottom: 20px;
}
</style>