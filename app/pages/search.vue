<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useHead } from '#app'
import {
  getCurrentLocaleSlug,
  getLocalizedSearchPath,
  replaceLocaleInPath,
  splitLocalePath
} from '~~/utils/i18n-locales'
import { numberWikiChapters } from '~~/utils/wiki-chapters'

type SearchType = 'all' | 'blog' | 'wiki' | 'page'

interface ContentDoc {
  _id?: string
  _path?: string
  path?: string
  stem?: string
  title?: string
  description?: string
  date?: string
  localeSlug?: string
  sourceStem?: string
  chapter?: string
  chapterOrder?: string
  docKey?: string
  docTitle?: string
  isWikiDoc?: boolean
  isWikiIndex?: boolean
  body?: unknown
  [key: string]: unknown
}

interface SearchDoc {
  id: string
  path: string
  title: string
  type: Exclude<SearchType, 'all'>
  typeLabel: string
  section: string
  date: string
  summary: string
  searchText: string
  titleIndex: string
  sectionIndex: string
  pathIndex: string
  searchIndex: string
}

interface SearchResult extends SearchDoc {
  score: number
  excerpt: string
}

const SEARCH_TYPES: SearchType[] = ['all', 'blog', 'wiki', 'page']
const TYPE_LABELS: Record<SearchType, string> = {
  all: '全部',
  blog: '博客',
  wiki: 'Wiki',
  page: '页面'
}

const STATIC_PAGES = [
  {
    path: '/',
    title: '首页',
    section: '站点页面',
    summary: '探索、学习与创造的记录。',
    keywords: '个人网站 首页 博客 Wiki 技术 嵌入式 机器人 OpenCV Nuxt'
  },
  {
    path: '/blog',
    title: '博客列表',
    section: '站点页面',
    summary: '博客文章入口。',
    keywords: '博客 文章 随笔 记录'
  },
  {
    path: '/wiki',
    title: 'Wiki 知识库',
    section: '站点页面',
    summary: '按教程和章节组织的技术文档。',
    keywords: 'Wiki 知识库 教程 文档 章节'
  },
  {
    path: '/about',
    title: '关于',
    section: '站点页面',
    summary: '本站 CDN 服务、访问线路与部署说明。',
    keywords: '关于 CDN Cloudflare EdgeOne DNSPod 部署'
  },
  {
    path: '/more',
    title: '更多页面',
    section: '站点页面',
    summary: '站内重要页面快速入口。',
    keywords: '更多 页面 导航 数据统计 友链 简历'
  },
  {
    path: '/music',
    title: '音乐播放器',
    section: '站点页面',
    summary: '和悬浮播放器同步的完整音乐播放器。',
    keywords: '音乐 播放器 QQ音乐 歌单 专辑封面 小播放器'
  },
  {
    path: '/stats',
    title: '数据统计',
    section: '站点页面',
    summary: '网站访问数据统计。',
    keywords: '统计 Analytics Umami 访问数据'
  },
  {
    path: '/friend',
    title: '友情链接',
    section: '站点页面',
    summary: '技术资源、开源社区、竞赛团队及优质网站。',
    keywords: '友情链接 友链 社区 团队 网站'
  },
  {
    path: '/tech-footprint',
    title: '技术足迹',
    section: '站点页面',
    summary: '个人机器人技术路线和长期任务清单。',
    keywords: '技术足迹 机器人 ROS2 SLAM Nav2 ros2_control MoveIt2 TensorRT TodoList'
  },
  {
    path: '/weight-loss',
    title: '减脂计划',
    section: '站点页面',
    summary: '个人减脂目标体重和每周身体数据记录。',
    keywords: '减脂 减肥 体重 体脂率 肌肉量 腰围 计划 记录'
  },
  {
    path: '/cv',
    title: '简历',
    section: '站点页面',
    summary: '在线查看或下载 PDF 简历。',
    keywords: '简历 CV PDF 个人简历'
  },
  {
    path: '/start',
    title: '导航页',
    section: '站点页面',
    summary: '搜索与常用入口导航。',
    keywords: '导航页 搜索 书签 常用入口'
  },
  {
    path: '/mylogo',
    title: '个人 LOGO',
    section: '站点页面',
    summary: '个人 LOGO 介绍。',
    keywords: 'LOGO 标识 个人标志'
  }
]

const SEARCH_CONTENT_FIELDS = [
  'path',
  'stem',
  'title',
  'description',
  'date',
  'localeSlug',
  'sourceStem',
  'chapterOrder',
  'docKey',
  'docTitle',
  'isWikiDoc',
  'isWikiIndex',
  'body'
] as const

