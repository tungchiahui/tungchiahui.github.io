<template>
  <section>
    <div style="margin-bottom: 2rem;">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索文章标题..." 
        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;"
      />
    </div>

    <div v-if="pending">正在扫描文件...</div>
    
    <ul v-else-if="filteredPosts && filteredPosts.length">
      <li v-for="post in filteredPosts" :key="post.path" style="margin-bottom: 20px; list-style: none;">
        <NuxtLink :to="post.path" style="font-size: 1.2rem; color: #42b883; text-decoration: none; font-weight: bold;">
          {{ post.title || '无标题' }}
        </NuxtLink>
        <div style="font-size: 0.8rem; color: #888;"> {{ post.date }}</div>
      </li>
    </ul>

    <div v-else>
      <p v-if="searchQuery">没有找到包含 "{{ searchQuery }}" 的文章</p>
      <p v-else>仓库中似乎还没有文章...</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

// 获取数据
const { data: posts, pending } = await useAsyncData('posts-list', () => {
  return queryCollection('content')
    // 关键：不再过滤 path，而是过滤 stem (物理路径) 包含 posts/ 的文件
    // 这样你在 md 里的 path 改成什么都不影响它被搜到
    .where('stem', 'LIKE', 'posts/%')
    .all()
})

const searchQuery = ref('')

const filteredPosts = computed(() => {
  if (!posts.value) return []
  if (!searchQuery.value.trim()) return posts.value

  const query = searchQuery.value.toLowerCase()
  return posts.value.filter(post => {
    return post.title?.toLowerCase().includes(query)
  })
})
</script>