<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  getCurrentLocaleSlug,
  getLocalizedSearchPath,
  getLocaleSectionPath,
  replaceLocaleInPath
} from '~~/utils/i18n-locales'

const isDark = ref(false)
const headerSearchQuery = ref('')
const route = useRoute()
const router = useRouter()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const homePath = computed(() => replaceLocaleInPath('/', currentLocaleSlug.value))
const blogPath = computed(() => getLocaleSectionPath(currentLocaleSlug.value, 'blog'))
const wikiPath = computed(() => getLocaleSectionPath(currentLocaleSlug.value, 'wiki'))
const searchPath = computed(() => getLocalizedSearchPath(currentLocaleSlug.value))
const aboutPath = computed(() => replaceLocaleInPath('/about', currentLocaleSlug.value))
const morePath = computed(() => replaceLocaleInPath('/more', currentLocaleSlug.value))

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const submitHeaderSearch = () => {
  const q = headerSearchQuery.value.trim()
  router.push(q ? { path: searchPath.value, query: { q } } : searchPath.value)
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
        <NuxtLink :to="homePath" class="nav-item">首页</NuxtLink>
        <NuxtLink :to="blogPath" class="nav-item">博客</NuxtLink>
        <NuxtLink :to="wikiPath" class="nav-item">Wiki</NuxtLink>
        <NuxtLink :to="aboutPath" class="nav-item">关于</NuxtLink>
        <NuxtLink :to="morePath" class="nav-item">更多页面</NuxtLink>
      </div>

      <div class="nav-tools">
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

        <button
          @click="toggleDarkMode"
          class="theme-toggle"
          :title="isDark ? '切换到白天模式' : '切换到黑暗模式'"
          :aria-label="isDark ? '切换到白天模式' : '切换到黑暗模式'"
        >
          <i :class="isDark ? 'fa-solid fa-moon theme-toggle-icon' : 'fa-solid fa-sun theme-toggle-icon'" aria-hidden="true"></i>
        </button>
      </div>
    </nav>
  </header>
</template>

<style src="~/assets/css/header.css"></style>