const route = useRoute()
const router = useRouter()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))

useHead({
  title: '全站搜索',
  meta: [
    { name: 'description', content: '搜索博客、Wiki 与站点页面' }
  ]
})

const searchContentKey = computed(() => `site-search-content:${currentLocaleSlug.value}`)

const { data: contentDocuments, pending, status } = await useAsyncData<SearchDoc[]>(
  searchContentKey,
  async () => {
    const items = await queryCollection('content')
      .where('localeSlug', '=', currentLocaleSlug.value)
      .select(...SEARCH_CONTENT_FIELDS)
      .all()

    const documents = items as unknown as ContentDoc[]
    const wikiGroups = new Map<string, ContentDoc[]>()

    documents
      .filter(item => item.isWikiDoc && !item.isWikiIndex && item.docKey)
      .forEach((item) => {
        const group = wikiGroups.get(item.docKey || '') || []
        group.push(item)
        wikiGroups.set(item.docKey || '', group)
      })

    wikiGroups.forEach((group) => {
      numberWikiChapters(group).forEach((item) => {
        const source = group.find(entry => entry.path === item.path)
        if (source) source.chapter = item.chapter
      })
    })

    return documents
      .map(toSearchDoc)
      .filter((doc): doc is SearchDoc => Boolean(doc))
  },
  {
    server: true,
    default: () => [],
    watch: [currentLocaleSlug]
  }
)

const searchQuery = ref(readQueryParam(route.query.q))
const selectedType = ref<SearchType>(readTypeParam(route.query.type))
let urlSyncTimer: ReturnType<typeof setTimeout> | null = null

const normalizedQuery = computed(() => normalizeSearchText(searchQuery.value))
const contentLoading = computed(() => pending.value || status.value === 'idle' || status.value === 'pending')
const queryTerms = computed(() =>
  normalizedQuery.value
    .split(/\s+/)
    .map(term => term.trim())
    .filter(Boolean)
)

const searchDocuments = computed<SearchDoc[]>(() => {
  const staticDocs = STATIC_PAGES.map((page): SearchDoc => {
    const path = getLocalizedStaticPath(page.path)
    const searchText = normalizeWhitespace([
      page.title,
      page.section,
      page.summary,
      page.keywords,
      path
    ].join(' '))

    return buildSearchDoc({
      id: `static:${path}`,
      path,
      title: page.title,
      type: 'page',
      typeLabel: TYPE_LABELS.page,
      section: page.section,
      date: '',
      summary: page.summary,
      searchText
    })
  })

  return dedupeByPath([...(contentDocuments.value || []), ...staticDocs])
})

const typeCounts = computed(() => {
  const counts: Record<SearchType, number> = {
    all: searchDocuments.value.length,
    blog: 0,
    wiki: 0,
    page: 0
  }

  searchDocuments.value.forEach((doc) => {
    counts[doc.type] += 1
  })

  return counts
})

const filteredDocuments = computed(() => {
  if (selectedType.value === 'all') {
    return searchDocuments.value
  }

  return searchDocuments.value.filter(doc => doc.type === selectedType.value)
})

