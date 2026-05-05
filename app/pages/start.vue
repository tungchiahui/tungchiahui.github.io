<!-- app/pages/start.vue -->
<template>
  <div class="start-page" :class="`is-${viewMode}`" :style="backgroundStyle">
    <div class="photo-layer" aria-hidden="true"></div>

    <header class="start-topbar">
      <NuxtLink class="brand-mark" to="/" aria-label="返回首页">
        <span>TC</span>
      </NuxtLink>

      <div class="top-actions">
        <div class="mode-switch" aria-label="显示模式">
          <button
            type="button"
            :class="{ active: viewMode === 'simple' }"
            @click="setViewMode('simple')"
          >
            简洁
          </button>
          <button
            type="button"
            :class="{ active: viewMode === 'detailed' }"
            @click="setViewMode('detailed')"
          >
            完整
          </button>
        </div>

        <button class="icon-button top-icon" type="button" aria-label="切换背景" title="切换背景" @click="nextBackground">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7h18" />
            <path d="M7 3 3 7l4 4" />
            <path d="M21 17H3" />
            <path d="m17 13 4 4-4 4" />
          </svg>
        </button>
      </div>
    </header>

    <section class="start-hero" aria-labelledby="start-title">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="hero-kicker">{{ dateLine }}</p>
          <h1 id="start-title" class="hero-title">
            <span class="time-main">{{ timeHM }}</span>
            <span class="time-second">{{ timeSS }}</span>
          </h1>
          <p class="hero-greeting">{{ greeting }}</p>
        </div>

        <form class="search-console" @submit.prevent="doSearch" @keydown="onSearchKeydown">
          <div
            class="search-box"
            :class="{ focused: searchFocused, 'has-dropdown': showSearchPanel }"
          >
            <button
              class="engine-inline-button"
              type="button"
              :aria-label="`当前搜索引擎：${currentEngine.name}，点击切换`"
              :title="`当前搜索引擎：${currentEngine.name}`"
              @click="cycleEngine"
            >
              <img
                class="engine-logo"
                :src="currentEngine.logo"
                :alt="currentEngine.name"
                referrerpolicy="no-referrer"
                draggable="false"
              />
            </button>

            <input
              ref="searchInput"
              v-model="query"
              class="search-input"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="搜索，或者输入一个网址"
              aria-label="搜索或输入网址"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
            />

            <button
              v-if="query"
              class="icon-button clear-button"
              type="button"
              aria-label="清空搜索"
              title="清空"
              @mousedown.prevent="query = ''"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.5 6.5 17.5 17.5" />
                <path d="m17.5 6.5-11 11" />
              </svg>
            </button>

            <button class="search-submit" type="submit" aria-label="开始搜索" title="搜索">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z" />
                <path d="m16.3 16.3 4.2 4.2" />
              </svg>
            </button>
          </div>

          <Transition name="dropdown">
            <div v-if="showSearchPanel" class="history-popover">
              <div class="history-head">
                <span>{{ query.trim() ? '搜索建议' : '最近搜索' }}</span>
                <button v-if="history.length" type="button" @mousedown.prevent="clearHistory">清除历史</button>
              </div>

              <div v-if="searchOptions.length" class="history-list">
                <div
                  v-for="(item, i) in searchOptions"
                  :key="`${item.source}-${item.text}`"
                  class="history-item"
                  :class="{ active: historyIndex === i }"
                  @mousedown.prevent="selectSearchOption(item)"
                >
                  <span class="history-dot" :class="item.source" aria-hidden="true"></span>
                  <span class="history-text">{{ item.text }}</span>
                  <span class="history-engine">{{ item.source === 'suggestion' ? currentEngine.name : item.engine }}</span>
                  <button
                    v-if="item.source === 'history'"
                    class="history-remove"
                    type="button"
                    aria-label="移除此条历史"
                    @mousedown.prevent.stop="removeHistory(item.text)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.5 6.5 17.5 17.5" />
                      <path d="m17.5 6.5-11 11" />
                    </svg>
                  </button>
                </div>
              </div>

              <div v-else class="suggest-loading">正在获取建议</div>
            </div>
          </Transition>

        </form>
      </div>
    </section>

    <Transition name="detail">
    <main v-if="viewMode === 'detailed'" class="start-main">
      <section class="bookmark-stage" aria-labelledby="bookmark-title">
        <div class="stage-head">
          <div>
            <p class="stage-kicker">Launchpad</p>
            <h2 id="bookmark-title">常用入口</h2>
          </div>

          <div class="stage-actions">
            <button
              class="icon-button edit-toggle"
              :class="{ active: editing }"
              type="button"
              :aria-label="editing ? '完成编辑' : '编辑书签'"
              :title="editing ? '完成编辑' : '编辑书签'"
              @click="editing = !editing"
            >
              <svg v-if="editing" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12 4.2 4.2L19 6.8" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20h4.4L19.7 8.7a2.1 2.1 0 0 0 0-3L18.3 4.3a2.1 2.1 0 0 0-3 0L4 15.6V20Z" />
                <path d="m13.8 5.8 4.4 4.4" />
              </svg>
            </button>

            <template v-if="editing">
              <button class="icon-button" type="button" aria-label="新增分类" title="新增分类" @click="addSection">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>

              <button class="icon-button" type="button" aria-label="恢复默认" title="恢复默认" @click="resetDefaults">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.8 9a7.5 7.5 0 1 1 1.7 8.2" />
                  <path d="M4.8 4.8V9h4.3" />
                </svg>
              </button>
            </template>
          </div>
        </div>

        <div class="section-stack">
          <section
            v-for="(section, si) in sections"
            :key="si"
            class="link-section"
            :style="{ '--section-accent': sectionAccent(si) }"
          >
            <div class="section-head">
              <span class="section-number">{{ sectionNumber(si) }}</span>

              <div class="section-title-wrap">
                <input
                  v-if="editing"
                  v-model="section.title"
                  class="section-title-input"
                  type="text"
                  aria-label="分类名称"
                  @change="persist"
                />
                <h3 v-else>{{ section.title }}</h3>
                <span>{{ section.items.length }} 个入口</span>
              </div>

              <button
                v-if="editing"
                class="icon-button add-link"
                type="button"
                aria-label="添加书签"
                title="添加书签"
                @click="addItem(si)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>

            <TransitionGroup name="bookmark" tag="div" class="bookmark-grid">
              <component
                :is="editing ? 'div' : 'a'"
                v-for="(item, ii) in section.items"
                :key="item.id"
                class="bookmark-link"
                :href="editing ? undefined : item.url"
                :target="editing ? undefined : '_blank'"
                :rel="editing ? undefined : 'noopener noreferrer'"
                :style="{ '--item-accent': item.color || accentByIndex(ii + si) }"
              >
                <span class="bookmark-avatar">{{ initials(item.name) }}</span>

                <template v-if="!editing">
                  <span class="bookmark-copy">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.desc }}</span>
                    <small>{{ urlHost(item.url) }}</small>
                  </span>

                  <span v-if="item.key" class="bookmark-key">{{ item.key }}</span>

                  <svg class="external-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </template>

                <template v-else>
                  <span class="edit-fields">
                    <input v-model="item.name" type="text" placeholder="名称" aria-label="书签名称" @change="persist" />
                    <input v-model="item.desc" type="text" placeholder="描述" aria-label="书签描述" @change="persist" />
                    <input v-model="item.url" type="url" placeholder="URL" aria-label="书签链接" @change="persist" />
                  </span>

                  <button
                    class="icon-button remove-link"
                    type="button"
                    aria-label="删除书签"
                    title="删除书签"
                    @click.prevent="removeItem(si, ii)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.5 6.5 17.5 17.5" />
                      <path d="m17.5 6.5-11 11" />
                    </svg>
                  </button>
                </template>
              </component>
            </TransitionGroup>
          </section>
        </div>
      </section>

      <aside class="start-aside" aria-label="启动页状态">
        <section class="aside-panel now-panel">
          <p>当前引擎</p>
          <strong>{{ currentEngine.name }}</strong>
          <span>{{ query.trim() ? '准备搜索' : '等待输入' }}</span>
        </section>

        <section class="aside-panel metrics-panel">
          <div>
            <strong>{{ sections.length }}</strong>
            <span>分类</span>
          </div>
          <div>
            <strong>{{ bookmarkCount }}</strong>
            <span>入口</span>
          </div>
          <div>
            <strong>{{ history.length }}</strong>
            <span>历史</span>
          </div>
        </section>

        <section v-if="history.length" class="aside-panel recent-panel">
          <div class="aside-head">
            <p>最近</p>
            <button type="button" @click="clearHistory">清除</button>
          </div>

          <button
            v-for="item in recentHistory"
            :key="`${item.text}-aside`"
            type="button"
            class="recent-item"
            @click="selectHistory(item)"
          >
            <span>{{ item.text }}</span>
            <small>{{ item.engine }}</small>
          </button>
        </section>
      </aside>
    </main>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface BookmarkItem {
  id: string
  name: string
  desc: string
  url: string
  key?: string
  color?: string
}

