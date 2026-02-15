<template>
  <section class="post-list">
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索文章标题..."
        class="search-input"
      />
    </div>

    <div v-if="pending" class="loading">正在扫描文件...</div>

    <ul v-else-if="filteredPosts.length" class="post-items">
      <li
        v-for="post in filteredPosts"
        :key="post.path"
        class="post-item"
      >
        <NuxtLink
          :to="post.path"
          class="post-link"
        >
          {{ post.title || '无标题' }}
        </NuxtLink>

        <div class="post-date">
          {{ post.date || '未标注日期' }}
        </div>
      </li>
    </ul>

    <div v-else class="empty-state">
      <p v-if="searchQuery">没有找到包含 "{{ searchQuery }}" 的文章</p>
      <p v-else>仓库中似乎还没有文章...</p>
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

const { data: posts, pending } = await useAsyncData('posts-list', () => {
  return queryCollection('content')
    .where('stem', 'LIKE', 'posts/%')
    .all()
})

const searchQuery = ref('')

const filteredPosts = computed(() => {
  if (!posts.value) return []

  let list = [...posts.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(post => post.title?.toLowerCase().includes(q))
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
.post-list {
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
  background: #fff;
  color: #333;
}

.search-input:focus {
  outline: none;
  border-color: #42b883;
}

:global(html.dark) .search-input {
  background: #2d2d2d;
  border-color: #374151;
  color: #ffffff;
}

:global(html.dark) .search-input::placeholder {
  color: #9ca3af;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

:global(html.dark) .loading {
  color: #e5e7eb;
}

.post-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  margin-bottom: 20px;
}

.post-link {
  font-size: 1.2rem;
  color: #42b883;
  text-decoration: none;
  font-weight: bold;
}

.post-link:hover {
  color: #369870;
}

:global(html.dark) .post-link {
  color: #00c58e;
}

:global(html.dark) .post-link:hover {
  color: #34d399;
}

.post-date {
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
}

:global(html.dark) .post-date {
  color: #9ca3af;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

:global(html.dark) .empty-state {
  color: #e5e7eb;
}
</style>