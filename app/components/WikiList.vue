<template>
  <section class="wiki-list" :class="{ 'is-compact': !showSearch }">
    <div v-if="showSearch" class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="ui.searchWiki"
        class="search-input"
      />
    </div>

    <div v-if="pending" class="loading">{{ ui.scanningWiki }}</div>

    <div v-else-if="filteredDocGroups.length" class="wiki-content">
      <div class="wiki-doc-list">
        <article v-for="doc in filteredDocGroups" :key="doc.key" class="wiki-doc-card">
          <header class="wiki-doc-header">
            <div class="wiki-doc-title-block">
              <NuxtLink :to="doc.path" class="wiki-doc-title">
                {{ doc.title }}
              </NuxtLink>
              <div class="wiki-doc-meta">
                <span>{{ doc.date || ui.noDate }}</span>
                <span>{{ formatUiText(ui.chapterCount, { count: doc.chapters.length }) }}</span>
                <span v-if="showTraffic">{{ getDocTrafficLabel(doc).pageviews }}</span>
                <span v-if="showTraffic">{{ getDocTrafficLabel(doc).visits }}</span>
              </div>
            </div>

            <button
              v-if="showChapters && showToggle && doc.chapters.length"
              class="wiki-doc-toggle"
              type="button"
              :aria-expanded="isDocExpanded(doc)"
              @click="toggleDoc(doc.key)"
            >
              {{ isDocExpanded(doc) ? ui.collapse : ui.expand }}
            </button>
          </header>

          <ol v-if="showChapters && doc.chapters.length && isDocExpanded(doc)" class="wiki-chapter-list">
            <li
              v-for="chapter in doc.chapters"
              :key="chapter.path"
              class="wiki-chapter-item"
              :style="{ '--chapter-depth': String(chapter.depth) }"
            >
              <NuxtLink :to="chapter.path" class="wiki-chapter-link">
                <span v-if="chapter.chapter" class="wiki-chapter-number">{{ chapter.chapter }}</span>
                <span class="wiki-chapter-title">{{ chapter.title || ui.untitled }}</span>
                <span v-if="showTraffic" class="wiki-chapter-stats">{{ getChapterTrafficLabel(chapter) }}</span>
              </NuxtLink>
            </li>
          </ol>
        </article>
      </div>
    </div>

    <div v-else class="empty-state">
      <p v-if="normalizedQuery">{{ ui.noWikiMatch }}</p>
      <p v-else>{{ ui.noWiki }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getCurrentLocaleSlug } from '~~/utils/i18n-locales'
import { formatUiText, getUiText } from '~~/utils/i18n-ui'
import { compareWikiChapters, numberWikiChapters } from '~~/utils/wiki-chapters'
import { getWikiLegacyPathAliases } from '~~/utils/wiki-legacy-paths'

const props = defineProps({
  limit: {
    type: Number,
    default: Infinity
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showTraffic: {
    type: Boolean,
    default: true
  },
  showChapters: {
    type: Boolean,
    default: true
  },
  showToggle: {
    type: Boolean,
    default: true
  }
})

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const ui = computed(() => getUiText(currentLocaleSlug.value))

const { data: wikis, pending } = await useAsyncData('wiki-list', () => {
  return queryCollection('content')
    .where('sourceStem', 'LIKE', 'wiki/%')
    .select(
      'path',
      'stem',
      'title',
      'date',
      'localeSlug',
      'i18nKey',
      'sourcePath',
      'legacyPath',
      'chapterOrder',
      'chapterDepth',
      'docKey',
      'docI18nKey',
      'docRoot',
      'docTitle',
      'isWikiDoc',
      'isWikiIndex'
    )
    .all()
})

const searchQuery = ref('')
const normalizedQuery = computed(() => {
  if (!props.showSearch) return ''
  return searchQuery.value.trim().toLowerCase()
})
const expandedDocs = ref(new Set())

const emptyStats = Object.freeze({
  pageviews: 0,
  visitors: 0,
  visits: 0,
  bounces: 0,
  totaltime: 0
})

const allWikiPages = computed(() => wikis.value || [])
const wikiPages = computed(() =>
  allWikiPages.value.filter(wiki => wiki.localeSlug === currentLocaleSlug.value)
)

const pathsByI18nKey = computed(() => {
  const map = new Map()

  allWikiPages.value.forEach((wiki) => {
    if (!wiki.i18nKey) return

    const paths = map.get(wiki.i18nKey) || []
    collectTrafficPaths(wiki).forEach((path) => {
      if (!paths.includes(path)) {
        paths.push(path)
      }
    })
    map.set(wiki.i18nKey, paths)
  })

  return map
})

const pathsByDocI18nKey = computed(() => {
  const map = new Map()

  allWikiPages.value
    .filter(wiki => wiki.isWikiDoc && wiki.docI18nKey)
    .forEach((wiki) => {
      const paths = map.get(wiki.docI18nKey) || []
      collectTrafficPaths(wiki).forEach((path) => {
        if (!paths.includes(path)) {
          paths.push(path)
        }
      })
      map.set(wiki.docI18nKey, paths)
    })

  return map
})

const trackedPaths = computed(() => {
  if (!props.showTraffic) return []

  const paths = new Set()

  wikiPages.value
    .filter(wiki => wiki.isWikiDoc && wiki.path)
    .forEach((wiki) => {
      const variants = pathsByI18nKey.value.get(wiki.i18nKey) || collectTrafficPaths(wiki)
      variants.forEach(path => paths.add(normalizePath(path)))
    })

  return Array.from(paths)
})

const { data: umamiPathsData, pending: umamiPending } = useAsyncData(
  'wiki-umami-paths',
  async () => {
    if (!props.showTraffic || !trackedPaths.value.length) {
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
    watch: [trackedPaths, () => props.showTraffic]
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
          docI18nKey: wiki.docI18nKey,
          title: wiki.docTitle || ui.value.wikiDoc,
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
        ...wiki
      })
    })

  return Array.from(groups.values())
    .map(group => ({
      ...group,
      chapters: numberWikiChapters(group.chapters)
        .sort(compareWikiChapters)
        .map(chapter => ({
          ...chapter,
          depth: chapter.chapterDepth
        }))
    }))
    .sort((a, b) => (b.index?.date || '').localeCompare(a.index?.date || '') || a.title.localeCompare(b.title))
})

