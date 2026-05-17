<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import mediumZoom from 'medium-zoom'
import {
  getContentPathCandidates,
  getCurrentLocaleSlug,
  getLocaleSectionPath
} from '~~/utils/i18n-locales'
import { getWikiLegacyPathAliases } from '~~/utils/wiki-legacy-paths'

interface TocDisplayLink {
  id: string
  text: string
  depth: number
  level: number
  number: string
}

interface WikiPage {
  path: string
  stem?: string
  title: string
  date?: string
  localeSlug?: string
  i18nKey?: string
  sourcePath?: string
  legacyPath?: string
  chapter?: string
  chapterSort?: number
  docKey?: string
  docI18nKey?: string
  docRoot?: string
  docTitle?: string
  isWikiDoc?: boolean
  isWikiIndex?: boolean
  body?: unknown
  [key: string]: unknown
}

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const wikiHomePath = computed(() => getLocaleSectionPath(currentLocaleSlug.value, 'wiki'))

function collectTrafficPaths(entry: Partial<WikiPage> | null | undefined, fallbackPath?: string) {
  return Array.from(
    new Set([
      entry?.path,
      entry?.sourcePath,
      entry?.legacyPath,
      fallbackPath,
      ...getWikiLegacyPathAliases((entry as WikiPage | null | undefined)?.docI18nKey, (entry as WikiPage | null | undefined)?.isWikiIndex)
    ]
      .filter(Boolean)
      .map(path => normalizePath(String(path))))
  )
}

function formatNumber(value: number | undefined) {
  return Math.max(0, Number(value || 0)).toLocaleString('zh-CN')
}

function formatPercent(numerator: number, denominator: number) {
  if (!denominator) return '--'
  return `${Math.round((numerator / denominator) * 100)}%`
}

function formatDuration(totalSeconds: number, visits: number) {
  if (!visits) return '--'

  const seconds = Math.max(0, Math.round(totalSeconds / visits))
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return minutes > 0 ? `${minutes}分 ${remainSeconds}秒` : `${remainSeconds}秒`
}

const { data: page, pending } = await useAsyncData(
  `wiki-page-${route.path}`,
  async () => {
    for (const path of getContentPathCandidates(route.path, 'wiki')) {
      const normalizedPath = normalizePath(path)
      const result = await queryCollection('content')
        .where('path', '=', normalizedPath)
        .first()

      if (result) {
        return result as WikiPage
      }
    }

    return null
  }
)

if (!pending.value && !page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Wiki 頁面不存在',
    fatal: true
  })
}

const { data: docItems } = await useAsyncData(
  `wiki-doc-items-${route.path}`,
  async () => {
    const docKey = page.value?.docKey

    if (!docKey) {
      return [] as WikiPage[]
    }

    return await queryCollection('content')
      .where('docKey', '=', docKey)
      .select(
        'path',
        'stem',
        'title',
        'date',
        'chapter',
        'chapterSort',
        'docKey',
        'docRoot',
        'docTitle',
        'isWikiDoc',
        'isWikiIndex'
      )
      .all() as WikiPage[]
  }
)

const docIndex = computed(() => docItems.value?.find(item => item.isWikiIndex) || null)
const chapterItems = computed(() =>
  (docItems.value || [])
    .filter(item => !item.isWikiIndex)
    .sort(sortByChapter)
)
const docNavigationItems = computed(() => [
  ...(docIndex.value ? [docIndex.value] : []),
  ...chapterItems.value
])

const pagePath = computed(() => normalizePath(page.value?.path || route.path))

const currentNavIndex = computed(() =>
  docNavigationItems.value.findIndex(item => normalizePath(item.path) === pagePath.value)
)

const previousPage = computed(() => {
  const index = currentNavIndex.value
  return index > 0 ? docNavigationItems.value[index - 1] : null
})

const nextPage = computed(() => {
  const index = currentNavIndex.value
  return index >= 0 && index < docNavigationItems.value.length - 1
    ? docNavigationItems.value[index + 1]
    : null
})

const docTitle = computed(() =>
  docIndex.value?.title || page.value?.docTitle || page.value?.title || 'Wiki'
)

const pageTitle = computed(() => {
  if (!page.value) return '載入中...'
  return page.value.chapter ? `${page.value.chapter} ${page.value.title}` : page.value.title
})

