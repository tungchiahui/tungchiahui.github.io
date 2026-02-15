<template>
  <section class="wiki-list">
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索 Wiki 标题..."
        class="search-input"
      />
    </div>

    <div v-if="pending" class="loading">正在扫描 Wiki...</div>

    <ul v-else-if="filteredWikis.length" class="wiki-items">
      <li v-for="wiki in filteredWikis" :key="wiki.path" class="wiki-item">
        <NuxtLink :to="wiki.path" class="wiki-link">
          {{ wiki.title || '无标题' }}
        </NuxtLink>
        <div class="wiki-date">
          {{ wiki.date || wiki.updatedAt || '未标注日期' }}
        </div>
        <div v-if="wiki.category" class="wiki-category">
          {{ wiki.category }}
        </div>
      </li>
    </ul>

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
    .all()
})

const searchQuery = ref('')

const filteredWikis = computed(() => {
  if (!wikis.value) return []

  let list = [...wikis.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(wiki => wiki.title?.toLowerCase().includes(q))
  }

  list.sort((a, b) => {
    const da = a.date ? new Date(a.date) : new Date(0)
    const db = b.date ? new Date(b.date) : new Date(0)
    return db - da
  })

  if (!searchQuery.value.trim()) {
    list = list.slice(0, props.limit)
  }

  return list
})
</script>

<style scoped>
.wiki-list {
  width: 100%;
}

.search-box {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-color, #fff);
  color: var(--text-main, #333);
}

.search-input:focus {
  outline: none;
  border-color: #42b883;
}

:global(html.dark) .search-input {
  background: var(--bg-secondary, #2d2d2d);
  border-color: var(--nav-border, #374151);
  color: var(--text-main, #f1f5f9);
}

.loading {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary, #666);
}

.wiki-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.wiki-item {
  margin-bottom: 16px;
}

.wiki-link {
  font-size: 1.1rem;
  font-weight: bold;
  color: #42b883;
  text-decoration: none;
}

.wiki-link:hover {
  color: #369870;
}

:global(html.dark) .wiki-link {
  color: #00c58e;
}

.wiki-date,
.wiki-category {
  font-size: 0.8rem;
  color: var(--text-secondary, #888);
  margin-top: 4px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary, #666);
}
</style>