const docTrafficByKey = computed(() => {
  if (!props.showTraffic) return {}

  const result = {}

  docGroups.value.forEach((doc) => {
    const uniquePaths = new Set([
      ...(pathsByDocI18nKey.value.get(doc.docI18nKey) || [doc.path, ...doc.chapters.map(chapter => chapter.path)])
    ].map(normalizePath))

    result[doc.key] = sumUmamiRows(Array.from(uniquePaths).map(path => getPathStats(path)))
  })

  return result
})

const filteredDocGroups = computed(() => {
  let list = docGroups.value

  if (normalizedQuery.value) {
    const q = normalizedQuery.value
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

  if (!normalizedQuery.value) {
    list = list.slice(0, props.limit)
  }

  return list
})

function normalizePath(path) {
  return String(path || '/').replace(/\/$/, '') || '/'
}

function formatNumber(value) {
  return Math.max(0, Number(value || 0)).toLocaleString('zh-CN')
}

function getPathStats(path) {
  return statsByPath.value[normalizePath(path)] || emptyStats
}

function getChapterTrafficLabel(chapter) {
  const paths = pathsByI18nKey.value.get(chapter.i18nKey) || collectTrafficPaths(chapter)
  const stats = sumUmamiRows(paths.map(path => getPathStats(path)))
  const isLoading = umamiPending.value
  if (isLoading && !stats.pageviews && !stats.visits) {
    return ui.value.loading
  }

  return formatUiText(ui.value.trafficInline, {
    pageviews: formatNumber(stats.pageviews),
    visits: formatNumber(stats.visits)
  })
}

function getDocTrafficLabel(doc) {
  const total = docTrafficByKey.value[doc.key] || { pageviews: 0, visits: 0 }
  const isLoading = umamiPending.value

  return {
    pageviews: isLoading && !total.pageviews ? ui.value.pageviewsLoading : formatUiText(ui.value.totalPageviews, { value: formatNumber(total.pageviews) }),
    visits: isLoading && !total.visits ? ui.value.visitsLoading : formatUiText(ui.value.totalVisits, { value: formatNumber(total.visits) })
  }
}

function isDocExpanded(doc) {
  if (!props.showChapters) return false
  if (normalizedQuery.value) return true
  if (!props.showToggle) return true
  return expandedDocs.value.has(doc.key)
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

function collectTrafficPaths(item) {
  return Array.from(
    new Set([
      item.path,
      item.sourcePath,
      item.legacyPath,
      ...getWikiLegacyPathAliases(item.docI18nKey, item.isWikiIndex)
    ]
      .filter(Boolean)
      .map(normalizePath))
  )
}
</script>

<style scoped>
.wiki-list {
  --wiki-accent: #14b8a6;
  --wiki-accent-strong: #115e59;
  --wiki-accent-soft: color-mix(in srgb, var(--wiki-accent) 14%, transparent);
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
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--wiki-accent) 18%, transparent);
}

.wiki-content {
  display: block;
}

.wiki-doc-list {
  display: block;
}

.wiki-doc-card {
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-color, #fff) 92%, #ecfeff);
  transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.wiki-doc-card:hover {
  border-color: color-mix(in srgb, var(--wiki-accent) 46%, transparent);
  background: color-mix(in srgb, var(--wiki-accent) 9%, var(--bg-color, #fff));
  transform: translateY(-1px);
}

.wiki-doc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.wiki-doc-title-block {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.wiki-doc-title {
  color: #0f766e;
  font-size: 1.04rem;
  font-weight: 700;
  line-height: 1.35;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.wiki-doc-title:hover {
  color: var(--wiki-accent-strong);
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
  min-height: 30px;
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

.wiki-list.is-compact .wiki-doc-card {
  margin-bottom: 10px;
  padding: 12px;
}

.wiki-list.is-compact .wiki-doc-header {
  margin-bottom: 2px;
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