interface BookmarkSection {
  title: string
  icon?: string
  items: BookmarkItem[]
}

interface HistoryEntry {
  text: string
  engine: string
  timestamp: number
}

interface SearchOption {
  text: string
  engine: string
  source: 'suggestion' | 'history'
  timestamp?: number
}

type ViewMode = 'simple' | 'detailed'

const defaultSections: BookmarkSection[] = [
  {
    title: '日常工具',
    items: [
      { id: 'tool-gmail', name: 'Gmail', desc: '邮件收件箱', url: 'https://mail.google.com', key: '1', color: '#ef5b4d' },
      { id: 'tool-github', name: 'GitHub', desc: '代码与项目', url: 'https://github.com', key: '2', color: '#6f66d8' },
      { id: 'tool-notion', name: 'Notion', desc: '笔记与资料', url: 'https://notion.so', key: '3', color: '#2f3437' },
      { id: 'tool-chatgpt', name: 'ChatGPT', desc: 'AI 助手', url: 'https://chat.openai.com', key: '4', color: '#10a37f' },
    ],
  },
  {
    title: '开发资源',
    items: [
      { id: 'dev-mdn', name: 'MDN', desc: 'Web 文档', url: 'https://developer.mozilla.org', color: '#2f80ed' },
      { id: 'dev-stack', name: 'Stack Overflow', desc: '技术问答', url: 'https://stackoverflow.com', color: '#f48225' },
      { id: 'dev-caniuse', name: 'Can I Use', desc: '兼容性查询', url: 'https://caniuse.com', color: '#7bbf47' },
      { id: 'dev-codepen', name: 'CodePen', desc: '前端实验', url: 'https://codepen.io', color: '#47b8a6' },
    ],
  },
  {
    title: '阅读灵感',
    items: [
      { id: 'read-hn', name: 'Hacker News', desc: '技术热榜', url: 'https://news.ycombinator.com', color: '#ff6600' },
      { id: 'read-producthunt', name: 'Product Hunt', desc: '产品发现', url: 'https://www.producthunt.com', color: '#da3b28' },
      { id: 'read-v2ex', name: 'V2EX', desc: '创意社区', url: 'https://www.v2ex.com', color: '#308eda' },
      { id: 'read-zhihu', name: '知乎', desc: '知识问答', url: 'https://www.zhihu.com', color: '#0084ff' },
    ],
  },
  {
    title: '媒体娱乐',
    items: [
      { id: 'media-youtube', name: 'YouTube', desc: '视频频道', url: 'https://www.youtube.com', color: '#ff0033' },
      { id: 'media-bilibili', name: 'Bilibili', desc: '弹幕视频', url: 'https://www.bilibili.com', color: '#00aeec' },
      { id: 'media-spotify', name: 'Spotify', desc: '音乐电台', url: 'https://open.spotify.com', color: '#1ed760' },
      { id: 'media-douban', name: '豆瓣', desc: '书影音', url: 'https://www.douban.com', color: '#1b813e' },
    ],
  },
]

