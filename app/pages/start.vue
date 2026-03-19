<!-- app/pages/start.vue -->
<template>
  <div class="start-page">
    <div class="container">
      <!-- Clock -->
      <section class="hero">
        <div class="clock">
          <span class="clock-hm">{{ timeHM }}</span>
          <span class="clock-ss">:{{ timeSS }}</span>
        </div>
        <p class="date-line">{{ dateLine }}</p>
        <p class="greeting">{{ greeting }}</p>
      </section>

      <!-- Search -->
      <div class="search-area">
        <form class="search-wrap" @submit.prevent="doSearch" @keydown="onSearchKeydown">
          <div class="search-box" :class="{ focused: searchFocused, 'has-dropdown': showHistory && filteredHistory.length > 0 }">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref="searchInput"
              v-model="query"
              class="search-input"
              type="text"
              placeholder="搜索或输入网址..."
              autocomplete="off"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
            />
            <button v-if="query" class="clear-btn" type="button" @mousedown.prevent="query = ''">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button class="engine-btn" type="button" @click="cycleEngine">
              {{ engines[engineIdx].name }}
            </button>
          </div>

          <!-- History dropdown -->
          <Transition name="dropdown">
            <div v-if="showHistory && filteredHistory.length > 0" class="history-dropdown">
              <div class="history-header">
                <span class="history-label">搜索历史</span>
                <button class="history-clear" @mousedown.prevent="clearHistory">清除全部</button>
              </div>
              <div class="history-list">
                <div
                  v-for="(item, i) in filteredHistory"
                  :key="item.text"
                  class="history-item"
                  :class="{ active: historyIndex === i }"
                  @mousedown.prevent="selectHistory(item)"
                >
                  <svg class="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span class="history-text">{{ item.text }}</span>
                  <span class="history-engine">{{ item.engine }}</span>
                  <button class="history-remove" @mousedown.prevent.stop="removeHistory(item.text)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </form>

        <p class="hint">
          <kbd>/</kbd> 聚焦 · <kbd>↑↓</kbd> 历史 · <kbd>Tab</kbd> 切引擎 · <kbd>E</kbd> 编辑
        </p>
      </div>

      <!-- Bookmarks -->
      <section v-for="(section, si) in sections" :key="si" class="section">
        <div class="section-header">
          <span class="section-icon">{{ section.icon }}</span>
          <h2 class="section-title">{{ section.title }}</h2>
          <span class="section-count">{{ section.items.length }}</span>
          <button v-if="editing" class="add-item-btn" @click="addItem(si)">+ 添加</button>
        </div>

        <TransitionGroup name="card" tag="div" class="grid">
          <component
            :is="editing ? 'div' : 'a'"
            v-for="(item, ii) in section.items"
            :key="item.id"
            class="bookmark"
            :href="editing ? undefined : item.url"
            :target="editing ? undefined : '_blank'"
            :rel="editing ? undefined : 'noopener'"
          >
            <div class="bookmark-icon" :style="{ background: item.color || 'var(--accent-subtle, rgba(100,80,40,0.08))' }">
              {{ item.name.charAt(0) }}
            </div>

            <template v-if="!editing">
              <div class="bookmark-info">
                <div class="bookmark-name">{{ item.name }}</div>
                <div class="bookmark-desc">{{ item.desc }}</div>
              </div>
              <span v-if="item.key" class="bookmark-key">{{ item.key }}</span>
            </template>

            <template v-else>
              <div class="bookmark-edit-fields">
                <input v-model="item.name" class="edit-input" placeholder="名称" @change="persist" />
                <input v-model="item.desc" class="edit-input small" placeholder="描述" @change="persist" />
                <input v-model="item.url" class="edit-input small" placeholder="URL" @change="persist" />
              </div>
              <button class="remove-btn" @click.prevent="removeItem(si, ii)">✕</button>
            </template>
          </component>
        </TransitionGroup>
      </section>

      <!-- Edit bar -->
      <div class="edit-bar">
        <button class="toggle-btn" :class="{ active: editing }" @click="editing = !editing">
          {{ editing ? '✓ 完成编辑' : '✎ 编辑书签' }}
        </button>
        <template v-if="editing">
          <button class="toggle-btn secondary" @click="addSection">+ 新分类</button>
          <button class="toggle-btn secondary" @click="resetDefaults">恢复默认</button>
        </template>
      </div>

      <footer class="footer">START PAGE</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===== Types =====
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
  icon: string
  items: BookmarkItem[]
}