const { data: i18nVariantPaths } = await useAsyncData(
  `wiki-i18n-paths-${route.path}`,
  async () => {
    const i18nKey = page.value?.i18nKey

    if (!i18nKey) {
      return collectTrafficPaths(page.value, pagePath.value)
    }

    const variants = await queryCollection('content')
      .where('i18nKey', '=', i18nKey)
      .select('path', 'sourcePath', 'legacyPath', 'docI18nKey', 'isWikiIndex')
      .all() as Array<Partial<WikiPage>>

    return variants.flatMap(variant => collectTrafficPaths(variant))
  }
)

const trafficPaths = computed(() =>
  (i18nVariantPaths.value?.length ? i18nVariantPaths.value : collectTrafficPaths(page.value, pagePath.value))
)

const { data: umamiPathData, pending: umamiPending, refresh: refreshUmamiPathData } = useAsyncData(
  `wiki-umami-${route.path}`,
  () => fetchUmamiPathsStats(trafficPaths.value, resolveUmamiRange()),
  {
    server: false,
    default: () => null
  }
)

const trafficStats = computed(() => umamiPathData.value || null)

const trafficDisplay = computed(() => {
  const stats = trafficStats.value
  const pageviews = stats?.pageviews || 0
  const visits = stats?.visits || 0
  const bounces = stats?.bounces || 0
  const totaltime = stats?.totaltime || 0

  return {
    pageviews: formatNumber(pageviews),
    visits: formatNumber(visits),
    bounceRate: formatPercent(bounces, visits),
    avgVisitDuration: formatDuration(totaltime, visits)
  }
})

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: page.value?.title || '' },
    { property: 'og:title', content: pageTitle.value },
  ]
}))

const showDocNav = ref(false)
const showToc = ref(false)
const activeHeadingId = ref('')
const readingProgress = ref(0)
const tocLinks = ref<TocDisplayLink[]>([])
const headingScrollOffset = 88
const pendingAnchorId = ref('')
const scrollRetryTimers: ReturnType<typeof setTimeout>[] = []
const imageLoadCleanupFns: Array<() => void> = []
const anchorSettleDelays = [820, 1300, 2100]
let zoomInstance: ReturnType<typeof mediumZoom> | null = null
let anchorAnimationFrame: number | null = null
let contentResizeObserver: ResizeObserver | null = null

const hasMobileDrawer = computed(() => showDocNav.value || showToc.value)

const updateReadingProgress = () => {
  const trackLength = document.documentElement.scrollHeight - window.innerHeight
  if (trackLength <= 0) {
    readingProgress.value = 0
    return
  }

  readingProgress.value = Math.min(100, Math.max(0, (window.scrollY / trackLength) * 100))
}

const updateActiveHeading = () => {
  if (!tocLinks.value.length) return

  const headings = document.querySelectorAll('.wiki-content-body h2, .wiki-content-body h3, .wiki-content-body h4, .wiki-content-body h5, .wiki-content-body h6')
  const scrollPosition = window.scrollY + headingScrollOffset + 12
  let active = ''

  headings.forEach((heading) => {
    const element = heading as HTMLElement
    if (element.offsetTop <= scrollPosition) {
      active = element.id
    }
  })

  activeHeadingId.value = active
}

const buildTocFromDom = () => {
  const headings = Array.from(
    document.querySelectorAll('.wiki-content-body h2, .wiki-content-body h3, .wiki-content-body h4, .wiki-content-body h5, .wiki-content-body h6')
  ) as HTMLElement[]

  const result: TocDisplayLink[] = []
  const counters: number[] = []
  let previousTagLevel = 0
  let previousLogicalLevel = 1

  headings.forEach((heading) => {
    if (!heading.id) return

    const tagLevel = Number(heading.tagName.slice(1))
    if (!Number.isFinite(tagLevel)) return

    let logicalLevel = 1
    if (previousTagLevel === 0) {
      logicalLevel = 1
    } else if (tagLevel > previousTagLevel) {
      logicalLevel = Math.min(previousLogicalLevel + 1, 5)
    } else if (tagLevel === previousTagLevel) {
      logicalLevel = previousLogicalLevel
    } else {
      logicalLevel = Math.max(1, previousLogicalLevel - (previousTagLevel - tagLevel))
    }

    counters[logicalLevel - 1] = (counters[logicalLevel - 1] || 0) + 1
    counters.length = logicalLevel

    const cloned = heading.cloneNode(true) as HTMLElement
    cloned.querySelectorAll('.heading-number').forEach(node => node.remove())

    result.push({
      id: heading.id,
      text: (cloned.textContent || '').trim(),
      depth: tagLevel,
      level: logicalLevel,
      number: counters.join('.')
    })

    previousTagLevel = tagLevel
    previousLogicalLevel = logicalLevel
  })

  tocLinks.value = result
}