const engines = [
  { name: '百度', logo: 'https://www.baidu.com/favicon.ico', url: 'https://www.baidu.com/s?wd=' },
  { name: '谷歌', logo: 'https://www.google.com/favicon.ico', url: 'https://www.google.com/search?q=' },
  { name: '必应', logo: 'https://www.bing.com/sa/simg/favicon-trans-bg-blue-mg.ico', url: 'https://www.bing.com/search?q=' },
]

const backgroundPhotos = [
  {
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=86',
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=86',
  },
  {
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=86',
  },
  {
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2400&q=86',
  },
  {
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2400&q=86',
  },
]

const BOOKMARK_KEY = 'start-page-bookmarks'
const HISTORY_KEY = 'start-page-history'
const ENGINE_KEY = 'start-page-engine'
const VIEW_MODE_KEY = 'start-page-view-mode'
const BACKGROUND_KEY = 'start-page-background'
const MAX_HISTORY = 20
const sectionAccents = ['#0ea5a4', '#ef7d3c', '#7c6ee6', '#4a9f58', '#d14b68', '#308eda']

const query = ref('')
const searchFocused = ref(false)
const engineIdx = ref(0)
const viewMode = ref<ViewMode>('simple')
const backgroundIdx = ref(0)
const editing = ref(false)
const showHistory = ref(false)
const historyIndex = ref(-1)
const searchInput = ref<HTMLInputElement | null>(null)
const now = ref(new Date())
const history = ref<HistoryEntry[]>([])
const suggestions = ref<string[]>([])
const suggestionLoading = ref(false)

let timer: ReturnType<typeof setInterval> | undefined
let backgroundTimer: ReturnType<typeof setInterval> | undefined
let suggestionTimer: ReturnType<typeof setTimeout> | undefined
let suggestionRequestId = 0

const currentEngine = computed(() => engines[engineIdx.value] || engines[0])

const currentBackground = computed(() => backgroundPhotos[backgroundIdx.value % backgroundPhotos.length])

const backgroundStyle = computed(() => ({
  '--start-photo': `url("${currentBackground.value.url}")`,
}))

const bookmarkCount = computed(() => sections.value.reduce((total, section) => total + section.items.length, 0))

const recentHistory = computed(() => history.value.slice(0, 4))

const timeHM = computed(() => {
  const h = String(now.value.getHours()).padStart(2, '0')
  const m = String(now.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})

const timeSS = computed(() => String(now.value.getSeconds()).padStart(2, '0'))

const dateLine = computed(() => {
  const d = now.value
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 星期${days[d.getDay()]}`
})

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h >= 6 && h < 9) return '早上好，先找到今天的节奏。'
  if (h >= 9 && h < 12) return '上午好，适合做一点需要专注的事。'
  if (h >= 12 && h < 14) return '中午好，慢一点也没关系。'
  if (h >= 14 && h < 18) return '下午好，把下一步打开就行。'
  if (h >= 18 && h < 22) return '晚上好，收束今天，也留点余地。'
  return '夜深了，做完这一件就早点休息。'
})

const filteredHistory = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return history.value
  return history.value.filter(item => item.text.toLowerCase().includes(q))
})

const searchOptions = computed<SearchOption[]>(() => {
  const q = query.value.trim()
  const seen = new Set<string>()
  const options: SearchOption[] = []

  const push = (item: SearchOption) => {
    const key = item.text.trim().toLowerCase()
    if (!key || seen.has(key)) return

    seen.add(key)
    options.push(item)
  }

  if (q) {
    for (const text of suggestions.value) {
      push({
        text,
        engine: currentEngine.value.name,
        source: 'suggestion',
      })
    }
  }

  for (const item of filteredHistory.value) {
    push({
      text: item.text,
      engine: item.engine,
      source: 'history',
      timestamp: item.timestamp,
    })
  }

  return options.slice(0, 8)
})

const showSearchPanel = computed(() => {
  if (!showHistory.value) return false
  if (searchOptions.value.length > 0) return true
  return suggestionLoading.value && Boolean(query.value.trim())
})

function cloneDefaults(): BookmarkSection[] {
  return JSON.parse(JSON.stringify(defaultSections))
}

function loadSections(): BookmarkSection[] {
  if (import.meta.server) return cloneDefaults()

  try {
    const raw = localStorage.getItem(BOOKMARK_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}

  return cloneDefaults()
}

const sections = ref<BookmarkSection[]>(loadSections())

function persist() {
  if (import.meta.client) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(sections.value))
  }
}

function loadHistory() {
  if (import.meta.server) return

  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) history.value = JSON.parse(raw)
  } catch {}
}

function saveHistory() {
  if (import.meta.client) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  }
}

function addToHistory(text: string) {
  history.value = history.value.filter(item => item.text !== text)
  history.value.unshift({
    text,
    engine: currentEngine.value.name,
    timestamp: Date.now(),
  })

  if (history.value.length > MAX_HISTORY) {
    history.value = history.value.slice(0, MAX_HISTORY)
  }

  saveHistory()
}

function removeHistory(text: string) {
  history.value = history.value.filter(item => item.text !== text)
  saveHistory()
}

function clearHistory() {
  history.value = []
  saveHistory()
  showHistory.value = false
}

function selectSearchOption(item: SearchOption) {
  query.value = item.text
  showHistory.value = false
  doSearch()
}

function selectHistory(item: HistoryEntry) {
  selectSearchOption({
    text: item.text,
    engine: item.engine,
    source: 'history',
    timestamp: item.timestamp,
  })
}

function setViewMode(mode: ViewMode) {
  viewMode.value = mode
  if (mode === 'simple') editing.value = false

  if (import.meta.client) {
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }
}

function setEngine(index: number) {
  engineIdx.value = index

  if (import.meta.client) {
    localStorage.setItem(ENGINE_KEY, currentEngine.value.name)
  }
}

function cycleEngine() {
  setEngine((engineIdx.value + 1) % engines.length)
}

function setBackground(index: number) {
  backgroundIdx.value = (index + backgroundPhotos.length) % backgroundPhotos.length

  if (import.meta.client) {
    localStorage.setItem(BACKGROUND_KEY, String(backgroundIdx.value))
  }
}

function nextBackground() {
  setBackground(backgroundIdx.value + 1)
}

function looksLikeUrl(text: string) {
  return /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(text)
}

function doSearch() {
  const q = query.value.trim()
  if (!q) return

  addToHistory(q)
  showHistory.value = false

  if (looksLikeUrl(q)) {
    const url = q.startsWith('http') ? q : `https://${q}`
    window.open(url, '_self')
    return
  }

  window.open(currentEngine.value.url + encodeURIComponent(q), '_self')
}

function onSearchFocus() {
  searchFocused.value = true
  showHistory.value = true
  historyIndex.value = -1
  queueSuggestions()
}

function onSearchBlur() {
  setTimeout(() => {
    searchFocused.value = false
    showHistory.value = false
    historyIndex.value = -1
  }, 180)
}

function onSearchKeydown(event: KeyboardEvent) {
  if (!showHistory.value || searchOptions.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    historyIndex.value = Math.min(historyIndex.value + 1, searchOptions.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    historyIndex.value = Math.max(historyIndex.value - 1, -1)
  } else if (event.key === 'Enter' && historyIndex.value >= 0) {
    event.preventDefault()
    query.value = searchOptions.value[historyIndex.value].text
    historyIndex.value = -1
    doSearch()
  } else if (event.key === 'Escape') {
    showHistory.value = false
    historyIndex.value = -1
    searchInput.value?.blur()
  }
}

function normalizeSuggestionTexts(values: unknown[]) {
  const current = query.value.trim().toLowerCase()
  const seen = new Set<string>()
  const results: string[] = []

  for (const value of values) {
    const text = String(value || '').trim()
    const key = text.toLowerCase()

    if (!text || key === current || seen.has(key)) continue

    seen.add(key)
    results.push(text)
  }

  return results.slice(0, 8)
}

function parseSuggestionPayload(payload: unknown) {
  if (Array.isArray(payload) && Array.isArray(payload[1])) {
    return normalizeSuggestionTexts(payload[1])
  }

  if (!payload || typeof payload !== 'object') return []

  const data = payload as {
    s?: unknown
    AS?: {
      Results?: Array<{
        Suggests?: Array<{
          Txt?: unknown
        }>
      }>
    }
  }

  if (Array.isArray(data.s)) {
    return normalizeSuggestionTexts(data.s)
  }

  const bingSuggests = data.AS?.Results?.flatMap(result => result.Suggests || []).map(item => item.Txt)
  if (bingSuggests?.length) {
    return normalizeSuggestionTexts(bingSuggests)
  }

  return []
}

function jsonp(url: string, callbackName: string, charset = 'utf-8') {
  return new Promise<unknown>((resolve, reject) => {
    const win = window as Window & Record<string, (payload: unknown) => void>
    const script = document.createElement('script')
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('suggestion timeout'))
    }, 4200)

    function cleanup() {
      window.clearTimeout(timeout)
      delete win[callbackName]
      script.remove()
    }

    win[callbackName] = (payload: unknown) => {
      cleanup()
      resolve(payload)
    }

    script.async = true
    script.charset = charset
    script.src = url
    script.onerror = () => {
      cleanup()
      reject(new Error('suggestion failed'))
    }

    document.head.appendChild(script)
  })
}