interface HistoryEntry {
  text: string
  engine: string
  timestamp: number
}

// ===== Default bookmarks =====
const defaultSections: BookmarkSection[] = [
  {
    title: '日常工具',
    icon: '⚡',
    items: [
      { id: '1', name: 'Gmail',   desc: '邮件',      url: 'https://mail.google.com',   key: '1', color: 'rgba(234,67,53,0.1)' },
      { id: '2', name: 'GitHub',  desc: '代码托管',   url: 'https://github.com',        key: '2', color: 'rgba(110,84,148,0.1)' },
      { id: '3', name: 'Notion',  desc: '笔记协作',   url: 'https://notion.so',         key: '3', color: 'rgba(55,53,47,0.12)' },
      { id: '4', name: 'ChatGPT', desc: 'AI 助手',   url: 'https://chat.openai.com',   key: '4', color: 'rgba(16,163,127,0.1)' },
    ],
  },
  {
    title: '开发资源',
    icon: '🛠',
    items: [
      { id: '5', name: 'MDN',            desc: 'Web 文档',     url: 'https://developer.mozilla.org', color: 'rgba(33,150,243,0.08)' },
      { id: '6', name: 'Stack Overflow',  desc: '问答社区',     url: 'https://stackoverflow.com',     color: 'rgba(244,128,36,0.08)' },
      { id: '7', name: 'Can I Use',       desc: '兼容性查询',   url: 'https://caniuse.com',           color: 'rgba(139,195,74,0.08)' },
      { id: '8', name: 'CodePen',         desc: '前端实验场',   url: 'https://codepen.io',            color: 'rgba(14,190,156,0.08)' },
    ],
  },
  {
    title: '阅读与灵感',
    icon: '📖',
    items: [
      { id: '9',  name: 'Hacker News',  desc: '技术热榜',    url: 'https://news.ycombinator.com',  color: 'rgba(255,102,0,0.08)' },
      { id: '10', name: 'Product Hunt', desc: '新产品发现',  url: 'https://www.producthunt.com',   color: 'rgba(218,56,50,0.08)' },
      { id: '11', name: 'V2EX',         desc: '创意社区',    url: 'https://www.v2ex.com',          color: 'rgba(48,142,218,0.08)' },
      { id: '12', name: '知乎',         desc: '知识问答',    url: 'https://www.zhihu.com',         color: 'rgba(0,132,255,0.08)' },
    ],
  },
  {
    title: '媒体与娱乐',
    icon: '🎵',
    items: [
      { id: '13', name: 'YouTube',  desc: '视频',    url: 'https://www.youtube.com',   color: 'rgba(255,0,0,0.08)' },
      { id: '14', name: 'Bilibili', desc: '弹幕视频', url: 'https://www.bilibili.com', color: 'rgba(0,174,236,0.08)' },
      { id: '15', name: 'Spotify',  desc: '音乐',    url: 'https://open.spotify.com',  color: 'rgba(30,215,96,0.08)' },
      { id: '16', name: '豆瓣',     desc: '书影音',   url: 'https://www.douban.com',    color: 'rgba(0,119,61,0.08)' },
    ],
  },
]

// ===== Engines =====
const engines = [
  { name: 'Google',   url: 'https://www.google.com/search?q=' },
  { name: 'Bing',     url: 'https://www.bing.com/search?q=' },
  { name: 'DuckDuck', url: 'https://duckduckgo.com/?q=' },
  { name: '百度',     url: 'https://www.baidu.com/s?wd=' },
]

// ===== Storage keys =====
const BOOKMARK_KEY = 'start-page-bookmarks'
const HISTORY_KEY  = 'start-page-history'
const ENGINE_KEY   = 'start-page-engine'
const MAX_HISTORY  = 20

// ===== State =====
const query = ref('')
const searchFocused = ref(false)
const engineIdx = ref(0)
const editing = ref(false)
const showHistory = ref(false)
const historyIndex = ref(-1)
const searchInput = ref<HTMLInputElement | null>(null)

// Clock
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