const applyHeadingDecorations = () => {
  const headingMap = new Map(tocLinks.value.map(item => [item.id, item.number]))
  const headings = document.querySelectorAll('.wiki-content-body h2, .wiki-content-body h3, .wiki-content-body h4, .wiki-content-body h5, .wiki-content-body h6')

  headings.forEach((heading) => {
    const element = heading as HTMLElement
    const number = headingMap.get(element.id)

    element.querySelector('.heading-number')?.remove()
    if (!number) return

    const numberSpan = document.createElement('span')
    numberSpan.className = 'heading-number'
    numberSpan.textContent = `${number} `
    numberSpan.setAttribute('aria-hidden', 'true')
    element.prepend(numberSpan)
  })
}

const enhanceCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.wiki-content-body pre') as NodeListOf<HTMLElement>

  codeBlocks.forEach((block) => {
    if (block.querySelector('.code-toolbar')) return

    const toolbar = document.createElement('div')
    toolbar.className = 'code-toolbar'

    const langClass = Array.from(block.classList).find(className => className.startsWith('language-'))
    const language = langClass ? langClass.replace('language-', '').toUpperCase() : 'CODE'
    const langLabel = document.createElement('span')
    langLabel.className = 'code-language'
    langLabel.textContent = language
    toolbar.appendChild(langLabel)

    const copyButton = document.createElement('button')
    copyButton.className = 'code-copy-btn'
    copyButton.type = 'button'
    copyButton.textContent = '复制'

    copyButton.addEventListener('click', async () => {
      const code = block.querySelector('code')
      const text = code?.textContent || block.textContent || ''

      try {
        await navigator.clipboard.writeText(text)
        copyButton.textContent = '已复制'
        copyButton.classList.add('copied')
        setTimeout(() => {
          copyButton.textContent = '复制'
          copyButton.classList.remove('copied')
        }, 1800)
      } catch (error) {
        console.error('复制失败:', error)
      }
    })

    toolbar.appendChild(copyButton)
    block.insertBefore(toolbar, block.firstChild)
  })
}

const enhanceTables = () => {
  const tables = document.querySelectorAll('.wiki-content-body table') as NodeListOf<HTMLTableElement>

  tables.forEach((table) => {
    if (table.parentElement?.classList.contains('table-scroll')) return

    const wrapper = document.createElement('div')
    wrapper.className = 'table-scroll'
    table.parentNode?.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })
}

const initImageZoom = () => {
  if (zoomInstance) {
    zoomInstance.detach()
  }

  zoomInstance = mediumZoom('.wiki-content-body img', {
    margin: 24,
    background: 'rgba(0, 0, 0, 0.8)',
    scrollOffset: 0,
  })
}

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

const cancelAnchorAnimation = () => {
  if (anchorAnimationFrame === null) return

  window.cancelAnimationFrame(anchorAnimationFrame)
  anchorAnimationFrame = null
}

const getHeadingTargetTop = (id: string) => {
  const element = document.getElementById(id)
  if (!element) return null

  return Math.max(0, element.getBoundingClientRect().top + window.scrollY - headingScrollOffset)
}

const animateWindowScrollTo = (top: number, behavior: ScrollBehavior = 'smooth') => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const startTop = window.scrollY
  const distance = top - startTop

  if (behavior !== 'smooth' || prefersReducedMotion || Math.abs(distance) < 2) {
    cancelAnchorAnimation()
    window.scrollTo({ top, behavior: 'auto' })
    updateActiveHeading()
    updateReadingProgress()
    return
  }

  cancelAnchorAnimation()
  const duration = Math.min(720, Math.max(320, Math.abs(distance) * 0.28))
  const startTime = window.performance.now()

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / duration)
    window.scrollTo(0, startTop + distance * easeOutCubic(progress))

    if (progress < 1) {
      anchorAnimationFrame = window.requestAnimationFrame(step)
      return
    }

    anchorAnimationFrame = null
    updateActiveHeading()
    updateReadingProgress()
  }

  anchorAnimationFrame = window.requestAnimationFrame(step)
}

const clearScrollRetryTimers = () => {
  scrollRetryTimers.forEach(timer => clearTimeout(timer))
  scrollRetryTimers.length = 0
  cancelAnchorAnimation()
}

const clearImageLoadListeners = () => {
  imageLoadCleanupFns.forEach(fn => fn())
  imageLoadCleanupFns.length = 0
}

const scrollHeadingToOffset = (id: string, behavior: ScrollBehavior = 'smooth') => {
  const top = getHeadingTargetTop(id)
  if (top === null) return false

  animateWindowScrollTo(top, behavior)
  return true
}

