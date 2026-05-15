<template>
  <section class="post-list" :class="{ 'is-compact': !showSearch }">
    <div v-if="showSearch" class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="ui.searchPostTitle"
        class="search-input"
      />
    </div>

    <div v-if="pending" class="loading">{{ ui.scanningFiles }}</div>

    <ul v-else-if="filteredPosts.length" class="post-items">
      <li v-for="post in filteredPosts" :key="post.path" class="post-item">
        <NuxtLink :to="post.path" class="post-link">
          {{ post.title || ui.untitled }}
        </NuxtLink>
        <div class="post-meta">
          {{ post.date || ui.noDate }}
          <span v-if="showTraffic">{{ getPostTrafficLabel(post).pageviews }}</span>
          <span v-if="showTraffic">{{ getPostTrafficLabel(post).visits }}</span>
        </div>
      </li>
    </ul>

    <div v-else class="empty-state">
      <p v-if="searchQuery">{{ formatUiText(ui.noPostMatch, { query: searchQuery }) }}</p>
      <p v-else>{{ ui.noPosts }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getCurrentLocaleSlug } from '~~/utils/i18n-locales'
import { formatUiText, getUiText } from '~~/utils/i18n-ui'

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
  }
})

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const ui = computed(() => getUiText(currentLocaleSlug.value))

const { data: posts, pending } = await useAsyncData('posts-list', () => {
  return queryCollection('content')
    .where('sourceStem', 'LIKE', 'posts/%')
    .select('path', 'title', 'date', 'localeSlug', 'i18nKey', 'sourcePath', 'legacyPath')
    .all()
})

const searchQuery = ref('')
const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())
const emptyStats = Object.freeze({
  pageviews: 0,
  visitors: 0,
  visits: 0,
  bounces: 0,
  totaltime: 0
})

const sortedPosts = computed(() => {
  if (!posts.value?.length) return []

  return posts.value
    .filter(post => post.localeSlug === currentLocaleSlug.value)
    .sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0)
      const db = b.date ? new Date(b.date) : new Date(0)
      return db - da
    })
})

const postPathsByI18nKey = computed(() => {
  const map = new Map()

  ;(posts.value || []).forEach((post) => {
    if (!post.i18nKey) return

    const paths = map.get(post.i18nKey) || []
    collectTrafficPaths(post).forEach((path) => {
      if (!paths.includes(path)) {
        paths.push(path)
      }
    })
    map.set(post.i18nKey, paths)
  })

  return map
})

const trackedPaths = computed(() => {
  if (!props.showTraffic) return []

  const paths = new Set()
  sortedPosts.value.forEach((post) => {
    const variantPaths = postPathsByI18nKey.value.get(post.i18nKey) || collectTrafficPaths(post)
    variantPaths.forEach(path => paths.add(normalizePath(path)))
  })
  return Array.from(paths)
})

const umamiDataKey = props.showTraffic ? 'posts-umami-paths-with-traffic' : 'posts-umami-paths-no-traffic'

const { data: umamiPathsData, pending: umamiPending } = useAsyncData(
  umamiDataKey,
  async () => {
    if (!props.showTraffic || !trackedPaths.value.length) {
      return { statsByPath: {} }
    }

    const pathMap = await fetchUmamiPathMetricsMapForPaths(trackedPaths.value, resolveUmamiRange())
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

const statsByPostKey = computed(() => {
  const result = {}

  sortedPosts.value.forEach((post) => {
    const paths = postPathsByI18nKey.value.get(post.i18nKey) || collectTrafficPaths(post)
    result[post.i18nKey] = sumUmamiRows(paths.map(path => statsByPath.value[normalizePath(path)] || emptyStats))
  })

  return result
})

const filteredPosts = computed(() => {
  const list = sortedPosts.value
  if (!list.length) return []

  if (!normalizedQuery.value) {
    return list.slice(0, props.limit)
  }

  return list.filter(post => post.title?.toLowerCase().includes(normalizedQuery.value))
})

function normalizePath(path) {
  return String(path || '/').replace(/\/$/, '') || '/'
}

function formatNumber(value) {
  return Math.max(0, Number(value || 0)).toLocaleString('zh-CN')
}

function getPostTrafficLabel(post) {
  const stats = statsByPostKey.value[post.i18nKey] || emptyStats
  const isLoading = umamiPending.value
  return {
    pageviews: isLoading && !stats.pageviews ? ui.value.pageviewsLoading : formatUiText(ui.value.totalPageviews, { value: formatNumber(stats.pageviews) }),
    visits: isLoading && !stats.visits ? ui.value.visitsLoading : formatUiText(ui.value.totalVisits, { value: formatNumber(stats.visits) })
  }
}

function collectTrafficPaths(post) {
  return Array.from(
    new Set([
      post.path,
      post.sourcePath,
      post.legacyPath
    ]
      .filter(Boolean)
      .map(normalizePath))
  )
}
</script>

<style scoped>
.post-list {
  --post-accent: #14b8a6;
  --post-accent-soft: color-mix(in srgb, var(--post-accent) 14%, transparent);
  --post-border: color-mix(in srgb, var(--nav-border, #dbe5ee) 82%, transparent);
  width: 100%;
}

.search-box {
  margin-bottom: 1rem;
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
  border-color: var(--post-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--post-accent) 18%, transparent);
}

.loading {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary, #666);
}

.post-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.post-item {
  padding: 12px 14px;
  border: 1px solid var(--post-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-color, #fff) 92%, #ecfeff);
  transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.post-item:hover {
  border-color: color-mix(in srgb, var(--post-accent) 48%, transparent);
  background: color-mix(in srgb, var(--post-accent) 10%, var(--bg-color, #fff));
  transform: translateY(-1px);
}

.post-link {
  font-size: 1.02rem;
  color: #0f766e;
  text-decoration: none;
  font-weight: 700;
  line-height: 1.4;
}

.post-link:hover {
  color: #115e59;
}

.post-meta {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  font-size: 0.78rem;
  color: var(--text-secondary, #888);
  line-height: 1.5;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary, #666);
}

.post-list.is-compact .post-items {
  gap: 8px;
}

.post-list.is-compact .post-item {
  padding: 10px 12px;
}

@media (max-width: 640px) {
  .post-item {
    padding: 10px 12px;
  }

  .post-link {
    font-size: 0.97rem;
  }
}
</style>
