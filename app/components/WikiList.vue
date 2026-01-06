<template>
  <section>
    <!-- 搜索框 -->
    <div style="margin-bottom: 2rem;">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索 Wiki 标题..."
        style="
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        "
      />
    </div>

    <!-- 加载中 -->
    <div v-if="pending">正在扫描 Wiki...</div>

    <!-- 列表 -->
    <ul v-else-if="filteredWikis.length">
      <li
        v-for="wiki in filteredWikis"
        :key="wiki.path"
        style="margin-bottom: 16px; list-style: none;"
      >
        <NuxtLink
          :to="wiki.path"
          style="
            font-size: 1.1rem;
            font-weight: bold;
            text-decoration: none;
          "
        >
          {{ wiki.title || '无标题' }}
        </NuxtLink>

        <div style="font-size: 0.8rem; color: #888;">
          {{ wiki.date || wiki.updatedAt || '未标注日期' }}
        </div>

        <div v-if="wiki.category" style="font-size: 0.8rem; color: #888;">
          {{ wiki.category }}
        </div>
      </li>
    </ul>

    <!-- 空状态 -->
    <div v-else>
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
    .where('stem', 'LIKE', 'wiki/%') // 保留原来逻辑
    .all()
})

const searchQuery = ref('')

const filteredWikis = computed(() => {
  if (!wikis.value) return []

  let list = [...wikis.value]

  // 搜索标题
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(wiki => wiki.title?.toLowerCase().includes(q))
  }

  // 倒序（date 有的排前面，date 没有的靠后）
  list.sort((a, b) => {
    const da = a.date ? new Date(a.date) : new Date(0)
    const db = b.date ? new Date(b.date) : new Date(0)
    return db - da
  })

  // 限制数量（首页 limit 生效，搜索时不限制）
  if (!searchQuery.value.trim()) {
    list = list.slice(0, props.limit)
  }

  return list
})
</script>