const warmImagesBeforeHeading = async (id: string) => {
  const headingTop = getHeadingTargetTop(id)
  if (headingTop === null) return

  const images = Array.from(document.querySelectorAll('.wiki-content-body img')) as HTMLImageElement[]
  const pendingImages = images.filter((image) => {
    const imageTop = image.getBoundingClientRect().top + window.scrollY
    return imageTop < headingTop && !image.complete
  })

  if (!pendingImages.length) return

  await Promise.race([
    Promise.allSettled(pendingImages.map((image) => {
      image.loading = 'eager'

      if (image.decode) {
        return image.decode().catch(() => undefined)
      }

      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    })),
    new Promise(resolve => setTimeout(resolve, 900))
  ])
}

const correctHeadingPosition = (id: string, behavior: ScrollBehavior = 'smooth') => {
  const top = getHeadingTargetTop(id)
  if (top === null) return false

  if (Math.abs(window.scrollY - top) > 4) {
    animateWindowScrollTo(top, behavior)
  }
  updateActiveHeading()
  updateReadingProgress()
  return true
}

const scheduleAnchorSettle = (id: string) => {
  anchorSettleDelays.forEach((delay) => {
    const timer = setTimeout(() => {
      if (pendingAnchorId.value !== id) return
      correctHeadingPosition(id, 'smooth')
    }, delay)
    scrollRetryTimers.push(timer)
  })

  const doneTimer = setTimeout(() => {
    if (pendingAnchorId.value === id) {
      pendingAnchorId.value = ''
    }
  }, anchorSettleDelays[anchorSettleDelays.length - 1] + 500)
  scrollRetryTimers.push(doneTimer)
}

const decodeAnchorHash = (hash: string) => {
  const rawHash = hash.startsWith('#') ? hash.slice(1) : hash
  if (!rawHash) return ''

  try {
    return decodeURIComponent(rawHash)
  } catch {
    return rawHash
  }
}