const searchResults = computed<SearchResult[]>(() => {
  const query = normalizedQuery.value
  const terms = queryTerms.value
  const documents = filteredDocuments.value

  if (!query) {
    return documents
      .slice()
      .sort(sortByDate)
      .slice(0, 12)
      .map(doc => ({
        ...doc,
        score: 0,
        excerpt: doc.summary || createExcerpt(doc.searchText, '', 160, [], doc.searchIndex)
      }))
  }

  return documents
    .map((doc) => {
      const score = scoreDocument(doc, query, terms)
      return {
        ...doc,
        score,
        excerpt: createExcerpt(doc.searchText, query, 180, terms, doc.searchIndex)
      }
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || sortByDate(a, b))
})

const resultSummary = computed(() => {
  if (contentLoading.value) {
    return '正在扫描内容...'
  }

  if (!normalizedQuery.value) {
    return `共收录 ${filteredDocuments.value.length} 个页面`
  }

  return `找到 ${searchResults.value.length} 条结果`
})

const highlightTerms = computed(() => {
  const values = [normalizedQuery.value, ...queryTerms.value]
    .map(term => term.trim())
    .filter((term, index, list) => term && list.indexOf(term) === index)
    .sort((a, b) => b.length - a.length)

  return values
})

const highlightPattern = computed(() => {
  const terms = highlightTerms.value
  return terms.length ? new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig') : null
})

watch(() => route.query.q, (nextValue) => {
  const nextQuery = readQueryParam(nextValue)
  if (nextQuery !== searchQuery.value) {
    searchQuery.value = nextQuery
  }
})

watch(() => route.query.type, (nextValue) => {
  const nextType = readTypeParam(nextValue)
  if (nextType !== selectedType.value) {
    selectedType.value = nextType
  }
})

watch([searchQuery, selectedType], () => {
  if (!import.meta.client) return

  if (urlSyncTimer) {
    clearTimeout(urlSyncTimer)
  }

  urlSyncTimer = setTimeout(() => {
    const nextQuery: Record<string, string> = {}
    const q = searchQuery.value.trim()

    if (q) {
      nextQuery.q = q
    }

    if (selectedType.value !== 'all') {
      nextQuery.type = selectedType.value
    }

    router.replace({
      path: getLocalizedSearchPath(currentLocaleSlug.value),
      query: nextQuery
    })
  }, 180)
})

onUnmounted(() => {
  if (urlSyncTimer) {
    clearTimeout(urlSyncTimer)
  }
})

function setType(type: SearchType) {
  selectedType.value = type
}

function clearSearch() {
  searchQuery.value = ''
}

function buildSearchDoc(doc: Omit<SearchDoc, 'titleIndex' | 'sectionIndex' | 'pathIndex' | 'searchIndex'>): SearchDoc {
  return {
    ...doc,
    titleIndex: normalizeSearchText(doc.title),
    sectionIndex: normalizeSearchText(doc.section),
    pathIndex: doc.path.toLowerCase(),
    searchIndex: normalizeSearchText(doc.searchText)
  }
}

function toSearchDoc(doc: ContentDoc): SearchDoc | null {
  if (doc.localeSlug !== currentLocaleSlug.value) {
    return null
  }

  const path = normalizePath(doc.path || doc._path)
  const title = String(doc.title || '').trim()

  if (!path || !title) {
    return null
  }

  const stem = String(doc.sourceStem || doc.stem || '')
  const bodyText = normalizeWhitespace(extractText(doc.body))
  const type = getContentType(doc, stem)
  const typeLabel = TYPE_LABELS[type]
  const section = getSectionLabel(doc, stem, type)
  const summary = normalizeWhitespace(
    String(doc.description || '').trim() || createExcerpt(bodyText, '', 150)
  )
  const date = String(doc.date || '')

  return buildSearchDoc({
    id: String(doc._id || path),
    path,
    title,
    type,
    typeLabel,
    section,
    date,
    summary,
    searchText: normalizeWhitespace([
      title,
      doc.description,
      doc.docTitle,
      doc.chapter,
      date,
      path,
      stem,
      bodyText
    ].filter(Boolean).join(' '))
  })
}

function getContentType(doc: ContentDoc, stem: string): SearchDoc['type'] {
  const { pathWithoutLocale } = splitLocalePath(doc.path || doc._path)

  if (stem.startsWith('posts/') || pathWithoutLocale.startsWith('/blog')) {
    return 'blog'
  }

  if (doc.isWikiDoc || stem.startsWith('wiki/') || pathWithoutLocale.startsWith('/wiki')) {
    return 'wiki'
  }

  return 'page'
}

function getSectionLabel(doc: ContentDoc, stem: string, type: SearchDoc['type']) {
  if (type === 'blog') {
    return '博客'
  }

  if (type === 'wiki') {
    const docTitle = String(doc.docTitle || '').trim()
    const chapter = String(doc.chapter || '').trim()

    if (doc.isWikiIndex && docTitle) {
      return `${docTitle} / 目录`
    }

    if (docTitle && chapter) {
      return `${docTitle} / ${chapter}`
    }

    return docTitle || 'Wiki'
  }

  if (stem.startsWith('pages/')) {
    return '内容页面'
  }

  return '站点页面'
}

function scoreDocument(doc: SearchDoc, query: string, terms: string[]) {
  let score = 0

  if (doc.titleIndex.includes(query)) score += 120
  if (doc.sectionIndex.includes(query)) score += 60
  if (doc.pathIndex.includes(query)) score += 28
  if (doc.searchIndex.includes(query)) score += 24

  terms.forEach((term) => {
    if (doc.titleIndex.includes(term)) score += 32
    if (doc.sectionIndex.includes(term)) score += 14
    if (doc.pathIndex.includes(term)) score += 8
    if (doc.searchIndex.includes(term)) score += 5
  })

  if (doc.type === 'wiki' && doc.section.includes('/ 目录')) {
    score -= 4
  }

  return score
}

function extractText(value: unknown, depth = 0): string {
  if (value === null || value === undefined || depth > 12) {
    return ''
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(item => extractText(item, depth + 1)).join(' ')
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const chunks: string[] = []

    if (typeof record.value === 'string') {
      chunks.push(record.value)
    }

    if (typeof record.text === 'string') {
      chunks.push(record.text)
    }

    if (Array.isArray(record.children)) {
      chunks.push(extractText(record.children, depth + 1))
    }

    if (Array.isArray(record.content)) {
      chunks.push(extractText(record.content, depth + 1))
    }

    return chunks.join(' ')
  }

  return ''
}

function createExcerpt(text: string, query: string, maxLength: number, terms: string[] = [], searchIndex = '') {
  const source = normalizeWhitespace(text)

  if (!source) {
    return ''
  }

  if (!query) {
    return source.length > maxLength ? `${source.slice(0, maxLength).trim()}...` : source
  }

  const lowerSource = searchIndex || source.toLowerCase()
  const lowerQuery = query.toLowerCase()
  let index = lowerSource.indexOf(lowerQuery)

  if (index < 0) {
    index = terms
      .map(term => lowerSource.indexOf(term))
      .filter(position => position >= 0)
      .sort((a, b) => a - b)[0] ?? 0
  }

  const start = Math.max(0, index - Math.floor(maxLength / 3))
  const end = Math.min(source.length, start + maxLength)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < source.length ? '...' : ''

  return `${prefix}${source.slice(start, end).trim()}${suffix}`
}

function highlightedParts(text: string) {
  const pattern = highlightPattern.value

  if (!pattern || !text) {
    return [{ text, mark: false }]
  }

  const parts: Array<{ text: string, mark: boolean }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  pattern.lastIndex = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), mark: false })
    }

    parts.push({ text: match[0], mark: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), mark: false })
  }

  return parts.length ? parts : [{ text, mark: false }]
}

