<template>
  <section class="wiki-list">
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索 Wiki 或章节..."
        class="search-input"
      />
    </div>

    <div v-if="pending" class="loading">正在扫描 Wiki...</div>

    <div v-else-if="filteredDocGroups.length" class="wiki-content">
      <div class="wiki-doc-list">
        <article v-for="doc in filteredDocGroups" :key="doc.key" class="wiki-doc-card">
          <header class="wiki-doc-header">
            <div class="wiki-doc-title-block">
              <NuxtLink :to="doc.path" class="wiki-doc-title">
                {{ doc.title }}
              </NuxtLink>
              <div class="wiki-doc-meta">
                <span>{{ doc.date || '未标注日期' }}</span>
                <span>{{ doc.chapters.length }} 个章节</span>
                <span>{{ getDocTrafficLabel(doc).pageviews }}</span>
                <span>{{ getDocTrafficLabel(doc).visits }}</span>
              </div>
            </div>

            <button
              v-if="doc.chapters.length"
              class="wiki-doc-toggle"
              type="button"
              :aria-expanded="isDocExpanded(doc)"
              @click="toggleDoc(doc.key)"
            >
              {{ isDocExpanded(doc) ? '收起' : '展开' }}
            </button>
          </header>

          <ol v-if="doc.chapters.length && isDocExpanded(doc)" class="wiki-chapter-list">
            <li
              v-for="chapter in doc.chapters"
              :key="chapter.path"
              class="wiki-chapter-item"
              :style="{ '--chapter-depth': String(chapter.depth) }"
            >
              <NuxtLink :to="chapter.path" class="wiki-chapter-link">
                <span v-if="chapter.chapter" class="wiki-chapter-number">{{ chapter.chapter }}</span>
                <span class="wiki-chapter-title">{{ chapter.title || '无标题' }}</span>
                <span class="wiki-chapter-stats">{{ getChapterTrafficLabel(chapter.path) }}</span>
              </NuxtLink>
            </li>
          </ol>
        </article>
      </div>
    </div>

    <div v-else class="empty-state">
      <p v-if="searchQuery">没有找到相关 Wiki</p>
      <p v-else>Wiki 还没有内容</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  limit: {
    type: Number,
    default: Infinity
  }
})

const { data: wikis, pending } = await useAsyncData('wiki-list', () => {
  return queryCollection('content')
    .where('stem', 'LIKE', 'wiki/%')
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
    .all()
})

const searchQuery = ref('')
const expandedDocs = ref(new Set())

const emptyStats = Object.freeze({
  pageviews: 0,
  visitors: 0,
  visits: 0,
  bounces: 0,
  totaltime: 0
})

const wikiPages = computed(() => wikis.value || [])

const trackedPaths = computed(() => {
  const paths = new Set()

  wikiPages.value
    .filter(wiki => wiki.isWikiDoc && wiki.path)
    .forEach((wiki) => {
      paths.add(normalizePath(wiki.path))
    })

  return Array.from(paths)
})

const { data: umamiPathsData, pending: umamiPending } = await useAsyncData(
  'wiki-umami-paths',
  async () => {
    if (!trackedPaths.value.length) {
      return { statsByPath: {} }
    }

    const pathMap = await fetchUmamiPathMetricsMap(resolveUmamiRange())
    const statsByPath = Object.fromEntries(
      trackedPaths.value.map((path) => {
        const stats = pathMap.get(path) || emptyStats
        return [path, stats]
      })
    )

    return { statsByPath }
  },
  {
    server: false,
    default: () => ({ statsByPath: {} }),
    watch: [trackedPaths]
  }
)

const statsByPath = computed(() => umamiPathsData.value?.statsByPath || {})

const docGroups = computed(() => {
  const groups = new Map()

  wikiPages.value
    .filter(wiki => wiki.isWikiDoc)
    .forEach((wiki) => {
      const key = wiki.docKey || wiki.docRoot || wiki.stem
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          title: wiki.docTitle || 'Wiki 文档',
          path: wiki.docRoot || wiki.path,
          date: wiki.date,
          index: null,
          chapters: []
        })
      }

      const group = groups.get(key)
      if (wiki.date && (!group.date || wiki.date > group.date)) {
        group.date = wiki.date
      }

      if (wiki.isWikiIndex) {
        group.index = wiki
        group.title = wiki.title || group.title
        group.path = wiki.path || group.path
        group.date = wiki.date || group.date
        return
      }

      group.chapters.push({
        ...wiki,
        depth: Math.max(0, (wiki.chapter || '').split('.').length - 1)
      })
    })

  return Array.from(groups.values())
    .map(group => ({
      ...group,
      chapters: group.chapters.sort(sortByChapter)
    }))
    .sort((a, b) => (b.index?.date || '').localeCompare(a.index?.date || '') || a.title.localeCompare(b.title))
})

const docTrafficByKey = computed(() => {
  const result = {}

  docGroups.value.forEach((doc) => {
    const uniquePaths = new Set([
      normalizePath(doc.path),
      ...doc.chapters.map(chapter => normalizePath(chapter.path))
    ])

    const total = {
      pageviews: 0,
      visits: 0
    }

    uniquePaths.forEach((path) => {
      const stats = getPathStats(path)
      total.pageviews += stats.pageviews
      total.visits += stats.visits
    })

    result[doc.key] = total
  })

  return result
})

