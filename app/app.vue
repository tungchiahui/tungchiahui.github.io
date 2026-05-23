<template>
  <AppLoadingOverlay
    :active="loadingActive"
    :mode="loadingMode"
    :label="loadingLabel"
  />

  <div class="app-layout">
    <MainHeader />
    <main class="page-body" :class="$route.path === '/' ? 'home-page' : ''">
      <NuxtPage />
    </main>
    <MainFooter />

    <!-- 音乐播放器 -->
    <MusicPlayer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AppLoadingOverlay from './components/AppLoadingOverlay.vue'
import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import { getUiTextForPath } from '~~/utils/i18n-ui'

const route = useRoute()
const router = useRouter()
const nuxtApp = useNuxtApp()

type LoadingMode = 'screen' | 'reader'

const getContentRoutePath = (path: string) => path.replace(/^\/(?:zh-cn|zh-hant|zh-hk|zh-tw|en-us)(?=\/)/, '')

const isReaderRoute = (path: string) => /^\/(?:blog|wiki)\/.+/.test(getContentRoutePath(path))

const getLoadingLabel = (path: string, mode: LoadingMode) => {
  const contentPath = getContentRoutePath(path)
  const ui = getUiTextForPath(path)

  if (mode === 'reader') {
    return contentPath.startsWith('/wiki/') ? ui.loadingReaderWiki : ui.loadingReaderBlog
  }

  if (contentPath === '/') return ui.loadingHome
  if (contentPath.startsWith('/wiki')) return ui.loadingWiki
  if (contentPath.startsWith('/blog')) return ui.loadingBlog
  if (contentPath.startsWith('/search')) return ui.loadingSearch
  return ui.loadingPage
}

const isHashOnlyNavigation = (to: { path: string; hash: string; query: unknown }, from: { path: string; hash: string; query: unknown }) => {
  return to.path === from.path && to.hash !== from.hash && JSON.stringify(to.query) === JSON.stringify(from.query)
}

const isSamePageNavigation = (to: { path: string }, from: { path: string }) => to.path === from.path

const loadingActive = ref(false)
const loadingMode = ref<LoadingMode>('screen')
const loadingLabel = ref(getLoadingLabel(route.path, 'screen'))

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let removeBeforeEach: (() => void) | null = null
let removeAfterEach: (() => void) | null = null
let removeRouterError: (() => void) | null = null

const clearTimer = (timer: ReturnType<typeof setTimeout> | null) => {
  if (timer) clearTimeout(timer)
}

const beginLoading = (path: string) => {
  clearTimer(showTimer)
  clearTimer(hideTimer)

  const mode: LoadingMode = isReaderRoute(path) ? 'reader' : 'screen'
  const delay = mode === 'reader' ? 180 : 240

  loadingMode.value = mode
  loadingLabel.value = getLoadingLabel(path, mode)

  showTimer = setTimeout(() => {
    loadingActive.value = true
  }, delay)
}

const finishLoading = (force = false) => {
  clearTimer(showTimer)
  clearTimer(hideTimer)

  if (!loadingActive.value) {
    return
  }

  const delay = force ? 0 : 30

  hideTimer = setTimeout(() => {
    loadingActive.value = false
  }, delay)
}

onMounted(() => {
  removeBeforeEach = router.beforeEach((to, from) => {
    if (to.fullPath === from.fullPath || isHashOnlyNavigation(to, from) || isSamePageNavigation(to, from)) return
    beginLoading(to.path)
  })

  removeAfterEach = router.afterEach((_to, _from, failure) => {
    if (failure) finishLoading(true)
  })

  removeRouterError = router.onError(() => finishLoading(true))
})

nuxtApp.hook('page:finish', () => finishLoading())
nuxtApp.hook('page:loading:end', () => finishLoading())
nuxtApp.hook('app:error', () => finishLoading(true))

onUnmounted(() => {
  clearTimer(showTimer)
  clearTimer(hideTimer)
  removeBeforeEach?.()
  removeAfterEach?.()
  removeRouterError?.()
})
</script>