const updateUrlHash = (id: string) => {
  const nextHash = `#${encodeURIComponent(id)}`
  if (window.location.hash === nextHash) return

  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${nextHash}`
  )
}

const settleScrollToHeading = (
  id: string,
  behavior: ScrollBehavior = 'smooth',
  shouldUpdateHash = false
) => {
  clearScrollRetryTimers()
  pendingAnchorId.value = id

  if (getHeadingTargetTop(id) === null) {
    pendingAnchorId.value = ''
    return false
  }

  if (shouldUpdateHash) {
    updateUrlHash(id)
  }

  warmImagesBeforeHeading(id).finally(() => {
    if (pendingAnchorId.value !== id) return
    scrollHeadingToOffset(id, behavior)
    scheduleAnchorSettle(id)
  })

  return true
}

const scrollToCurrentHash = (behavior: ScrollBehavior = 'auto') => {
  const id = decodeAnchorHash(window.location.hash || route.hash)
  if (!id) return
  settleScrollToHeading(id, behavior)
}

const handleHashChange = () => {
  scrollToCurrentHash('smooth')
}

const cancelPendingAnchorScroll = () => {
  pendingAnchorId.value = ''
  clearScrollRetryTimers()
}

const setupImageLoadReflowSync = () => {
  clearImageLoadListeners()

  const images = document.querySelectorAll('.wiki-content-body img') as NodeListOf<HTMLImageElement>
  images.forEach((image) => {
    if (image.complete) return

    const handleImageSettled = () => {
      updateActiveHeading()
      if (pendingAnchorId.value) {
        correctHeadingPosition(pendingAnchorId.value, 'smooth')
      }
    }

    image.addEventListener('load', handleImageSettled, { once: true })
    image.addEventListener('error', handleImageSettled, { once: true })
    imageLoadCleanupFns.push(() => {
      image.removeEventListener('load', handleImageSettled)
      image.removeEventListener('error', handleImageSettled)
    })
  })
}

const setupContentResizeSync = () => {
  contentResizeObserver?.disconnect()
  contentResizeObserver = null

  const content = document.querySelector('.wiki-content-body')
  if (!content) return

  contentResizeObserver = new ResizeObserver(() => {
    updateActiveHeading()
    if (pendingAnchorId.value) {
      correctHeadingPosition(pendingAnchorId.value, 'smooth')
    }
  })
  contentResizeObserver.observe(content)
}

const enhanceContent = async () => {
  await nextTick()
  buildTocFromDom()
  enhanceCodeBlocks()
  enhanceTables()
  initImageZoom()
  applyHeadingDecorations()
  setupImageLoadReflowSync()
  setupContentResizeSync()
  updateActiveHeading()
}

const scrollToHeading = (id: string) => {
  const hasScrolled = settleScrollToHeading(id, 'smooth', true)
  if (!hasScrolled) {
    closeDrawers()
    return
  }

  closeDrawers()
}

const closeDrawers = () => {
  showDocNav.value = false
  showToc.value = false
}

const isCurrentPath = (path: string) => normalizePath(path) === pagePath.value
const isTocActive = (id: string) => activeHeadingId.value === id

watch(hasMobileDrawer, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

watch(() => page.value, () => {
  enhanceContent()
})

watch(() => route.hash, (hash) => {
  if (!import.meta.client || !hash) return

  const id = decodeAnchorHash(hash)
  if (id) {
    settleScrollToHeading(id, 'smooth')
  }
})

watch(() => route.path, () => {
  refreshUmamiPathData()
})

onMounted(async () => {
  await enhanceContent()
  window.addEventListener('scroll', updateReadingProgress)
  window.addEventListener('scroll', updateActiveHeading)
  window.addEventListener('hashchange', handleHashChange)
  window.addEventListener('wheel', cancelPendingAnchorScroll, { passive: true })
  window.addEventListener('touchstart', cancelPendingAnchorScroll, { passive: true })
  window.addEventListener('keydown', cancelPendingAnchorScroll)
  updateReadingProgress()
  scrollToCurrentHash('auto')
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingProgress)
  window.removeEventListener('scroll', updateActiveHeading)
  window.removeEventListener('hashchange', handleHashChange)
  window.removeEventListener('wheel', cancelPendingAnchorScroll)
  window.removeEventListener('touchstart', cancelPendingAnchorScroll)
  window.removeEventListener('keydown', cancelPendingAnchorScroll)
  clearScrollRetryTimers()
  clearImageLoadListeners()
  contentResizeObserver?.disconnect()
  contentResizeObserver = null
  document.body.style.overflow = ''

  if (zoomInstance) {
    zoomInstance.detach()
  }
})

function sortByChapter(a: WikiPage, b: WikiPage) {
  return (a.chapterSort || 0) - (b.chapterSort || 0) || a.title.localeCompare(b.title)
}

function normalizePath(path: string) {
  return path.replace(/\/$/, '') || '/'
}
</script>

<template>
  <div class="wiki-doc-page">
    <div class="reading-progress-bar" :style="{ width: `${readingProgress}%` }" />

    <Transition name="fade">
      <button
        v-if="hasMobileDrawer"
        class="wiki-drawer-backdrop"
        aria-label="關閉導覽"
        @click="closeDrawers"
      />
    </Transition>

    <div v-if="pending" class="loading-state">
      <div class="loading-spinner" />
      <p>載入中...</p>
    </div>

    <div v-else-if="page" class="wiki-shell">
      <aside
        v-if="docNavigationItems.length"
        class="wiki-doc-sidebar"
        :class="{ 'is-open': showDocNav }"
      >
        <div class="sidebar-header">
          <NuxtLink :to="wikiHomePath" class="sidebar-back">Wiki</NuxtLink>
          <button class="sidebar-close" type="button" @click="closeDrawers">關閉</button>
        </div>

        <NuxtLink :to="docIndex?.path || (page as WikiPage).docRoot || wikiHomePath" class="doc-title-link">
          {{ docTitle }}
        </NuxtLink>

        <nav class="doc-nav">
          <NuxtLink
            v-for="item in docNavigationItems"
            :key="item.path"
            :to="item.path"
            class="doc-nav-link"
            :class="{ 'is-active': isCurrentPath(item.path), 'is-index': item.isWikiIndex }"
            :style="{ '--doc-depth': String(Math.max(0, (item.chapter || '').split('.').length - 1)) }"
            @click="closeDrawers"
          >
            <span v-if="item.chapter" class="doc-nav-number">{{ item.chapter }}</span>
            <span>{{ item.isWikiIndex ? '首頁' : item.title }}</span>
          </NuxtLink>
        </nav>
      </aside>

      <main class="wiki-main">
        <div class="mobile-actions">
          <button v-if="docNavigationItems.length" type="button" aria-label="開啟章節目錄" @click="showDocNav = true">
            <span class="mobile-action-icon" aria-hidden="true">§</span>
            <span>章節</span>
          </button>
          <button
            type="button"
            aria-label="開啟頁內目錄"
            :disabled="!tocLinks.length"
            @click="showToc = true"
          >
            <span class="mobile-action-icon" aria-hidden="true">#</span>
            <span>頁內</span>
          </button>
        </div>

        <nav class="wiki-breadcrumb">
          <NuxtLink :to="wikiHomePath">Wiki</NuxtLink>
          <span>/</span>
          <NuxtLink v-if="docIndex" :to="docIndex.path">{{ docTitle }}</NuxtLink>
          <span v-else>{{ docTitle }}</span>
        </nav>

        <article class="wiki-article">
          <header class="wiki-article-header">
            <div v-if="(page as WikiPage).chapter" class="chapter-kicker">
              第 {{ (page as WikiPage).chapter }} 節
            </div>
            <h1>{{ (page as WikiPage).title }}</h1>
            <div class="wiki-traffic" :class="{ 'is-loading': umamiPending }">
              <span class="traffic-chip">
                <span class="traffic-value">{{ trafficDisplay.pageviews }}</span>
                <span class="traffic-label">瀏覽次數</span>
              </span>
              <span class="traffic-chip">
                <span class="traffic-value">{{ trafficDisplay.visits }}</span>
                <span class="traffic-label">訪問次數</span>
              </span>
              <span class="traffic-chip">
                <span class="traffic-value">{{ trafficDisplay.bounceRate }}</span>
                <span class="traffic-label">跳出率</span>
              </span>
              <span class="traffic-chip">
                <span class="traffic-value">{{ trafficDisplay.avgVisitDuration }}</span>
                <span class="traffic-label">平均停留</span>
              </span>
            </div>
          </header>

          <div class="wiki-content-body">
            <ContentRenderer :value="page" />
          </div>

          <footer v-if="previousPage || nextPage" class="wiki-page-navigation">
            <NuxtLink v-if="previousPage" :to="previousPage.path" class="page-nav-link page-nav-prev">
              <span class="page-nav-label">上一節</span>
              <span class="page-nav-title">
                {{ previousPage.chapter ? `${previousPage.chapter} ` : '' }}{{ previousPage.title }}
              </span>
            </NuxtLink>

            <NuxtLink v-if="nextPage" :to="nextPage.path" class="page-nav-link page-nav-next">
              <span class="page-nav-label">下一節</span>
              <span class="page-nav-title">
                {{ nextPage.chapter ? `${nextPage.chapter} ` : '' }}{{ nextPage.title }}
              </span>
            </NuxtLink>
          </footer>
        </article>
      </main>

      <aside
        v-if="tocLinks.length"
        class="wiki-toc-sidebar"
        :class="{ 'is-open': showToc }"
      >
        <div class="sidebar-header">
          <span class="toc-heading">本頁目錄</span>
          <button class="sidebar-close" type="button" @click="closeDrawers">關閉</button>
        </div>

        <nav class="toc-nav">
          <a
            v-for="link in tocLinks"
            :key="link.id"
            :href="`#${link.id}`"
            class="toc-link"
            :class="{ 'is-active': isTocActive(link.id) }"
            :style="{ '--toc-level': String(link.level) }"
            @click.prevent="scrollToHeading(link.id)"
          >
            <span class="toc-number">{{ link.number }}</span>
            <span>{{ link.text }}</span>
          </a>
        </nav>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.wiki-doc-page {
  --wiki-accent: #00c58e;
  --wiki-accent-strong: #0a8f68;
  --wiki-accent-soft: rgba(0, 197, 142, 0.12);
  min-height: 100vh;
}

.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  height: 3px;
  background: var(--wiki-accent);
  transition: width 0.1s ease;
}