const timeHM = computed(() => {
  const h = String(now.value.getHours()).padStart(2, '0')
  const m = String(now.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})

const timeSS = computed(() => String(now.value.getSeconds()).padStart(2, '0'))

const dateLine = computed(() => {
  const d = now.value
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}  星期${days[d.getDay()]}`
})

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h >= 6 && h < 9) return '早上好，新的一天开始了'
  if (h >= 9 && h < 12) return '上午好，专注当下'
  if (h >= 12 && h < 14) return '中午好，该吃饭了'
  if (h >= 14 && h < 18) return '下午好，继续加油'
  if (h >= 18 && h < 21) return '晚上好，放松一下'
  return '夜深了，注意休息'
})

// ===== Search History =====
const history = ref<HistoryEntry[]>([])

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
  // Deduplicate and move to top
  history.value = history.value.filter(h => h.text !== text)
  history.value.unshift({
    text,
    engine: engines[engineIdx.value].name,
    timestamp: Date.now(),
  })
  if (history.value.length > MAX_HISTORY) {
    history.value = history.value.slice(0, MAX_HISTORY)
  }
  saveHistory()
}

function removeHistory(text: string) {
  history.value = history.value.filter(h => h.text !== text)
  saveHistory()
}

function clearHistory() {
  history.value = []
  saveHistory()
  showHistory.value = false
}

// Filtered history based on query
const filteredHistory = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return history.value
  return history.value.filter(h => h.text.toLowerCase().includes(q))
})

function selectHistory(item: HistoryEntry) {
  query.value = item.text
  showHistory.value = false
  doSearch()
}

// ===== Search =====
function cycleEngine() {
  engineIdx.value = (engineIdx.value + 1) % engines.length
  if (import.meta.client) {
    localStorage.setItem(ENGINE_KEY, String(engineIdx.value))
  }
}

function doSearch() {
  const q = query.value.trim()
  if (!q) return
  addToHistory(q)
  showHistory.value = false
  if (/^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(q)) {
    const url = q.startsWith('http') ? q : `https://${q}`
    window.open(url, '_self')
  } else {
    window.open(engines[engineIdx.value].url + encodeURIComponent(q), '_self')
  }
}

// ===== Search input events =====
function onSearchFocus() {
  searchFocused.value = true
  showHistory.value = true
  historyIndex.value = -1
}

function onSearchBlur() {
  // Small delay so mousedown on history items fires first
  setTimeout(() => {
    searchFocused.value = false
    showHistory.value = false
    historyIndex.value = -1
  }, 200)
}

function onSearchKeydown(e: KeyboardEvent) {
  if (!showHistory.value || filteredHistory.value.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    historyIndex.value = Math.min(historyIndex.value + 1, filteredHistory.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex.value <= 0) {
      historyIndex.value = -1
      query.value = ''
    } else {
      historyIndex.value--
    }
  } else if (e.key === 'Enter' && historyIndex.value >= 0) {
    e.preventDefault()
    query.value = filteredHistory.value[historyIndex.value].text
    historyIndex.value = -1
    doSearch()
  } else if (e.key === 'Escape') {
    showHistory.value = false
    historyIndex.value = -1
    searchInput.value?.blur()
  }
}

// ===== Bookmarks (persisted) =====
function loadSections(): BookmarkSection[] {
  if (import.meta.server) return defaultSections
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultSections
}

const sections = ref<BookmarkSection[]>(loadSections())

function persist() {
  if (import.meta.client) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(sections.value))
  }
}

function addItem(si: number) {
  sections.value[si].items.push({
    id: crypto.randomUUID(),
    name: '新书签',
    desc: '描述',
    url: 'https://',
  })
  persist()
}

function removeItem(si: number, ii: number) {
  sections.value[si].items.splice(ii, 1)
  if (sections.value[si].items.length === 0) sections.value.splice(si, 1)
  persist()
}

function addSection() {
  sections.value.push({ title: '新分类', icon: '📁', items: [] })
  persist()
}

function resetDefaults() {
  sections.value = JSON.parse(JSON.stringify(defaultSections))
  persist()
}

// ===== Keyboard shortcuts =====
function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName
  const isInput = tag === 'INPUT' || tag === 'TEXTAREA'

  if (e.key === '/' && !isInput) {
    e.preventDefault()
    searchInput.value?.focus()
  }
  if (e.key === 'Tab' && !isInput) {
    e.preventDefault()
    cycleEngine()
  }
  if (e.key === 'e' && !isInput && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    editing.value = !editing.value
  }
  if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const match = sections.value.flatMap(s => s.items).find(item => item.key === e.key)
    if (match) {
      e.preventDefault()
      window.open(match.url, '_blank')
    }
  }
}