function sortByDate(a: SearchDoc, b: SearchDoc) {
  const timeA = a.date ? new Date(a.date).getTime() : 0
  const timeB = b.date ? new Date(b.date).getTime() : 0

  return timeB - timeA || a.title.localeCompare(b.title, 'zh-CN')
}

function dedupeByPath(items: SearchDoc[]) {
  const map = new Map<string, SearchDoc>()

  items.forEach((item) => {
    if (!map.has(item.path)) {
      map.set(item.path, item)
    }
  })

  return Array.from(map.values())
}

function getLocalizedStaticPath(path: string) {
  return replaceLocaleInPath(path, currentLocaleSlug.value)
}

function normalizePath(value: unknown) {
  const path = String(value || '').trim()

  if (!path) {
    return ''
  }

  return path.startsWith('/') ? path : `/${path}`
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeSearchText(value: string) {
  return normalizeWhitespace(value).toLowerCase()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readQueryParam(value: unknown) {
  if (Array.isArray(value)) {
    return String(value[0] || '')
  }

  return typeof value === 'string' ? value : ''
}

function readTypeParam(value: unknown): SearchType {
  const type = readQueryParam(value)

  return SEARCH_TYPES.includes(type as SearchType) ? type as SearchType : 'all'
}
</script>

<template>
  <div class="search-page">
    <header class="search-header">
      <p class="search-kicker">Search</p>
      <h1>全站搜索</h1>
    </header>

    <section class="search-panel" aria-label="全站搜索">
      <form class="search-form" @submit.prevent>
        <div class="search-input-shell">
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z" />
            <path d="m16.3 16.3 4.2 4.2" />
          </svg>

          <input
            v-model="searchQuery"
            class="search-input"
            type="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="搜索内容"
            aria-label="搜索内容"
          />

          <button
            v-if="searchQuery"
            class="clear-button"
            type="button"
            aria-label="清空搜索"
            title="清空"
            @click="clearSearch"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.5 6.5 17.5 17.5" />
              <path d="m17.5 6.5-11 11" />
            </svg>
          </button>
        </div>
      </form>

      <div class="type-tabs" aria-label="搜索范围">
        <button
          v-for="type in SEARCH_TYPES"
          :key="type"
          class="type-tab"
          :class="{ active: selectedType === type }"
          type="button"
          @click="setType(type)"
        >
          <span>{{ TYPE_LABELS[type] }}</span>
          <span class="type-count">{{ typeCounts[type] }}</span>
        </button>
      </div>
    </section>

    <div class="result-status">
      <span>{{ resultSummary }}</span>
      <span v-if="!normalizedQuery">最近内容</span>
    </div>

    <div v-if="contentLoading" class="search-loading">
      正在扫描内容...
    </div>

    <section v-else-if="searchResults.length" class="result-list" aria-label="搜索结果">
      <NuxtLink
        v-for="result in searchResults"
        :key="result.id"
        class="result-card"
        :to="result.path"
      >
        <div class="result-topline">
          <span class="result-type">{{ result.typeLabel }}</span>
          <span class="result-section">{{ result.section }}</span>
          <time v-if="result.date" :datetime="result.date">{{ result.date }}</time>
        </div>

        <h2 class="result-title">
          <template
            v-for="(part, index) in highlightedParts(result.title)"
            :key="`${result.id}-title-${index}`"
          >
            <mark v-if="part.mark">{{ part.text }}</mark>
            <span v-else>{{ part.text }}</span>
          </template>
        </h2>

        <p v-if="result.excerpt" class="result-excerpt">
          <template
            v-for="(part, index) in highlightedParts(result.excerpt)"
            :key="`${result.id}-excerpt-${index}`"
          >
            <mark v-if="part.mark">{{ part.text }}</mark>
            <span v-else>{{ part.text }}</span>
          </template>
        </p>

        <div class="result-path">{{ result.path }}</div>
      </NuxtLink>
    </section>

    <section v-else class="empty-state">
      <h2>没有找到结果</h2>
      <p>换个关键词试试。</p>
    </section>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.search-header {
  margin-bottom: 1.35rem;
}

.search-kicker {
  margin: 0 0 0.5rem;
  color: #14b8a6;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.search-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}

.search-panel {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input-shell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 58px;
  padding: 0 0.9rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.search-input-shell:focus-within {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.14);
}

.search-icon,
.clear-button svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.search-icon {
  flex: 0 0 auto;
  color: var(--text-secondary);
}

.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-main);
  font: inherit;
  font-size: 1.05rem;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.18s ease;
}

.clear-button:hover {
  border-color: var(--nav-border);
  background: var(--bg-color);
  color: var(--text-main);
}

.type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.type-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 38px;
  padding: 0 0.8rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-secondary);
  font-weight: 800;
  cursor: pointer;
  transition: all 0.18s ease;
}