.loading-state {
  display: grid;
  place-items: center;
  min-height: 360px;
  color: var(--text-secondary, #666);
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid var(--nav-border, #e5e7eb);
  border-top-color: var(--wiki-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.wiki-shell {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 860px) minmax(210px, 260px);
  gap: 32px;
  align-items: start;
  width: min(1480px, 100%);
  margin: 0 auto;
  padding: 18px 8px 64px;
}

.wiki-doc-sidebar,
.wiki-toc-sidebar {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding: 14px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.sidebar-back,
.toc-heading {
  color: var(--text-secondary, #666);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
}

.sidebar-close {
  display: none;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #666);
  cursor: pointer;
}

.doc-title-link {
  display: block;
  margin-bottom: 12px;
  color: var(--text-main, #1f1f1f);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.35;
  text-decoration: none;
}

.doc-nav,
.toc-nav {
  display: grid;
  gap: 2px;
}

.doc-nav-link,
.toc-link {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: baseline;
  padding: 7px 8px;
  border-radius: 6px;
  color: var(--text-secondary, #666);
  font-size: 0.92rem;
  line-height: 1.35;
  text-decoration: none;
}

.doc-nav-link {
  margin-left: calc(var(--doc-depth, 0) * 14px);
}

.toc-link {
  margin-left: calc((var(--toc-level, 1) - 1) * 12px);
}

.doc-nav-link:hover,
.toc-link:hover,
.doc-nav-link.is-active,
.toc-link.is-active {
  background: var(--wiki-accent-soft);
  color: var(--wiki-accent-strong);
}

.doc-nav-link.is-active,
.toc-link.is-active {
  font-weight: 800;
}

.doc-nav-number,
.toc-number {
  color: var(--wiki-accent);
  font-size: 0.82rem;
  font-weight: 800;
}

.mobile-actions {
  display: none;
}

.wiki-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 28px;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.wiki-breadcrumb a {
  color: var(--wiki-accent);
  text-decoration: none;
}

.wiki-article-header {
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--nav-border, #e5e7eb);
}

.chapter-kicker {
  margin-bottom: 10px;
  color: var(--wiki-accent);
  font-size: 0.92rem;
  font-weight: 800;
}

.wiki-article-header h1 {
  margin: 0;
  color: var(--text-main, #1f1f1f);
  font-size: clamp(2rem, 4vw, 2.7rem);
  line-height: 1.18;
}

.wiki-traffic {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-top: 16px;
}

.wiki-traffic.is-loading {
  opacity: 0.75;
}

.traffic-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 999px;
  background: var(--bg-secondary, #f7fafc);
}

.traffic-value {
  color: var(--text-main, #1f1f1f);
  font-size: 0.92rem;
  font-weight: 700;
}

.traffic-label {
  color: var(--text-secondary, #666);
  font-size: 0.78rem;
}

.wiki-content-body {
  color: var(--text-main, #1f1f1f);
  font-size: 1.04rem;
  line-height: 1.82;
}

:deep(.wiki-content-body h2),
:deep(.wiki-content-body h3),
:deep(.wiki-content-body h4),
:deep(.wiki-content-body h5),
:deep(.wiki-content-body h6) {
  scroll-margin-top: 88px;
}

:deep(.wiki-content-body .heading-number) {
  color: var(--wiki-accent);
  font-weight: 800;
  margin-right: 0.35em;
}

:deep(.wiki-content-body h2) {
  margin: 3rem 0 1.2rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid var(--nav-border, #e5e7eb);
  color: var(--text-main, #1f1f1f);
  font-size: 1.65rem;
  line-height: 1.32;
}

:deep(.wiki-content-body h3) {
  margin: 2.35rem 0 1rem;
  color: var(--text-main, #1f1f1f);
  font-size: 1.35rem;
  line-height: 1.35;
}

:deep(.wiki-content-body h4) {
  margin: 2rem 0 0.8rem;
  font-size: 1.15rem;
}

:deep(.wiki-content-body p) {
  margin: 1.1rem 0;
}

:deep(.wiki-content-body a) {
  color: var(--wiki-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

:deep(.wiki-content-body a:hover) {
  border-bottom-color: var(--wiki-accent);
}

:deep(.wiki-content-body ul),
:deep(.wiki-content-body ol) {
  padding-left: 1.5rem;
  margin: 1.2rem 0;
}

:deep(.wiki-content-body li) {
  margin: 0.55rem 0;
}

:deep(.wiki-content-body blockquote) {
  margin: 1.5rem 0;
  padding: 0.9rem 1rem;
  border-left: 4px solid var(--wiki-accent);
  background: var(--bg-secondary, #f7f7f8);
  color: var(--text-secondary, #666);
}

:deep(.wiki-content-body img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.5rem auto;
  border-radius: 8px;
}

:deep(.wiki-content-body .table-scroll) {
  overflow-x: auto;
  margin: 1.6rem 0;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  -webkit-overflow-scrolling: touch;
}

:deep(.wiki-content-body .table-scroll table) {
  width: max-content;
  min-width: 100%;
  margin: 0;
  border-collapse: collapse;
  white-space: nowrap;
}

:deep(.wiki-content-body th),
:deep(.wiki-content-body td) {
  padding: 10px 12px;
  border: 1px solid var(--nav-border, #e5e7eb);
  text-align: left;
}

:deep(.wiki-content-body th) {
  background: var(--bg-secondary, #f7f7f8);
}

:deep(.wiki-content-body .table-scroll th:first-child),
:deep(.wiki-content-body .table-scroll td:first-child) {
  border-left: 0;
}

:deep(.wiki-content-body .table-scroll th:last-child),
:deep(.wiki-content-body .table-scroll td:last-child) {
  border-right: 0;
}

:deep(.wiki-content-body .table-scroll tr:first-child th),
:deep(.wiki-content-body .table-scroll tr:first-child td) {
  border-top: 0;
}

:deep(.wiki-content-body .table-scroll tr:last-child th),
:deep(.wiki-content-body .table-scroll tr:last-child td) {
  border-bottom: 0;
}

:deep(.wiki-content-body pre) {
  position: relative;
  overflow-x: auto;
  margin: 1.6rem 0;
  padding: 3rem 1rem 1rem;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
}

:deep(.wiki-content-body code) {
  padding: 0.15em 0.35em;
  border-radius: 4px;
  background: var(--bg-secondary, #f7f7f8);
  font-size: 0.92em;
}

:deep(.wiki-content-body pre code) {
  padding: 0;
  background: transparent;
}

:deep(.code-toolbar) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid var(--nav-border, #e5e7eb);
  background: var(--bg-secondary, #f7f7f8);
}

:deep(.code-language) {
  color: var(--text-secondary, #666);
  font-size: 0.74rem;
  font-weight: 800;
}

:deep(.code-copy-btn) {
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 6px;
  background: var(--bg-color, #fff);
  color: var(--text-main, #1f1f1f);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
}

:deep(.code-copy-btn.copied) {
  border-color: var(--wiki-accent);
  color: var(--wiki-accent);
}

.wiki-page-navigation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--nav-border, #e5e7eb);
}

.page-nav-link {
  display: grid;
  gap: 6px;
  min-height: 78px;
  padding: 14px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  color: var(--text-main, #1f1f1f);
  text-decoration: none;
}

.page-nav-link:hover {
  border-color: var(--wiki-accent);
}

.page-nav-next {
  text-align: right;
}

.page-nav-label {
  color: var(--text-secondary, #666);
  font-size: 0.82rem;
}

.page-nav-title {
  font-weight: 800;
  line-height: 1.35;
}

.wiki-drawer-backdrop {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1180px) {
  .wiki-shell {
    grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
  }

  .wiki-toc-sidebar {
    display: none;
  }
}

@media (max-width: 860px) {
  .wiki-shell {
    display: block;
    padding: 10px 0 52px;
  }

  .mobile-actions {
    position: fixed;
    left: 14px;
    bottom: max(16px, env(safe-area-inset-bottom));
    z-index: 998;
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  }

  .mobile-actions button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-width: 66px;
    height: 34px;
    padding: 0 10px 0 7px;
    border: 1px solid color-mix(in srgb, #14b8a6 34%, var(--nav-border, #e5e7eb));
    border-radius: 999px;
    background:
      linear-gradient(135deg, color-mix(in srgb, #14b8a6 12%, transparent), transparent 58%),
      color-mix(in srgb, var(--bg-color, #ffffff) 88%, transparent);
    color: #0f766e;
    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14), 0 4px 14px rgba(20, 184, 166, 0.12);
    cursor: pointer;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 800;
    line-height: 1;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
  }

  .mobile-actions button:hover,
  .mobile-actions button:active {
    border-color: #14b8a6;
    box-shadow: 0 16px 32px rgba(20, 184, 166, 0.18), 0 8px 20px rgba(15, 23, 42, 0.12);
    transform: translateY(-1px);
  }

  .mobile-actions button:focus-visible {
    outline: 3px solid color-mix(in srgb, #14b8a6 34%, transparent);
    outline-offset: 3px;
  }

  .mobile-actions button:disabled {
    cursor: default;
    opacity: 0.48;
    transform: none;
  }

  .mobile-action-icon {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: linear-gradient(135deg, #14b8a6, #0ea5a4);
    color: #fff;
    font-size: 0.78rem;
    font-weight: 900;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32), 0 5px 12px rgba(20, 184, 166, 0.22);
  }

  .wiki-doc-sidebar,
  .wiki-toc-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 1000;
    display: block;
    width: min(86vw, 340px);
    max-height: none;
    padding: 18px;
    border-radius: 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .wiki-toc-sidebar {
    left: auto;
    right: 0;
    transform: translateX(100%);
  }

  .wiki-doc-sidebar.is-open,
  .wiki-toc-sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: inline-flex;
  }

  .wiki-drawer-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: block;
    border: 0;
    background: rgba(15, 23, 42, 0.45);
  }

  .wiki-page-navigation {
    grid-template-columns: 1fr;
  }

  .page-nav-next {
    text-align: left;
  }
}
</style>