// ===== Lifecycle =====
onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 1000)
  document.addEventListener('keydown', handleKeydown)
  loadHistory()
  try {
    const saved = localStorage.getItem(ENGINE_KEY)
    if (saved) engineIdx.value = Number(saved)
  } catch {}
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('keydown', handleKeydown)
})

definePageMeta({ layout: false })
</script>

<style scoped>
/* ===== Layout — no hardcoded colors, inherit from global theme ===== */
.start-page {
  min-height: 100vh;
  padding: 48px 24px 80px;
}

.container {
  max-width: 920px;
  margin: 0 auto;
}

/* ===== HERO ===== */
.hero {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeDown 0.7s ease;
}

.clock {
  font-family: 'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
  font-size: 5rem;
  font-weight: 300;
  letter-spacing: -2px;
  line-height: 1;
  margin-bottom: 6px;
  color: var(--color-text-base, var(--foreground, currentColor));
}

.clock-ss {
  font-size: 1.6rem;
  opacity: 0.35;
  vertical-align: super;
  margin-left: 2px;
}

.date-line {
  font-size: 0.95rem;
  font-weight: 300;
  opacity: 0.5;
  letter-spacing: 0.12em;
}

.greeting {
  font-size: 0.85rem;
  opacity: 0.35;
  margin-top: 6px;
  font-weight: 300;
}

/* ===== SEARCH AREA ===== */
.search-area {
  max-width: 600px;
  margin: 0 auto 48px;
  animation: fadeUp 0.6s ease 0.1s both;
}

.search-wrap {
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-radius: 14px;
  padding: 6px 6px 6px 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-bg-elevated, var(--card, var(--surface, rgba(128, 128, 128, 0.04))));
  backdrop-filter: blur(12px);
}

.search-box.focused {
  border-color: var(--color-primary, var(--primary, rgba(100, 80, 40, 0.4)));
  box-shadow:
    0 0 0 3px var(--color-primary-alpha, var(--primary-alpha, rgba(100, 80, 40, 0.08))),
    0 8px 32px rgba(0, 0, 0, 0.08);
}

.search-box.has-dropdown {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.search-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  opacity: 0.35;
  flex-shrink: 0;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.92rem;
  font-family: inherit;
  padding: 10px 0;
  color: inherit;
  min-width: 0;
}

.search-input::placeholder {
  opacity: 0.35;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
  flex-shrink: 0;
  color: inherit;
  padding: 0;
}

.clear-btn svg {
  width: 14px;
  height: 14px;
}

.clear-btn:hover {
  opacity: 0.7;
}

.engine-btn {
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-radius: 10px;
  font-size: 0.7rem;
  font-family: 'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
  padding: 7px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 4px;
  opacity: 0.6;
  background: none;
  color: inherit;
}

.engine-btn:hover {
  opacity: 1;
  border-color: var(--color-primary, var(--primary, rgba(100, 80, 40, 0.5)));
}

/* ===== HISTORY DROPDOWN ===== */
.history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-top: none;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  background: var(--color-bg-elevated, var(--card, var(--surface, rgba(128, 128, 128, 0.04))));
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 6px;
}

.history-label {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.4;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.history-clear {
  font-size: 0.68rem;
  opacity: 0.35;
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  color: inherit;
  transition: opacity 0.2s;
  padding: 0;
}

.history-clear:hover {
  opacity: 0.8;
}

.history-list {
  max-height: 260px;
  overflow-y: auto;
  padding: 4px 8px 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.history-item:hover,
.history-item.active {
  background: var(--color-bg-muted, var(--muted, rgba(128, 128, 128, 0.08)));
}

.history-icon {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  opacity: 0.25;
  flex-shrink: 0;
}

.history-text {
  flex: 1;
  font-size: 0.82rem;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-engine {
  font-size: 0.62rem;
  font-family: 'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
  opacity: 0.3;
  flex-shrink: 0;
}

.history-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  color: inherit;
  padding: 0;
}

.history-remove svg {
  width: 11px;
  height: 11px;
}

.history-item:hover .history-remove {
  opacity: 0.35;
}

.history-remove:hover {
  opacity: 0.8 !important;
}

/* Dropdown animation */
.dropdown-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ===== HINT ===== */
.hint {
  font-size: 0.68rem;
  opacity: 0.3;
  text-align: center;
  margin-top: 12px;
  font-family: 'DM Mono', 'JetBrains Mono', ui-monospace, monospace;
}

.hint kbd {
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.62rem;
  opacity: 0.8;
}

/* ===== SECTIONS ===== */
.section {
  margin-bottom: 32px;
  animation: fadeUp 0.6s ease both;
}

.section:nth-child(2) { animation-delay: 0.1s; }
.section:nth-child(3) { animation-delay: 0.2s; }
.section:nth-child(4) { animation-delay: 0.3s; }

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.15)));
}

