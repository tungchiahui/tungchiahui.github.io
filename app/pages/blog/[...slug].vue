<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import mediumZoom from 'medium-zoom'
import {
  getContentPathCandidates,
  getCurrentLocaleSlug,
  getLocaleSectionPath
} from '~~/utils/i18n-locales'

// =====================================================
// 文章详情页实现（[...slug].vue）
// 1) 内容加载与 SEO
// 2) 目录（基于正文 DOM 自动生成）
// 3) 锚点平滑滚动与懒加载图片校准
// 4) 正文增强（代码块工具栏、图片放大、标题编号）
// =====================================================

interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

interface TocDisplayLink {
  id: string
  text: string
  depth: number
  level: number
  number: string
}

interface BlogPost {
  _id: string
  _path?: string
  path?: string
  stem?: string
  title: string
  description?: string
  date?: string
  localeSlug?: string
  i18nKey?: string
  sourcePath?: string
  legacyPath?: string
  body?: {
    toc?: {
      links?: TocLink[]
    }
  }
  [key: string]: any
}

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const blogHomePath = computed(() => getLocaleSectionPath(currentLocaleSlug.value, 'blog'))

function normalizePath(path: string) {
  return path.replace(/\/$/, '') || '/'
}

function collectTrafficPaths(entry: { path?: string; sourcePath?: string; legacyPath?: string } | null | undefined, fallbackPath?: string) {
  return Array.from(
    new Set([
      entry?.path,
      entry?.sourcePath,
      entry?.legacyPath,
      fallbackPath
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

// ==================== 配置实现 ====================
// 可配置的目录深度（1-6，对应 h1-h6）
const MAX_TOC_DEPTH = ref(6) // 修改这个数字来控制目录显示的层级深度（显示到 h6）

// ==================== 数据加载实现 ====================
const { data: page, pending } = await useAsyncData(
  `page-${route.path}`,
  async () => {
    for (const path of getContentPathCandidates(route.path, 'blog')) {
      const normalizedPath = normalizePath(path)
      const result = await queryCollection('content')
        .where('path', '=', normalizedPath)
        .first()

      if (result) {
        return result as BlogPost
      }
    }

    return null
  }
)

const { data: surroundingPosts } = await useAsyncData(
  `surrounding-${route.path}`,
  async () => {
    if (!page.value) return [null, null] as [BlogPost | null, BlogPost | null]
    
    try {
      const allPosts = await queryCollection('content')
        .where('sourceStem', 'LIKE', 'posts/%')
        .where('localeSlug', '=', page.value.localeSlug || currentLocaleSlug.value)
        .select('path', 'title', 'date', 'localeSlug', 'i18nKey')
        .all()
      
      const markdownPosts = allPosts.filter((p: any) => 
        p.path && p.path.includes('/')
      ) as unknown as BlogPost[]
      
      if (!markdownPosts || markdownPosts.length === 0) {
        return [null, null] as [BlogPost | null, BlogPost | null]
      }
      
      const sortedPosts = markdownPosts.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime()
        const dateB = new Date(b.date || 0).getTime()
        return dateB - dateA // 按日期降序排序
      })
      
      const currentIndex = sortedPosts.findIndex(p => 
        normalizePath(p.path || p._path || '') === normalizePath(page.value?.path || route.path)
      )
      
      if (currentIndex === -1) {
        return [null, null] as [BlogPost | null, BlogPost | null]
      }
      
      return [
        currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
        currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null
      ] as [BlogPost | null, BlogPost | null]
    } catch (error) {
      console.error('获取相邻文章失败:', error)
      return [null, null] as [BlogPost | null, BlogPost | null]
    }
  }
)

if (!pending.value && !page.value) {
  throw createError({ 
    statusCode: 404, 
    statusMessage: '頁面不存在',
    fatal: true 
  })
}

// ==================== SEO 元信息实现 ====================
const title = computed(() => (page.value as BlogPost)?.title || '載入中...')
const description = computed(() => 
  (page.value as BlogPost)?.description || (page.value as BlogPost)?.title || ''
)

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
  ]
})

// ==================== 阅读信息实现 ====================
const readingTime = computed(() => {
  const pageData = page.value as BlogPost
  if (!pageData?.body) return 0
  const text = JSON.stringify(pageData.body)
  const wordsPerMinute = 200
  const wordCount = text.length / 5
  return Math.ceil(wordCount / wordsPerMinute)
})