.type-tab:hover,
.type-tab.active {
  border-color: #14b8a6;
  background: rgba(20, 184, 166, 0.1);
  color: var(--text-main);
}

.type-count {
  min-width: 1.6em;
  padding: 0.1rem 0.42rem;
  border-radius: 999px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.type-tab.active .type-count {
  background: #14b8a6;
  color: #fff;
}

.result-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 1.4rem 0 1rem;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.search-loading,
.empty-state {
  padding: 3rem 1rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  text-align: center;
}

.empty-state h2 {
  margin: 0 0 0.5rem;
  color: var(--text-main);
  font-size: 1.3rem;
}

.empty-state p {
  margin: 0;
}

.result-list {
  display: grid;
  gap: 0.85rem;
}

.result-card {
  display: block;
  padding: 1rem 1.05rem;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-color);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.result-card:hover {
  border-color: #14b8a6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

:global(html.dark) .result-card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}

.result-topline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.result-type {
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.12);
  color: #0f9f7f;
  font-weight: 800;
}

:global(html.dark) .result-type {
  color: #5eead4;
}

.result-section {
  overflow-wrap: anywhere;
}

.result-title {
  margin: 0;
  color: #0f9f7f;
  font-size: 1.22rem;
  line-height: 1.35;
}

:global(html.dark) .result-title {
  color: #5eead4;
}

.result-excerpt {
  margin: 0.6rem 0 0;
  color: var(--text-secondary);
  line-height: 1.75;
}

.result-path {
  margin-top: 0.7rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

mark {
  padding: 0.05rem 0.12rem;
  border-radius: 4px;
  background: rgba(250, 204, 21, 0.35);
  color: inherit;
}

@media (max-width: 640px) {
  .search-page {
    padding-inline: 0.75rem;
  }

  .search-input-shell {
    min-height: 52px;
  }

  .type-tab {
    flex: 1 1 calc(50% - 0.55rem);
    justify-content: center;
  }
}
</style>