function suggestionRequest(queryText: string, callbackName: string) {
  const encoded = encodeURIComponent(queryText)
  const engine = currentEngine.value.name

  if (engine === '谷歌') {
    return {
      url: `https://suggestqueries.google.com/complete/search?client=chrome&q=${encoded}&jsonp=${callbackName}`,
      charset: 'utf-8',
    }
  }

  if (engine === '必应') {
    return {
      url: `https://api.bing.com/osjson.aspx?query=${encoded}&JsonType=callback&JsonCallback=${callbackName}`,
      charset: 'utf-8',
    }
  }

  return {
    url: `https://suggestion.baidu.com/su?wd=${encoded}&cb=${callbackName}`,
    charset: 'gbk',
  }
}

function queueSuggestions() {
  if (import.meta.server) return

  const q = query.value.trim()
  if (suggestionTimer) clearTimeout(suggestionTimer)
  historyIndex.value = -1

  if (!q || looksLikeUrl(q)) {
    suggestions.value = []
    suggestionLoading.value = false
    suggestionRequestId += 1
    return
  }

  suggestions.value = []
  suggestionLoading.value = true
  const requestId = ++suggestionRequestId

  suggestionTimer = setTimeout(async () => {
    const callbackName = `__startSuggest_${Date.now()}_${requestId}`
    const request = suggestionRequest(q, callbackName)

    try {
      const payload = await jsonp(request.url, callbackName, request.charset)
      if (requestId === suggestionRequestId && q === query.value.trim()) {
        suggestions.value = parseSuggestionPayload(payload)
      }
    } catch {
      if (requestId === suggestionRequestId) {
        suggestions.value = []
      }
    } finally {
      if (requestId === suggestionRequestId) {
        suggestionLoading.value = false
      }
    }
  }, 180)
}