const filteredDocGroups = computed(() => {
  let list = docGroups.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list
      .map((doc) => {
        const docMatches = doc.title.toLowerCase().includes(q)

        return {
          ...doc,
          chapters: docMatches
            ? doc.chapters
            : doc.chapters.filter(chapter => matchesQuery(chapter, q))
        }
      })
      .filter(doc => doc.title.toLowerCase().includes(q) || doc.chapters.length)
  }

  if (!searchQuery.value.trim()) {
    list = list.slice(0, props.limit)
  }

  return list
})

function sortByChapter(a, b) {
  return (a.chapterSort || 0) - (b.chapterSort || 0) || a.title.localeCompare(b.title)
}

function normalizePath(path) {
  return String(path || '/').replace(/\/$/, '') || '/'
}

function formatNumber(value) {
  return Math.max(0, Number(value || 0)).toLocaleString('zh-CN')
}

function getPathStats(path) {
  return statsByPath.value[normalizePath(path)] || emptyStats
}

function getChapterTrafficLabel(path) {
  const stats = getPathStats(path)
  const isLoading = umamiPending.value
  if (isLoading && !stats.pageviews && !stats.visits) {
    return '加载中...'
  }

  return `${formatNumber(stats.pageviews)} 浏览 · ${formatNumber(stats.visits)} 访问`
}

function getDocTrafficLabel(doc) {
  const total = docTrafficByKey.value[doc.key] || { pageviews: 0, visits: 0 }
  const isLoading = umamiPending.value

  return {
    pageviews: isLoading && !total.pageviews ? '总浏览 加载中...' : `总浏览 ${formatNumber(total.pageviews)}`,
    visits: isLoading && !total.visits ? '总访问 加载中...' : `总访问 ${formatNumber(total.visits)}`
  }
}

function isDocExpanded(doc) {
  return Boolean(searchQuery.value.trim()) || expandedDocs.value.has(doc.key)
}

function toggleDoc(key) {
  const next = new Set(expandedDocs.value)

  if (next.has(key)) next.delete(key)
  else next.add(key)

  expandedDocs.value = next
}

function matchesQuery(wiki, query) {
  return [
    wiki.title,
    wiki.chapter,
    wiki.date,
    wiki.path
  ].some(value => String(value || '').toLowerCase().includes(query))
}
</script>

<style scoped>
.wiki-list {
  --wiki-accent: #00c58e;
  --wiki-accent-strong: #0a8f68;
  --wiki-accent-soft: rgba(0, 197, 142, 0.12);
  width: 100%;
}

.search-box {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-color, #fff);
  color: var(--text-main, #333);
}

.search-input:focus {
  outline: none;
  border-color: var(--wiki-accent);
}

:global(html.dark) .search-input {
  background: var(--bg-secondary, #2d2d2d);
  border-color: var(--nav-border, #374151);
  color: var(--text-main, #f1f5f9);
}

.wiki-content {
  display: block;
}

.wiki-doc-list {
  display: block;
}

.wiki-doc-card {
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--nav-border, #e5e7eb);
}

.wiki-doc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.wiki-doc-title-block {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.wiki-doc-title {
  color: #42b883;
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1.35;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.wiki-doc-title:hover {
  color: #369870;
}

:global(html.dark) .wiki-doc-title {
  color: #00c58e;
}

.wiki-doc-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  color: var(--text-secondary, #666);
  font-size: 0.8rem;
  line-height: 1.5;
}

.wiki-doc-toggle {
  flex: 0 0 auto;
  min-width: 56px;
  padding: 7px 10px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  color: var(--text-main, #1f1f1f);
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
}

.wiki-doc-toggle:hover,
.wiki-doc-toggle[aria-expanded="true"] {
  border-color: var(--wiki-accent);
  background: var(--wiki-accent-soft);
  color: var(--wiki-accent-strong);
}

.wiki-chapter-list {
  display: grid;
  gap: 4px;
  list-style: none;
  margin: 8px 0 0;
  padding: 10px 0 0;
  border-top: 1px dashed var(--nav-border, #e5e7eb);
}

.wiki-chapter-item {
  padding-left: calc(var(--chapter-depth, 0) * 18px);
}

.wiki-chapter-link {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: baseline;
  min-height: 32px;
  padding: 6px 8px;
  border-radius: 6px;
  color: var(--text-main, #333);
  text-decoration: none;
}

.wiki-chapter-link:hover {
  background: var(--wiki-accent-soft);
  color: var(--wiki-accent-strong);
}

.wiki-chapter-number {
  min-width: 2.2em;
  color: var(--wiki-accent);
  font-size: 0.86rem;
  font-weight: 800;
}

.wiki-chapter-title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.wiki-chapter-stats {
  color: var(--text-secondary, #666);
  font-size: 0.76rem;
  white-space: nowrap;
}

.loading {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary, #666);
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary, #666);
}

@media (max-width: 640px) {
  .wiki-doc-header {
    align-items: flex-start;
  }

  .wiki-doc-toggle {
    min-width: 52px;
    padding: 6px 9px;
  }
}
</style>