const formattedDate = computed(() => {
  const pageData = page.value as BlogPost
  if (!pageData?.date) return ''
  const date = new Date(pageData.date)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const pagePath = computed(() => normalizePath((page.value as BlogPost)?.path || route.path))

const { data: i18nVariantPaths } = await useAsyncData(
  `blog-i18n-paths-${route.path}`,
  async () => {
    const i18nKey = (page.value as BlogPost | null)?.i18nKey

    if (!i18nKey) {
      return collectTrafficPaths(page.value, pagePath.value)
    }

    const variants = await queryCollection('content')
      .where('i18nKey', '=', i18nKey)
      .select('path', 'sourcePath', 'legacyPath')
      .all() as Array<{ path?: string; sourcePath?: string; legacyPath?: string }>

    return variants.flatMap(variant => collectTrafficPaths(variant))
  }
)

const trafficPaths = computed(() =>
  (i18nVariantPaths.value?.length ? i18nVariantPaths.value : collectTrafficPaths(page.value, pagePath.value))
)

const { data: umamiPathData, pending: umamiPending, refresh: refreshUmamiPathData } = useAsyncData(
  `blog-umami-${route.path}`,
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

// ==================== 目录与锚点实现 ====================
const showToc = ref(false)
const activeHeadingId = ref<string>('')
const headingScrollOffset = 88
const pendingAnchorId = ref<string>('')
const scrollRetryTimers: ReturnType<typeof setTimeout>[] = []
const imageLoadCleanupFns: Array<() => void> = []
const tocLinks = ref<TocDisplayLink[]>([])
const anchorSettleDelays = [820, 1300, 2100]
let contentResizeObserver: ResizeObserver | null = null

const filteredTocLinks = computed(() =>
  tocLinks.value.filter(link => link.depth <= MAX_TOC_DEPTH.value)
)

const readingProgress = ref(0)

const updateReadingProgress = () => {
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY
  const trackLength = documentHeight - windowHeight
  const progress = (scrollTop / trackLength) * 100
  readingProgress.value = Math.min(100, Math.max(0, progress))
}

const updateActiveHeading = () => {
  if (!tocLinks.value.length) return

  const headings = document.querySelectorAll('.content-body h2, .content-body h3, .content-body h4, .content-body h5, .content-body h6')
  const scrollPosition = window.scrollY + getHeadingScrollOffset() + 12

  let active = ''
  headings.forEach((heading) => {
    const element = heading as HTMLElement
    if (element.offsetTop <= scrollPosition) {
      active = element.id
    }
  })

  activeHeadingId.value = active
}

let zoomInstance: ReturnType<typeof mediumZoom> | null = null
let anchorAnimationFrame: number | null = null

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3)

const cancelAnchorAnimation = () => {
  if (anchorAnimationFrame === null) return

  window.cancelAnimationFrame(anchorAnimationFrame)
  anchorAnimationFrame = null
}

const getHeadingTargetTop = (id: string) => {
  const element = document.getElementById(id)
  if (!element) return null

  return Math.max(0, element.getBoundingClientRect().top + window.scrollY - getHeadingScrollOffset())
}

const getHeadingScrollOffset = () => {
  if (!import.meta.client) return headingScrollOffset

  const header = document.querySelector('.main-header') as HTMLElement | null
  const headerHeight = header?.getBoundingClientRect().height || 0
  return Math.max(headingScrollOffset, Math.ceil(headerHeight + 18))
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

// 清理：锚点重试计时器
const clearScrollRetryTimers = () => {
  scrollRetryTimers.forEach(timer => clearTimeout(timer))
  scrollRetryTimers.length = 0
  cancelAnchorAnimation()
}

// 清理：图片加载监听器
const clearImageLoadListeners = () => {
  imageLoadCleanupFns.forEach(fn => fn())
  imageLoadCleanupFns.length = 0
}

// 锚点滚动：统一顶部偏移
const scrollHeadingToOffset = (id: string, behavior: ScrollBehavior = 'smooth') => {
  const top = getHeadingTargetTop(id)
  if (top === null) return false

  animateWindowScrollTo(top, behavior)
  return true
}

const warmImagesBeforeHeading = async (id: string) => {
  const headingTop = getHeadingTargetTop(id)
  if (headingTop === null) return

  const images = Array.from(document.querySelectorAll('.content-body img')) as HTMLImageElement[]
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

// 目录生成：从正文实际渲染后的 h2~h6 构建
const buildTocFromDom = () => {
  const headings = Array.from(
    document.querySelectorAll('.content-body h2, .content-body h3, .content-body h4, .content-body h5, .content-body h6')
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
    const text = (cloned.textContent || '').trim()

    result.push({
      id: heading.id,
      text,
      depth: tagLevel,
      level: logicalLevel,
      number: counters.join('.')
    })

    previousTagLevel = tagLevel
    previousLogicalLevel = logicalLevel
  })

  tocLinks.value = result
}

// ==================== 正文增强实现 ====================
const initImageZoom = () => {
  if (zoomInstance) {
    zoomInstance.detach()
  }
  zoomInstance = mediumZoom('.content-body img', {
    margin: 24,
    background: 'rgba(0, 0, 0, 0.8)',
    scrollOffset: 0,
  })
}

// 代码块增强：语言标签 + 复制按钮
const enhanceCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.content-body pre') as NodeListOf<HTMLElement>
  
  codeBlocks.forEach((block) => {
    if (block.querySelector('.code-toolbar')) return

    const toolbar = document.createElement('div')
    toolbar.className = 'code-toolbar'

    const langClass = Array.from(block.classList).find(c => c.startsWith('language-'))
    const language = langClass ? langClass.replace('language-', '').toUpperCase() : 'CODE'

    if (language) {
      const langLabel = document.createElement('span')
      langLabel.className = 'code-language'
      langLabel.textContent = language
      toolbar.appendChild(langLabel)
    }

    const copyButton = document.createElement('button')
    copyButton.className = 'code-copy-btn'
    copyButton.type = 'button'
    copyButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>复制</span>
    `

    copyButton.addEventListener('click', async () => {
      const code = block.querySelector('code')
      const text = code?.textContent || block.textContent || ''

      try {
        await navigator.clipboard.writeText(text)
        copyButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>已复制</span>
        `
        copyButton.classList.add('copied')
        
        setTimeout(() => {
          copyButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>复制</span>
          `
          copyButton.classList.remove('copied')
        }, 2000)
      } catch (error) {
        console.error('复制失败:', error)
      }
    })

    toolbar.appendChild(copyButton)
    block.insertBefore(toolbar, block.firstChild)
  })
}

const enhanceTables = () => {
  const tables = document.querySelectorAll('.content-body table') as NodeListOf<HTMLTableElement>

  tables.forEach((table) => {
    if (table.parentElement?.classList.contains('table-scroll')) return

    const wrapper = document.createElement('div')
    wrapper.className = 'table-scroll'
    table.parentNode?.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })
}

// 标题增强：正文标题前添加层级编号
const applyHeadingDecorations = () => {
  const headingMap = new Map(tocLinks.value.map(item => [item.id, item.number]))
  const headings = document.querySelectorAll('.content-body h2, .content-body h3, .content-body h4, .content-body h5, .content-body h6')

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

// 懒加载图片校准：图片加载完成后修正锚点
const setupImageLoadReflowSync = () => {
  clearImageLoadListeners()

  const images = document.querySelectorAll('.content-body img') as NodeListOf<HTMLImageElement>
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

  const content = document.querySelector('.content-body')
  if (!content) return

  contentResizeObserver = new ResizeObserver(() => {
    updateActiveHeading()
    if (pendingAnchorId.value) {
      correctHeadingPosition(pendingAnchorId.value, 'smooth')
    }
  })
  contentResizeObserver.observe(content)
}

// 正文增强总入口
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

// ==================== 生命周期与联动实现 ====================
onMounted(async () => {
  await enhanceContent()
  window.addEventListener('scroll', updateReadingProgress)
  window.addEventListener('scroll', updateActiveHeading)
  window.addEventListener('hashchange', handleHashChange)
  window.addEventListener('wheel', cancelPendingAnchorScroll, { passive: true })
  window.addEventListener('touchstart', cancelPendingAnchorScroll, { passive: true })
  window.addEventListener('keydown', cancelPendingAnchorScroll)
  updateReadingProgress()
  updateActiveHeading()
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
  document.body.classList.remove('blog-toc-open')
  if (zoomInstance) {
    zoomInstance.detach()
  }
})

// 页面内容变化时，重新增强正文和目录
watch(() => page.value, () => {
  enhanceContent()
  updateActiveHeading()
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

// 移动端目录弹窗控制
const closeToc = () => {
  showToc.value = false
}

watch(showToc, (newVal) => {
  if (import.meta.client) {
    document.body.style.overflow = newVal ? 'hidden' : ''
    document.body.classList.toggle('blog-toc-open', newVal)
  }
})

const isLinkActive = (linkId: string): boolean => {
  return activeHeadingId.value === linkId
}

// 目录点击跳转：平滑滚动 + 多次布局校准
const scrollToHeading = (id: string) => {
  const hasScrolled = settleScrollToHeading(id, 'smooth', true)
  if (!hasScrolled) {
    closeToc()
    return
  }

  closeToc()
}
</script>

<template>
  <!-- ==================== 文章页结构实现 ====================
       - 阅读进度条
       - 返回导航
       - 正文内容 + 上下篇
       - 目录（桌面侧栏 / 移动端弹窗）
       ====================================================== -->
  <div class="blog-page">
    <div class="reading-progress-bar" :style="{ width: `${readingProgress}%` }" />

    <nav class="top-navigation">
      <NuxtLink :to="blogHomePath" class="nav-back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>返回博客</span>
      </NuxtLink>
    </nav>

    <!-- 手机端目录按钮实现 -->
    <button 
      v-if="filteredTocLinks.length" 
      class="mobile-toc-button" 
      @click="showToc = true"
      aria-label="開啟目錄"
    >
      <span class="mobile-toc-icon" aria-hidden="true">#</span>
      <span>目錄</span>
    </button>

    <div v-if="pending" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <div v-else-if="page" class="content-container">
      <Transition name="fade">
        <div 
          v-if="showToc" 
          class="toc-backdrop" 
          @click="closeToc"
        />
      </Transition>

      <div class="content-wrapper">
        <div class="blog-layout-spacer" aria-hidden="true" />

        <article class="article-main">
          <header class="article-header">
            <h1 class="article-title">{{ (page as BlogPost).title }}</h1>
            
            <div class="article-meta">
              <time v-if="formattedDate" :datetime="(page as BlogPost).date" class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {{ formattedDate }}
              </time>
              
              <span v-if="readingTime" class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {{ readingTime }} 分鐘閱讀
              </span>
            </div>

            <div class="article-traffic" :class="{ 'is-loading': umamiPending }">
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

          <div class="article-content content-body">
            <ContentRenderer :value="page" />
          </div>

          <footer v-if="surroundingPosts && (surroundingPosts[0] || surroundingPosts[1])" class="article-footer">
            <div class="footer-divider">
              <span>
                <i class="fas fa-book-open" aria-hidden="true"></i>
                <span>繼續閱讀</span>
              </span>
            </div>
            
            <nav class="article-navigation">
              <NuxtLink 
                v-if="surroundingPosts[0]" 
                :to="surroundingPosts[0].path || surroundingPosts[0]._path" 
                class="nav-item nav-prev"
              >
                <div class="nav-icon">←</div>
                <div class="nav-content">
                  <div class="nav-label">上一篇</div>
                  <div class="nav-title">{{ surroundingPosts[0].title }}</div>
                </div>
              </NuxtLink>

              <NuxtLink 
                v-if="surroundingPosts[1]" 
                :to="surroundingPosts[1].path || surroundingPosts[1]._path" 
                class="nav-item nav-next"
              >
                <div class="nav-content">
                  <div class="nav-label">下一篇</div>
                  <div class="nav-title">{{ surroundingPosts[1].title }}</div>
                </div>
                <div class="nav-icon">→</div>
              </NuxtLink>
            </nav>
          </footer>
        </article>

        <!-- 目录侧栏实现（桌面）/ 目录弹窗实现（移动端） -->
        <aside 
          v-if="filteredTocLinks.length" 
          class="toc-sidebar"
          :class="{ 'is-open': showToc }"
        >
          <div class="toc-header">
            <h2 class="toc-title">
              <i class="fas fa-list-ul" aria-hidden="true"></i>
              <span>目錄</span>
            </h2>
            <button class="toc-close-btn" @click="closeToc">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <nav class="toc-nav">
            <ul class="toc-list">
              <li
                v-for="link in filteredTocLinks"
                :key="link.id"
                class="toc-item"
                :style="{ '--toc-level': String(link.level) }"
              >
                <a 
                  :href="`#${link.id}`"
                  class="toc-link"
                  :class="{ 'is-active': isLinkActive(link.id) }"
                  @click.prevent="scrollToHeading(link.id)"
                >
                  <span class="toc-number">{{ link.number }}</span>
                  <span class="toc-text">{{ link.text }}</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* =====================================================
  文章页样式实现（按功能分组）
  A. 页面骨架与导航
  B. 正文排版与标题编号
  C. 表格/代码块增强
  D. 目录侧栏与目录按钮
  E. 移动端适配
  ===================================================== */

/* A. 页面基础变量实现 */
:root {
  --color-primary: #00c58e;
  --color-bg: var(--bg-color);
  --color-bg-secondary: var(--bg-secondary);
  --color-text: var(--text-main);
  --color-text-light: var(--text-secondary);
  --color-text-lighter: #999999;
  --color-border: var(--nav-border);
  --color-code-bg: #f6f8fa;
  --color-frame-border: #627286;
}

html.dark {
  --color-code-bg: #1a1f2e;
  --color-text-lighter: #a0aec0;
  --color-frame-border: #93a4bf;
}

/* A. 页面骨架与导航实现 */
.blog-page {
  min-height: 100vh;
  padding: 0 20px 60px;
  overflow-x: clip;
}

.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), #10b981);
  z-index: 1001;
  transition: width 0.1s ease;
}

.top-navigation {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 0;
  margin-bottom: 20px;
}

.nav-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-back-link:hover {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  transform: translateX(-4px);
}

.nav-back-link:hover span,
.nav-back-link:hover svg {
  color: #ffffff;
  stroke: #ffffff;
}

/* D. 手机端目录按钮实现 */
.mobile-toc-button {
  display: none;
  position: fixed;
  left: 14px;
  bottom: max(16px, env(safe-area-inset-bottom));
  z-index: 998;
  align-items: center;
  gap: 5px;
  min-width: 66px;
  height: 34px;
  padding: 0 10px 0 7px;
  border: 1px solid color-mix(in srgb, #14b8a6 34%, var(--color-border));
  border-radius: 999px;
  background:
    linear-gradient(135deg, color-mix(in srgb, #14b8a6 12%, transparent), transparent 58%),
    color-mix(in srgb, var(--color-bg) 88%, transparent);
  color: #0f766e;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14), 0 4px 14px rgba(20, 184, 166, 0.12);
  font-size: 0.85rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.mobile-toc-button:hover,
.mobile-toc-button:active {
  border-color: #14b8a6;
  box-shadow: 0 16px 32px rgba(20, 184, 166, 0.18), 0 8px 20px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.mobile-toc-button:focus-visible {
  outline: 3px solid color-mix(in srgb, #14b8a6 34%, transparent);
  outline-offset: 3px;
}

.mobile-toc-icon {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 居中容器 */
.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 860px) minmax(210px, 260px);
  gap: 32px;
  align-items: flex-start;
  justify-content: center;
}

.article-main {
  min-width: 0;
  width: 100%;
}

.article-header {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--color-border);
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: var(--color-text);
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--color-text-light);
  font-size: 0.95rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-traffic {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-top: 18px;
}

.article-traffic.is-loading {
  opacity: 0.75;
}

.traffic-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg-secondary);
}

.traffic-value {
  color: var(--color-text);
  font-size: 0.92rem;
  font-weight: 700;
}

.traffic-label {
  color: var(--color-text-light);
  font-size: 0.78rem;
}

/* B. 正文排版与标题编号实现 */
.article-content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-text);
}

/* 标题绿色 + scroll-margin 锚点精准定位 */
:deep(.article-content h2),
:deep(.article-content h3),
:deep(.article-content h4),
:deep(.article-content h5),
:deep(.article-content h6) {
  scroll-margin-top: 80px;
}

:deep(.article-content .heading-number) {
  color: var(--color-primary);
  font-weight: 800;
  margin-right: 0.35em;
}

:deep(.article-content h2) {
  color: #14b8a6;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 3rem 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}

:deep(.article-content h3) {
  color: #22c55e;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2.5rem 0 1.2rem 0;
}

:deep(.article-content h4) {
  color: #84cc16;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
}

:deep(.article-content h5) {
  color: #eab308;
  font-size: 1.15rem;
  font-weight: 600;
  margin: 1.8rem 0 0.9rem 0;
}

:deep(.article-content h6) {
  color: #f97316;
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.5rem 0 0.8rem 0;
}

:deep(.article-content p) {
  margin: 1.2rem 0;
  color: var(--color-text);
}

:deep(.article-content a) {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

:deep(.article-content a:hover) {
  border-bottom-color: var(--color-primary);
}

:deep(.article-content ul),
:deep(.article-content ol) {
  padding-left: 2rem;
  margin: 1.5rem 0;
}

:deep(.article-content li) {
  margin: 0.8rem 0;
  color: var(--color-text);
}

:deep(.article-content blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--color-primary);
  background: var(--color-bg-secondary);
  border-radius: 0 8px 8px 0;
  color: var(--color-text-light);
  font-style: italic;
}

:deep(.article-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 2rem auto;
  display: block;
  cursor: zoom-in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.article-content code) {
  background: var(--color-code-bg);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

:deep(.article-content pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

/* C. 表格增强实现（含手机横向滚动） */
:deep(.article-content .table-wrapper),
:deep(.article-content table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.article-content table) {
  display: table;
  min-width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  background: var(--color-bg);
  border: 3px solid var(--color-frame-border);
  margin: 2rem 0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 197, 142, 0.18), 0 2px 8px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

:deep(.article-content th) {
  background: linear-gradient(135deg, rgba(0, 197, 142, 0.08) 0%, var(--color-bg-secondary) 100%);
  color: var(--color-primary);
  padding: 14px 18px;
  border: 2px solid var(--color-frame-border);
  white-space: nowrap;
  font-weight: 700;
  text-align: left;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

:deep(.article-content td) {
  padding: 12px 18px;
  border: 2px solid var(--color-frame-border);
  color: var(--color-text);
}

:deep(.article-content tr:nth-child(even)) {
  background: rgba(0, 197, 142, 0.03);
}

:deep(.article-content tr:hover) {
  background: rgba(0, 197, 142, 0.08);
}

/* C. 代码块增强样式实现 */
:deep(.article-content pre) {
  background: var(--color-code-bg) !important;
  border: 3px solid var(--color-frame-border);
  padding: 16px;
  padding-top: 0;
  border-radius: 12px;
  position: relative;
  overflow-x: auto;
  max-width: 100%;
  margin: 1.5rem 0;
  box-shadow: 0 4px 18px rgba(0, 197, 142, 0.2), 0 2px 8px rgba(0, 0, 0, 0.14);
}

:deep(.code-toolbar) {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: var(--color-bg-secondary);
  border-bottom: 3px solid var(--color-frame-border);
  border-radius: 10px 10px 0 0;
  z-index: 10;
  margin: 0 -16px 14px -16px;
}

:deep(.code-language) {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

:deep(.code-copy-btn) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  background: var(--color-bg);
  border: 1.5px solid var(--color-primary);
  border-radius: 6px;
  font-size: 0.7rem;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

:deep(.code-copy-btn:hover) {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
}

:deep(.code-copy-btn.copied) {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.article-footer {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 2px solid var(--color-border);
}

.footer-divider {
  text-align: center;
  margin-bottom: 40px;
}

.footer-divider span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 8px 24px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
}

.footer-divider i {
  color: var(--color-primary);
}

.article-navigation {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  min-height: 110px;
}

.nav-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 197, 142, 0.2);
}

.nav-icon {
  font-size: 2rem;
  color: var(--color-primary);
  flex-shrink: 0;
  font-weight: bold;
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.nav-label {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.nav-title {
  color: var(--color-text);
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* D. 目录侧栏实现（桌面） */
.toc-sidebar {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.toc-sidebar::-webkit-scrollbar {
  width: 6px;
}

.toc-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.toc-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

.toc-sidebar::-webkit-scrollbar-thumb:hover {
  background: #00a577;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.toc-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.toc-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.toc-close-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.toc-nav {
  overflow-y: auto;
  overflow-x: hidden;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 4px;
  padding: 2px;
  border-radius: 8px;
  --toc-level: 1;
}

.toc-link {
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  padding-left: calc(8px + (var(--toc-level) - 1) * 14px);
  color: var(--color-text-light);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 2px;
}

.toc-link:hover {
  background: rgba(0, 197, 142, 0.12);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.toc-link.is-active {
  background: rgba(0, 197, 142, 0.18);
  color: var(--color-primary);
  font-weight: 600;
  border-color: var(--color-primary);
  box-shadow: 0 0 6px rgba(0, 197, 142, 0.3);
}

.toc-number {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  min-width: fit-content;
}

.toc-text {
  flex: 1;
  word-break: break-word;
}

/* D. 移动端目录遮罩与过渡实现 */
.toc-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* E. 手机端适配实现 */
@media (max-width: 1180px) {
.blog-page {
  min-height: 100vh;
  padding: 0 20px 60px;
  /* overflow-x: hidden; 删除这行是因为父级 hidden 会导致子元素 sticky 失效 */
  overflow-x: clip; /* 改用 clip，既能防止横向溢出，又不会破坏粘性定位（如果浏览器支持） */
}

  .content-container {
    max-width: 100%;
    overflow-x: hidden;
  }

  .content-wrapper {
    display: block;
    max-width: 100%;
    overflow-x: hidden;
  }

  .article-main {
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
  }

  .toc-sidebar {
    display: none;
  }

  .mobile-toc-button {
    display: flex !important;
  }

  /* 手机端目录弹窗 - 纯色背景 + 绿色边框 */
  .toc-sidebar.is-open {
    display: block;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 420px;
    max-height: 75vh;
    z-index: 1000;
    background: #ffffff;
    border: 3px solid var(--color-primary);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 197, 142, 0.2);
    opacity: 1;
    overflow-y: auto;
  }

  html.dark .toc-sidebar.is-open {
    background: #0f172a;
    border-color: var(--color-primary);
  }

  .toc-close-btn {
    display: block;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .article-navigation {
    grid-template-columns: 1fr;
  }

  /* 代码块手机端适配 */
  :deep(.article-content pre) {
    margin-left: -12px;
    margin-right: -12px;
    border-radius: 0;
    border-left: none;
    border-right: none;
    max-width: calc(100% + 24px);
  }

  :deep(.code-toolbar) {
    border-radius: 0;
  }

  /* 表格手机端横向滚动 */
  :deep(.article-content table) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
  }

  :deep(.article-content thead),
  :deep(.article-content tbody),
  :deep(.article-content tr) {
    display: table;
    width: 100%;
    table-layout: auto;
  }

  :deep(.article-content table) {
    display: block;
  }

  :deep(.article-content thead) {
    display: table-header-group;
  }

  :deep(.article-content tbody) {
    display: table-row-group;
  }

  :deep(.article-content tr) {
    display: table-row;
  }

  :deep(.article-content th),
  :deep(.article-content td) {
    display: table-cell;
  }

  /* 图片手机端适配 */
  :deep(.article-content img) {
    max-width: 100%;
    height: auto;
  }

  .top-navigation {
    padding: 12px 0;
    margin-bottom: 12px;
  }

  .nav-back-link {
    padding: 8px 14px;
    font-size: 0.9rem;
  }
}

@media (max-width: 640px) {
  .blog-page {
    padding: 12px 10px 50px;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-header {
    margin-bottom: 32px;
    padding-bottom: 20px;
  }

  :deep(.article-content h2) {
    font-size: 1.4rem;
  }

  :deep(.article-content h3) {
    font-size: 1.2rem;
  }

  :deep(.article-content h4) {
    font-size: 1.1rem;
  }

  .article-meta {
    gap: 12px;
    font-size: 0.85rem;
  }

  :deep(.article-content) {
    font-size: 1rem;
  }

  :deep(.article-content pre) {
    font-size: 0.85rem;
  }

  .mobile-toc-button {
    font-size: 0.8rem;
  }
}

/* Wiki reader style parity overrides */
.blog-page {
  --blog-accent: #00c58e;
  --blog-accent-strong: #0a8f68;
  --blog-accent-soft: rgba(0, 197, 142, 0.12);
  padding: 0 8px 60px;
}

.reading-progress-bar {
  z-index: 1001;
  background: var(--blog-accent);
}

.top-navigation,
.content-container {
  width: min(1152px, 100%);
  max-width: none;
  margin: 0 auto;
}

.top-navigation {
  padding: 18px 0 8px;
  margin-bottom: 0;
}

.nav-back-link {
  padding: 7px 8px;
  border: 0;
  background: transparent;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  font-weight: 700;
}

.nav-back-link:hover {
  background: var(--blog-accent-soft);
  color: var(--blog-accent-strong);
  border-color: transparent;
  transform: none;
}

.nav-back-link:hover span,
.nav-back-link:hover svg {
  color: var(--blog-accent-strong);
  stroke: var(--blog-accent-strong);
}

.content-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 860px) minmax(210px, 260px);
  gap: 32px;
  align-items: start;
  justify-content: center;
}

.article-main {
  width: 100%;
  min-width: 0;
  max-width: none;
}

.article-header {
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--nav-border, #e5e7eb);
}

.article-title {
  margin: 0 0 18px;
  color: var(--text-main, #1f1f1f);
  font-size: clamp(2rem, 4vw, 2.7rem);
  line-height: 1.18;
}

.article-meta {
  gap: 14px;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
}

.article-traffic {
  gap: 8px 10px;
  margin-top: 16px;
}

.traffic-chip {
  padding: 6px 10px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 999px;
  background: var(--bg-secondary, #f7fafc);
}

.traffic-value {
  color: var(--text-main, #1f1f1f);
}

.traffic-label {
  color: var(--text-secondary, #666);
}

.article-content {
  color: var(--text-main, #1f1f1f);
  font-size: 1.04rem;
  line-height: 1.82;
}

:deep(.article-content h2),
:deep(.article-content h3),
:deep(.article-content h4),
:deep(.article-content h5),
:deep(.article-content h6) {
  scroll-margin-top: 88px;
  color: var(--text-main, #1f1f1f);
}

:deep(.article-content .heading-number) {
  color: var(--blog-accent);
  font-weight: 800;
  margin-right: 0.35em;
}

:deep(.article-content h2) {
  margin: 3rem 0 1.2rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid var(--nav-border, #e5e7eb);
  font-size: 1.65rem;
  line-height: 1.32;
}

:deep(.article-content h3) {
  margin: 2.35rem 0 1rem;
  font-size: 1.35rem;
  line-height: 1.35;
}

:deep(.article-content h4) {
  margin: 2rem 0 0.8rem;
  font-size: 1.15rem;
}

:deep(.article-content h5) {
  margin: 1.8rem 0 0.9rem;
  font-size: 1.1rem;
}

:deep(.article-content h6) {
  margin: 1.5rem 0 0.8rem;
  font-size: 1.05rem;
}

:deep(.article-content p) {
  margin: 1.1rem 0;
}

:deep(.article-content ul),
:deep(.article-content ol) {
  padding-left: 1.5rem;
  margin: 1.2rem 0;
}

:deep(.article-content li) {
  margin: 0.55rem 0;
}

:deep(.article-content a) {
  color: var(--blog-accent);
  text-decoration: none;
  border-bottom: 1px solid transparent;
}

:deep(.article-content a:hover) {
  border-bottom-color: var(--blog-accent);
}

:deep(.article-content blockquote) {
  margin: 1.5rem 0;
  padding: 0.9rem 1rem;
  border-left: 4px solid var(--blog-accent);
  border-radius: 0;
  background: var(--bg-secondary, #f7f7f8);
  color: var(--text-secondary, #666);
  font-style: normal;
}

:deep(.article-content img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.5rem auto;
  border-radius: 8px;
  box-shadow: none;
}

:deep(.article-content code) {
  padding: 0.15em 0.35em;
  border-radius: 4px;
  background: var(--bg-secondary, #f7f7f8);
  color: var(--text-main, #1f1f1f);
  font-size: 0.92em;
}

:deep(.article-content pre) {
  position: relative;
  overflow-x: auto;
  max-width: 100%;
  margin: 1.6rem 0;
  padding: 0;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--color-code-bg) !important;
  box-shadow: none;
}

:deep(.article-content pre code) {
  display: block;
  min-width: max-content;
  padding: 1rem;
  background: transparent;
  color: inherit;
}

:deep(.code-toolbar) {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  height: auto;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 8px 10px;
  border-bottom: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 0;
  background: var(--bg-secondary, #f7f7f8);
}

:deep(.code-language) {
  color: var(--text-secondary, #666);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0;
}

:deep(.code-copy-btn) {
  padding: 4px 9px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 6px;
  background: var(--bg-color, #fff);
  color: var(--text-main, #1f1f1f);
  font-size: 0.78rem;
  font-weight: 700;
}

:deep(.code-copy-btn:hover),
:deep(.code-copy-btn.copied) {
  border-color: var(--blog-accent);
  background: var(--bg-color, #fff);
  color: var(--blog-accent);
  transform: none;
}

:deep(.article-content table) {
  width: max-content;
  min-width: 100%;
  margin: 1.6rem 0;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-collapse: collapse;
  border-radius: 8px;
  background: var(--bg-color, #fff);
  box-shadow: none;
  white-space: nowrap;
}

:deep(.article-content th),
:deep(.article-content td) {
  padding: 10px 12px;
  border: 1px solid var(--nav-border, #e5e7eb);
  color: var(--text-main, #1f1f1f);
  text-align: left;
}

:deep(.article-content th) {
  background: var(--bg-secondary, #f7f7f8);
  color: var(--text-main, #1f1f1f);
}

.toc-sidebar {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding: 14px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  box-shadow: none;
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 0;
  border-bottom: 0;
}

.toc-title {
  color: var(--text-secondary, #666);
  font-size: 0.86rem;
  font-weight: 700;
}

.toc-title i {
  color: var(--blog-accent);
}

.toc-nav {
  display: grid;
  gap: 2px;
}

.toc-list {
  display: grid;
  gap: 2px;
}

.toc-item {
  margin: 0;
  padding: 0;
}

.toc-link {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: baseline;
  margin: 0;
  margin-left: calc((var(--toc-level, 1) - 1) * 12px);
  padding: 7px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #666);
  font-size: 0.92rem;
  line-height: 1.35;
}

.toc-link:hover,
.toc-link.is-active {
  background: var(--blog-accent-soft);
  color: var(--blog-accent-strong);
  box-shadow: none;
}

.toc-link.is-active {
  font-weight: 800;
}

.toc-number {
  color: var(--blog-accent);
  font-size: 0.82rem;
  font-weight: 800;
}

.article-footer {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--nav-border, #e5e7eb);
}

.footer-divider {
  display: none;
}

.article-navigation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.nav-item {
  min-height: 78px;
  padding: 14px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  color: var(--text-main, #1f1f1f);
}

.nav-item:hover {
  border-color: var(--blog-accent);
  box-shadow: none;
  transform: none;
}

.nav-icon {
  color: var(--blog-accent);
  font-size: 1.35rem;
}

.nav-label {
  color: var(--text-secondary, #666);
  font-size: 0.82rem;
  letter-spacing: 0;
  text-transform: none;
}

.nav-title {
  color: var(--text-main, #1f1f1f);
  font-weight: 800;
}

.toc-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  width: auto;
  height: auto;
  border: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: none;
}

@media (max-width: 1180px) {
  .content-wrapper {
    display: block;
  }

  .toc-sidebar {
    position: fixed;
    inset: 0 0 0 auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    z-index: 1000;
    display: block;
    width: min(86vw, 340px);
    max-width: none;
    max-height: none;
    padding: 18px;
    border: 1px solid var(--nav-border, #e5e7eb);
    border-radius: 0;
    box-shadow: none;
    opacity: 1;
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform 0.2s ease;
  }

  .toc-sidebar.is-open {
    position: fixed;
    inset: 0 0 0 auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: auto;
    width: min(86vw, 340px);
    max-width: none;
    max-height: none;
    border: 1px solid var(--nav-border, #e5e7eb);
    border-radius: 0;
    box-shadow: none;
    overflow-y: auto;
    transform: translateX(0);
  }

  html.dark .toc-sidebar.is-open {
    border-color: var(--nav-border, #334155);
    background: var(--bg-color, #0f172a);
  }

  .toc-close-btn {
    display: inline-flex;
  }

  .article-navigation {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .blog-page {
    padding: 12px 10px 50px;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-header {
    margin-bottom: 32px;
    padding-bottom: 20px;
  }
}

/* Blog article Wiki parity final pass */
.blog-page {
  --blog-accent: #00c58e;
  --blog-accent-strong: #0a8f68;
  --blog-accent-soft: rgba(0, 197, 142, 0.12);
  max-width: none;
  margin: 0;
  padding: 0;
  overflow-x: clip;
}

.content-container {
  width: min(1480px, 100%);
  max-width: none;
  margin: 0 auto;
}

.top-navigation {
  width: min(1480px, 100%);
  max-width: none;
  margin: 0 auto;
  padding: 18px 8px 8px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 860px) minmax(210px, 260px);
  gap: 32px;
  align-items: start;
  justify-content: stretch;
  padding: 0 8px 64px;
}

.blog-layout-spacer {
  min-width: 0;
}

.article-main {
  min-width: 0;
  width: 100%;
}

.article-title {
  display: block;
}

.toc-sidebar {
  width: auto;
}

:deep(.article-content h2),
:deep(.article-content h3),
:deep(.article-content h4),
:deep(.article-content h5),
:deep(.article-content h6) {
  scroll-margin-top: 128px;
}

:deep(.article-content .table-scroll) {
  overflow-x: auto;
  margin: 1.6rem 0;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  -webkit-overflow-scrolling: touch;
}

:deep(.article-content .table-scroll table) {
  display: table;
  width: max-content;
  min-width: 100%;
  margin: 0;
  border: 0;
  border-collapse: collapse;
  border-radius: 0;
  box-shadow: none;
  white-space: nowrap;
  overflow: visible;
}

:deep(.article-content .table-scroll th:first-child),
:deep(.article-content .table-scroll td:first-child) {
  border-left: 0;
}

:deep(.article-content .table-scroll th:last-child),
:deep(.article-content .table-scroll td:last-child) {
  border-right: 0;
}

:deep(.article-content .table-scroll tr:first-child th),
:deep(.article-content .table-scroll tr:first-child td) {
  border-top: 0;
}

:deep(.article-content .table-scroll tr:last-child th),
:deep(.article-content .table-scroll tr:last-child td) {
  border-bottom: 0;
}

.toc-backdrop {
  z-index: 1500;
  background: rgba(15, 23, 42, 0.36);
}

:global(body.blog-toc-open .main-header) {
  z-index: 900;
}

@media (max-width: 1180px) {
  .content-container {
    width: min(860px, 100%);
    overflow-x: visible;
  }

  .content-wrapper {
    display: block;
    padding: 0 8px 56px;
    overflow-x: visible;
  }

  .blog-layout-spacer {
    display: none;
  }

  .article-main {
    width: 100%;
    max-width: none;
    overflow-x: visible;
  }

  .toc-sidebar {
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 1510;
    display: block;
    width: min(86vw, 340px);
    max-width: none;
    max-height: none;
    padding: 18px;
    border: 1px solid var(--nav-border, #e5e7eb);
    border-radius: 0;
    background: var(--bg-color, #fff);
    box-shadow: none;
    opacity: 1;
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform 0.2s ease;
  }

  .toc-sidebar.is-open {
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 1510;
    width: min(86vw, 340px);
    max-width: none;
    max-height: none;
    border: 1px solid var(--nav-border, #e5e7eb);
    border-radius: 0;
    background: var(--bg-color, #fff);
    box-shadow: none;
    overflow-y: auto;
    transform: translateX(0);
  }

  .toc-backdrop {
    z-index: 1500;
  }

  .mobile-toc-button {
    display: inline-flex !important;
  }

  .toc-close-btn {
    display: inline-flex;
  }

  :deep(.article-content table) {
    display: table;
  }

  :deep(.article-content thead) {
    display: table-header-group;
  }

  :deep(.article-content tbody) {
    display: table-row-group;
  }

  :deep(.article-content tr) {
    display: table-row;
  }

  :deep(.article-content th),
  :deep(.article-content td) {
    display: table-cell;
  }
}

@media (max-width: 640px) {
  .blog-page {
    padding: 0;
  }

  .top-navigation {
    padding: 10px 10px 6px;
  }

  .content-wrapper {
    padding: 0 10px 52px;
  }
}
</style>