function makeId() {
  if (import.meta.client && 'crypto' in window && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `bookmark-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function addItem(sectionIndex: number) {
  sections.value[sectionIndex].items.push({
    id: makeId(),
    name: '新入口',
    desc: '添加描述',
    url: 'https://',
    color: accentByIndex(sections.value[sectionIndex].items.length + sectionIndex),
  })
  persist()
}

function removeItem(sectionIndex: number, itemIndex: number) {
  sections.value[sectionIndex].items.splice(itemIndex, 1)

  if (sections.value[sectionIndex].items.length === 0) {
    sections.value.splice(sectionIndex, 1)
  }

  persist()
}

function addSection() {
  sections.value.push({
    title: '新分类',
    items: [],
  })
  persist()
}

function resetDefaults() {
  sections.value = cloneDefaults()
  persist()
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  const tag = target.tagName
  const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable

  if (event.key === '/' && !isInput) {
    event.preventDefault()
    searchInput.value?.focus()
    return
  }

  if (event.key.toLowerCase() === 'e' && viewMode.value === 'detailed' && !isInput && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    editing.value = !editing.value
    return
  }

  if (viewMode.value === 'detailed' && !isInput && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const match = sections.value.flatMap(section => section.items).find(item => item.key === event.key)

    if (match) {
      event.preventDefault()
      window.open(match.url, '_blank')
    }
  }
}

function sectionNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

function sectionAccent(index: number) {
  return sectionAccents[index % sectionAccents.length]
}

function accentByIndex(index: number) {
  return sectionAccents[index % sectionAccents.length]
}

function initials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return 'N'

  const chars = Array.from(trimmed)
  const firstTwoCjk = chars.filter(char => /[\u4e00-\u9fff]/.test(char)).slice(0, 2).join('')
  if (firstTwoCjk) return firstTwoCjk

  return trimmed
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function urlHost(url: string) {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    return new URL(normalized).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || 'link'
  }
}

watch([query, engineIdx], () => {
  queueSuggestions()
})

onMounted(() => {
  document.body.classList.add('start-page-active')

  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  backgroundTimer = setInterval(nextBackground, 60000)

  document.addEventListener('keydown', handleKeydown)
  loadHistory()

  try {
    const savedMode = localStorage.getItem(VIEW_MODE_KEY)
    if (savedMode === 'detailed') viewMode.value = 'detailed'

    const savedBackground = Number(localStorage.getItem(BACKGROUND_KEY))
    if (Number.isInteger(savedBackground) && backgroundPhotos[savedBackground]) {
      backgroundIdx.value = savedBackground
    }

    const savedEngine = localStorage.getItem(ENGINE_KEY)
    if (savedEngine) {
      const aliases: Record<string, string> = {
        Google: '谷歌',
        Bing: '必应',
      }
      const normalizedEngine = aliases[savedEngine] || savedEngine
      const byName = engines.findIndex(engine => engine.name === normalizedEngine)
      const legacyNames = ['Google', 'Bing', 'DuckDuckGo', '百度']
      const legacyName = legacyNames[Number(savedEngine)]
      const byLegacyIndex = legacyName ? engines.findIndex(engine => engine.name === (aliases[legacyName] || legacyName)) : -1
      const nextIndex = byName >= 0 ? byName : byLegacyIndex

      if (nextIndex >= 0) engineIdx.value = nextIndex
    }
  } catch {}
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (backgroundTimer) clearInterval(backgroundTimer)
  if (suggestionTimer) clearTimeout(suggestionTimer)
  document.body.classList.remove('start-page-active')
  document.removeEventListener('keydown', handleKeydown)
})

useHead({
  title: 'Start Page',
  bodyAttrs: {
    class: 'start-page-active',
  },
})

definePageMeta({ layout: false })
</script>

<style scoped>
.start-page {
  --start-panel: color-mix(in srgb, var(--bg-color, #ffffff) 74%, transparent);
  --start-panel-solid: color-mix(in srgb, var(--bg-color, #ffffff) 92%, transparent);
  --start-text: var(--text-main, #111b18);
  --start-muted: var(--text-secondary, #52605b);
  --start-soft: color-mix(in srgb, var(--bg-secondary, #f7f7f8) 82%, transparent);
  --start-border: color-mix(in srgb, var(--nav-border, #e5e7eb) 58%, rgba(255, 255, 255, 0.7));
  --start-shadow: 0 28px 90px rgba(12, 24, 20, 0.18);
  --start-line: color-mix(in srgb, var(--nav-border, #e5e7eb) 48%, transparent);
  --start-accent: #00c58e;
  --start-accent-2: #ef7d3c;
  --start-danger: #c9434f;
  --start-hero-text: rgba(255, 255, 255, 0.97);
  --start-hero-muted: rgba(255, 255, 255, 0.88);
  --start-readable-shadow:
    0 1px 2px rgba(0, 0, 0, 0.36),
    0 0 1px rgba(0, 0, 0, 0.24),
    0 10px 30px rgba(0, 0, 0, 0.18);
  min-height: 100vh;
  position: relative;
  isolation: isolate;
  margin: 0;
  padding: 0 0 72px;
  color: var(--start-text);
  background: #d9e2d8;
  overflow-x: clip;
}

:global(html.dark) .start-page {
  --start-panel: color-mix(in srgb, var(--bg-secondary, #1e293b) 94%, transparent);
  --start-panel-solid: var(--bg-secondary, #1e293b);
  --start-text: var(--text-main, #f1f5f9);
  --start-muted: var(--text-secondary, #cbd5e1);
  --start-soft: color-mix(in srgb, var(--bg-color, #0f172a) 55%, var(--bg-secondary, #1e293b));
  --start-border: var(--nav-border, #334155);
  --start-shadow: 0 28px 100px rgba(0, 0, 0, 0.34);
  --start-line: color-mix(in srgb, var(--nav-border, #334155) 70%, transparent);
  --start-accent: #00c58e;
  --start-accent-2: var(--accent-color, #60a5fa);
  --start-danger: #f87171;
  --start-hero-text: rgba(255, 255, 255, 0.97);
  --start-hero-muted: rgba(255, 255, 255, 0.86);
  --start-readable-shadow:
    0 1px 2px rgba(0, 0, 0, 0.62),
    0 0 1px rgba(0, 0, 0, 0.42),
    0 10px 34px rgba(0, 0, 0, 0.46);
  background: var(--bg-color, #0f172a);
}

:global(body.start-page-active .main-header),
:global(body.start-page-active .main-footer) {
  display: none;
}

:global(body.start-page-active .app-layout) {
  padding: 0;
}

:global(body.start-page-active .page-body) {
  min-height: 100vh;
}

.photo-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -3;
  background-image: var(--start-photo);
  background-position: center;
  background-size: cover;
  transform: scale(1.02);
  filter: saturate(1.08) contrast(1.02);
  transition: background-image 0.6s ease;
}

:global(html.dark) .photo-layer {
  filter: saturate(1.08) contrast(1.02);
}

.start-page,
.start-page * {
  box-sizing: border-box;
  letter-spacing: 0;
}

.start-topbar {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 58px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.start-hero {
  position: relative;
  z-index: 5;
  padding: 44px 24px 46px;
  border-bottom: 1px solid var(--start-line);
}

.hero-inner {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  gap: 44px;
  align-items: end;
}

.brand-mark {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--start-border);
  border-radius: 14px;
  color: var(--start-text);
  text-decoration: none;
  background: color-mix(in srgb, var(--start-panel-solid) 72%, transparent);
  box-shadow: 0 12px 30px rgba(28, 45, 38, 0.08);
  backdrop-filter: blur(16px);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.brand-mark span {
  font-weight: 850;
  font-size: 0.88rem;
}

.brand-mark:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--start-accent) 55%, var(--start-border));
  box-shadow: 0 16px 34px rgba(28, 45, 38, 0.12);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(54px, 1fr));
  gap: 4px;
  min-height: 46px;
  padding: 4px;
  border: 1px solid var(--start-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--start-panel-solid) 70%, transparent);
  box-shadow: 0 12px 30px rgba(28, 45, 38, 0.08);
  backdrop-filter: blur(18px);
}

.mode-switch button {
  border: 0;
  border-radius: 12px;
  padding: 0 13px;
  color: var(--start-muted);
  background: transparent;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.mode-switch button:hover,
.mode-switch button.active {
  color: var(--start-text);
  background: color-mix(in srgb, var(--start-accent) 16%, var(--start-panel-solid));
}

.top-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(28, 45, 38, 0.08);
  backdrop-filter: blur(18px);
}

.hero-copy {
  padding-top: 58px;
  text-shadow: var(--start-readable-shadow);
}

.hero-kicker,
.stage-kicker,
.now-panel p,
.aside-head p {
  margin: 0;
  color: var(--start-muted);
  font-size: 0.78rem;
  font-weight: 760;
  text-transform: uppercase;
}

.hero-kicker {
  color: var(--start-hero-muted);
  font-size: 1.1rem;
  font-weight: 820;
}

.hero-title {
  margin: 8px 0 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 0.9;
}

.time-main {
  font-size: 6.15rem;
  font-weight: 520;
  color: var(--start-hero-text);
}

.time-second {
  margin-top: 10px;
  color: var(--start-hero-muted);
  font-size: 1.6rem;
  font-weight: 720;
}

.hero-greeting {
  max-width: 560px;
  margin: 0;
  color: var(--start-hero-muted);
  font-size: 1.08rem;
  line-height: 1.8;
}

.start-page.is-simple {
  min-height: 100vh;
  padding-bottom: 0;
}

.start-page.is-simple .start-hero {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  border-bottom: 0;
  padding: 28px 24px 90px;
}

.start-page.is-simple .hero-inner {
  grid-template-columns: minmax(0, 840px);
  justify-content: center;
  align-items: center;
  gap: 30px;
  text-align: center;
  transform: translateY(-104px);
}

.start-page.is-simple .hero-copy {
  justify-self: center;
  padding-top: 0;
}

.start-page.is-simple .hero-title {
  justify-content: center;
}

.start-page.is-simple .hero-greeting {
  margin: 0 auto;
}

.start-page.is-simple .search-console {
  width: min(840px, 100%);
  justify-self: center;
}

.start-page.is-simple .search-box {
  min-height: 86px;
  border-radius: 30px;
}

.start-page.is-simple .search-input {
  font-size: 1.12rem;
}

.search-console {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 72px;
  border: 1px solid var(--start-border);
  border-radius: 24px;
  padding: 9px 10px 9px 20px;
  background: var(--start-panel);
  box-shadow: var(--start-shadow);
  backdrop-filter: blur(22px);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, border-radius 0.2s ease;
}

.search-box.focused {
  border-color: color-mix(in srgb, var(--start-accent) 58%, var(--start-border));
  box-shadow: 0 26px 90px rgba(14, 165, 164, 0.18), var(--start-shadow);
  transform: translateY(-1px);
}

:global(html.dark) .search-box.focused {
  box-shadow: 0 26px 90px rgba(0, 0, 0, 0.58), var(--start-shadow);
}

.search-box.has-dropdown {
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
}

.start-page.is-simple .search-box.has-dropdown {
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
}

.engine-inline-button {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--start-border) 72%, transparent);
  border-radius: 15px;
  color: var(--start-text);
  background: color-mix(in srgb, var(--start-panel-solid) 80%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 18px rgba(28, 45, 38, 0.08);
  font: inherit;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.engine-inline-button:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--start-accent) 48%, var(--start-border));
  background: color-mix(in srgb, var(--start-accent) 10%, var(--start-panel-solid));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24), 0 12px 24px rgba(14, 165, 164, 0.12);
}

.engine-logo {
  width: 23px;
  height: 23px;
  display: block;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.search-input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  margin: 0 10px 0 14px;
  padding: 14px 0;
  color: var(--start-text);
  background: transparent;
  font: inherit;
  font-size: 1.02rem;
}

.search-input::placeholder {
  color: color-mix(in srgb, var(--start-muted) 72%, transparent);
}

.icon-button,
.search-submit {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--start-border);
  border-radius: 14px;
  color: var(--start-text);
  background: color-mix(in srgb, var(--start-panel-solid) 76%, transparent);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.icon-button svg,
.search-submit svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.icon-button:hover,
.search-submit:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--start-accent) 60%, var(--start-border));
  color: var(--start-accent);
}

.search-submit {
  color: var(--start-accent);
  border-color: transparent;
  background: transparent;
}

.search-submit:hover {
  color: #ffffff;
  background: linear-gradient(135deg, var(--start-accent), #36a86a);
}

:global(html.dark) .brand-mark,
:global(html.dark) .top-icon,
:global(html.dark) .engine-inline-button,
:global(html.dark) .icon-button,
:global(html.dark) .search-submit {
  background: var(--bg-color, #0f172a);
  border-color: var(--nav-border, #334155);
}

:global(html.dark) .mode-switch,
:global(html.dark) .search-box,
:global(html.dark) .history-popover,
:global(html.dark) .bookmark-link,
:global(html.dark) .aside-panel,
:global(html.dark) .section-title-input,
:global(html.dark) .edit-fields input {
  background: var(--bg-secondary, #1e293b);
  border-color: var(--nav-border, #334155);
}

:global(html.dark) .mode-switch button:hover,
:global(html.dark) .mode-switch button.active {
  color: var(--text-main, #f1f5f9);
  background: color-mix(in srgb, var(--accent-color, #60a5fa) 18%, var(--bg-color, #0f172a));
}

:global(html.dark) .search-submit {
  color: var(--start-text);
}

:global(html.dark) .search-submit:hover {
  color: #ffffff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--start-accent), #36a86a);
}

:global(html.dark) .edit-toggle.active {
  color: #ffffff;
  border-color: var(--start-accent);
  background: color-mix(in srgb, var(--start-accent) 28%, var(--bg-color, #0f172a));
}

.clear-button {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  color: var(--start-muted);
}

.history-popover {
  position: absolute;
  top: 76px;
  left: 0;
  right: 0;
  z-index: 20;
  overflow: hidden;
  border: 1px solid var(--start-border);
  border-radius: 22px;
  background: color-mix(in srgb, var(--start-panel-solid) 88%, transparent);
  box-shadow: 0 22px 60px rgba(28, 45, 38, 0.18);
  backdrop-filter: blur(22px);
}

.start-page.is-simple .history-popover {
  top: 90px;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 8px;
  color: var(--start-muted);
  font-size: 0.76rem;
  font-weight: 760;
}

.history-head button,
.aside-head button {
  border: 0;
  padding: 0;
  color: var(--start-muted);
  background: transparent;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 760;
  cursor: pointer;
}

.history-head button:hover,
.aside-head button:hover {
  color: var(--start-danger);
}

.history-list {
  max-height: 260px;
  overflow: auto;
  padding: 6px 8px 10px;
}

.history-item {
  width: 100%;
  min-height: 42px;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto 28px;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 12px;
  padding: 0 8px;
  color: var(--start-text);
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.history-item:hover,
.history-item.active {
  background: var(--start-soft);
}

.history-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--start-accent);
}

.history-dot.history {
  background: var(--start-accent-2);
}

.history-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.86rem;
}

.history-engine {
  color: var(--start-muted);
  font-size: 0.7rem;
  font-weight: 760;
}

.history-remove {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  padding: 0;
  color: var(--start-muted);
  background: transparent;
  cursor: pointer;
  opacity: 0;
}

.history-remove svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}

.history-item:hover .history-remove,
.history-item.active .history-remove {
  opacity: 1;
}

.history-remove:hover {
  color: var(--start-danger);
  background: color-mix(in srgb, var(--start-danger) 10%, transparent);
}

.suggest-loading {
  padding: 14px 18px 18px;
  color: var(--start-muted);
  font-size: 0.82rem;
  font-weight: 740;
}

.start-main {
  width: min(1180px, calc(100% - 48px));
  margin: 34px auto 0;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 28px;
  align-items: start;
}

.bookmark-stage {
  min-width: 0;
}

.stage-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.stage-head h2 {
  margin: 4px 0 0;
  font-size: 1.55rem;
  line-height: 1.2;
}

.stage-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-toggle.active {
  color: #ffffff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--start-accent), #36a86a);
}

.section-stack {
  display: grid;
  gap: 16px;
}

.link-section {
  position: relative;
  display: grid;
  grid-template-columns: 156px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--start-border);
  border-radius: 24px;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--section-accent) 12%, transparent), transparent 38%),
    color-mix(in srgb, var(--start-panel-solid) 78%, transparent);
  box-shadow: 0 14px 42px rgba(28, 45, 38, 0.08);
  backdrop-filter: blur(18px);
}

:global(html.dark) .link-section {
  background: var(--bg-secondary, #1e293b);
  border-color: var(--nav-border, #334155);
  box-shadow: var(--start-shadow);
}

.link-section::before {
  content: "";
  position: absolute;
  inset: 14px auto 14px 0;
  width: 4px;
  border-radius: 999px;
  background: var(--section-accent);
}

.section-head {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-left: 8px;
}

.section-number {
  width: 46px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--section-accent) 38%, var(--start-border));
  border-radius: 12px;
  color: var(--section-accent);
  background: color-mix(in srgb, var(--section-accent) 10%, transparent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8rem;
  font-weight: 800;
}

.section-title-wrap {
  min-width: 0;
}

.section-title-wrap h3 {
  margin: 0 0 4px;
  font-size: 1rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.section-title-wrap span {
  color: var(--start-muted);
  font-size: 0.78rem;
  font-weight: 720;
}

.section-title-input {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--start-border);
  border-radius: 12px;
  padding: 0 12px;
  color: var(--start-text);
  background: var(--start-panel);
  font: inherit;
  font-weight: 760;
  outline: 0;
}

.section-title-input:focus {
  border-color: color-mix(in srgb, var(--section-accent) 60%, var(--start-border));
}

.add-link {
  margin-top: auto;
}

.bookmark-grid {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.bookmark-link {
  position: relative;
  min-width: 0;
  min-height: 96px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--start-border);
  border-radius: 18px;
  padding: 13px;
  color: var(--start-text);
  background: color-mix(in srgb, var(--start-panel-solid) 72%, transparent);
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

a.bookmark-link:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--item-accent) 52%, var(--start-border));
  background: color-mix(in srgb, var(--item-accent) 8%, var(--start-panel-solid));
  box-shadow: 0 18px 36px rgba(28, 45, 38, 0.1);
}

:global(html.dark) a.bookmark-link:hover {
  background: color-mix(in srgb, var(--item-accent) 12%, var(--start-panel-solid));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.34);
}

.bookmark-avatar {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #ffffff;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--item-accent) 88%, #ffffff), var(--item-accent));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
  font-weight: 860;
  font-size: 0.94rem;
  overflow: hidden;
}

.bookmark-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.bookmark-copy strong,
.bookmark-copy span,
.bookmark-copy small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-copy strong {
  font-size: 0.94rem;
  line-height: 1.35;
}

.bookmark-copy span {
  color: var(--start-muted);
  font-size: 0.79rem;
}

.bookmark-copy small {
  color: color-mix(in srgb, var(--start-muted) 70%, transparent);
  font-size: 0.7rem;
  font-weight: 740;
}

.bookmark-key {
  min-width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--start-border);
  border-radius: 10px;
  color: var(--start-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.74rem;
  font-weight: 800;
}

.external-icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: color-mix(in srgb, var(--start-muted) 76%, transparent);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.edit-fields {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.edit-fields input {
  width: 100%;
  min-height: 34px;
  border: 1px solid var(--start-border);
  border-radius: 11px;
  padding: 0 10px;
  color: var(--start-text);
  background: var(--start-panel);
  font: inherit;
  font-size: 0.82rem;
  outline: 0;
}

.edit-fields input:focus {
  border-color: color-mix(in srgb, var(--item-accent) 58%, var(--start-border));
}

.remove-link:hover {
  color: var(--start-danger);
  border-color: color-mix(in srgb, var(--start-danger) 56%, var(--start-border));
}

.start-aside {
  position: sticky;
  top: 24px;
  display: grid;
  gap: 12px;
}

.aside-panel {
  border: 1px solid var(--start-border);
  border-radius: 22px;
  background: color-mix(in srgb, var(--start-panel-solid) 76%, transparent);
  box-shadow: 0 14px 42px rgba(28, 45, 38, 0.08);
  backdrop-filter: blur(18px);
}

.now-panel {
  display: grid;
  gap: 4px;
  padding: 18px;
}

.now-panel strong {
  font-size: 1.55rem;
  line-height: 1.2;
}

.now-panel span {
  color: var(--start-muted);
  font-size: 0.84rem;
  font-weight: 700;
}

.metrics-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 8px;
}

.metrics-panel div {
  min-width: 0;
  display: grid;
  justify-items: center;
  gap: 2px;
  padding: 12px 6px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--start-soft) 62%, transparent);
}

.metrics-panel strong {
  font-size: 1.18rem;
}

.metrics-panel span {
  color: var(--start-muted);
  font-size: 0.74rem;
  font-weight: 740;
}

.recent-panel {
  padding: 14px;
}

.aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.recent-item {
  width: 100%;
  min-height: 44px;
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  border: 0;
  border-radius: 14px;
  padding: 0 10px;
  color: var(--start-text);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.recent-item:hover {
  background: var(--start-soft);
}

.recent-item span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.84rem;
  font-weight: 760;
}

.recent-item small {
  color: var(--start-muted);
  font-size: 0.69rem;
  font-weight: 760;
}

.dropdown-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.dropdown-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.bookmark-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.bookmark-leave-active {
  position: absolute;
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.bookmark-enter-from,
.bookmark-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.detail-enter-active,
.detail-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.detail-enter-from,
.detail-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1100px) {
  .hero-inner,
  .start-main {
    grid-template-columns: 1fr;
  }

  .start-aside {
    position: static;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .recent-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 820px) {
  .start-page {
    padding-bottom: 52px;
  }

  .start-topbar {
    width: min(100% - 28px, 1180px);
    padding: 14px 50px 0 0;
  }

  .brand-mark,
  .top-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
  }

  .mode-switch {
    min-height: 42px;
    grid-template-columns: repeat(2, minmax(48px, 1fr));
  }

  .mode-switch button {
    padding: 0 9px;
    font-size: 0.78rem;
  }

  .start-hero {
    padding: 42px 18px 32px;
  }

  .start-page.is-simple .start-hero {
    min-height: calc(100vh - 58px);
    padding: 24px 18px 72px;
  }

  .hero-inner {
    gap: 28px;
  }

  .start-page.is-simple .hero-inner {
    transform: translateY(-76px);
  }

  .hero-copy {
    padding-top: 0;
  }

  .time-main {
    font-size: 4.3rem;
  }

  .time-second {
    font-size: 1.18rem;
  }

  .search-box {
    min-height: 64px;
    border-radius: 20px;
  }

  .start-page.is-simple .search-box {
    min-height: 74px;
    border-radius: 24px;
  }

  .history-popover,
  .start-page.is-simple .history-popover {
    top: 68px;
  }

  .start-page.is-simple .history-popover {
    top: 78px;
  }

  .start-main {
    width: min(100% - 28px, 1180px);
    margin-top: 24px;
  }

  .stage-head {
    align-items: flex-start;
  }

  .link-section {
    grid-template-columns: 1fr;
  }

  .section-head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    padding-left: 6px;
  }

  .add-link {
    margin-top: 0;
  }

  .bookmark-grid {
    grid-template-columns: 1fr;
  }

  .start-aside {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 540px) {
  .start-topbar {
    width: min(100% - 20px, 1180px);
    gap: 8px;
    padding-right: 48px;
  }

  .top-actions {
    gap: 6px;
  }

  .brand-mark,
  .top-icon {
    width: 40px;
    height: 40px;
  }

  .mode-switch {
    min-height: 40px;
    gap: 3px;
    padding: 3px;
  }

  .mode-switch button {
    padding: 0 7px;
    font-size: 0.74rem;
  }

  .hero-title {
    gap: 8px;
  }

  .start-page.is-simple .hero-inner {
    transform: translateY(-52px);
  }

  .hero-kicker {
    font-size: 0.98rem;
  }

  .time-main {
    font-size: 3.45rem;
  }

  .hero-greeting {
    font-size: 0.98rem;
  }

  .search-box {
    padding-left: 14px;
  }

  .search-input {
    margin-left: 10px;
    font-size: 0.92rem;
  }

  .engine-inline-button {
    width: 38px;
    height: 38px;
    border-radius: 13px;
  }

  .engine-logo {
    width: 21px;
    height: 21px;
  }

  .stage-head {
    flex-direction: column;
  }

  .stage-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .bookmark-link {
    grid-template-columns: 44px minmax(0, 1fr) auto;
    min-height: 90px;
  }

  .bookmark-avatar {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .external-icon {
    display: none;
  }

  .bookmark-key {
    display: none;
  }
}
</style>