.section-icon {
  font-size: 0.9rem;
  opacity: 0.6;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  opacity: 0.6;
}

.section-count {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  opacity: 0.25;
  margin-left: auto;
}

.add-item-btn {
  border: 1px dashed var(--color-border, var(--border, rgba(128, 128, 128, 0.3)));
  border-radius: 6px;
  font-size: 0.68rem;
  font-family: 'DM Mono', ui-monospace, monospace;
  padding: 3px 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: none;
  color: inherit;
  opacity: 0.5;
}

.add-item-btn:hover {
  opacity: 1;
  border-style: solid;
}

/* ===== GRID ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

/* ===== BOOKMARK CARD ===== */
.bookmark {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  cursor: pointer;
}

a.bookmark:hover {
  background: var(--color-bg-muted, var(--muted, rgba(128, 128, 128, 0.06)));
  border-color: var(--color-border, var(--border, rgba(128, 128, 128, 0.15)));
  transform: translateY(-1px);
}

a.bookmark:active {
  transform: translateY(0);
}

.bookmark-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  font-weight: 500;
  opacity: 0.7;
}

.bookmark-info {
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.bookmark-name {
  font-size: 0.82rem;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-desc {
  font-size: 0.68rem;
  opacity: 0.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.bookmark-key {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  opacity: 0.25;
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-radius: 4px;
  padding: 2px 5px;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

a.bookmark:hover .bookmark-key {
  opacity: 0.5;
}

/* ===== EDIT MODE ===== */
.bookmark-edit-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.edit-input {
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-radius: 5px;
  font-size: 0.78rem;
  font-family: inherit;
  padding: 4px 8px;
  outline: none;
  transition: border-color 0.2s;
  background: none;
  color: inherit;
}

.edit-input:focus {
  border-color: var(--color-primary, var(--primary, rgba(100, 80, 40, 0.5)));
}

.edit-input.small {
  font-size: 0.68rem;
  opacity: 0.6;
}

.remove-btn {
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-radius: 6px;
  font-size: 0.72rem;
  padding: 5px 7px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  background: none;
  color: inherit;
  opacity: 0.4;
}

.remove-btn:hover {
  opacity: 1;
  border-color: rgba(200, 60, 60, 0.5);
  color: rgb(200, 60, 60);
}

/* ===== EDIT BAR ===== */
.edit-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
}

.toggle-btn {
  border: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.2)));
  border-radius: 10px;
  font-size: 0.75rem;
  font-family: 'DM Mono', ui-monospace, monospace;
  padding: 9px 18px;
  cursor: pointer;
  transition: all 0.2s;
  background: none;
  color: inherit;
  opacity: 0.5;
}

.toggle-btn:hover {
  opacity: 0.9;
  border-color: var(--color-primary, var(--primary, rgba(100, 80, 40, 0.5)));
}

.toggle-btn.active {
  opacity: 0.9;
  background: var(--color-primary-alpha, var(--primary-alpha, rgba(100, 80, 40, 0.08)));
  border-color: var(--color-primary, var(--primary, rgba(100, 80, 40, 0.4)));
}

.toggle-btn.secondary {
  font-size: 0.7rem;
  padding: 7px 12px;
  opacity: 0.35;
}

.toggle-btn.secondary:hover {
  opacity: 0.7;
}

/* ===== FOOTER ===== */
.footer {
  text-align: center;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, var(--border, rgba(128, 128, 128, 0.1)));
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  opacity: 0.2;
  letter-spacing: 0.15em;
}

/* ===== TRANSITIONS ===== */
.card-enter-active { transition: all 0.25s ease; }
.card-leave-active { transition: all 0.15s ease; }
.card-enter-from { opacity: 0; transform: scale(0.96); }
.card-leave-to { opacity: 0; transform: scale(0.96); }

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .start-page { padding: 32px 16px 60px; }
  .clock { font-size: 3.2rem; }
  .clock-ss { font-size: 1.1rem; }
  .grid { grid-template-columns: 1fr; }
  .edit-bar { flex-wrap: wrap; }
}
</style>
