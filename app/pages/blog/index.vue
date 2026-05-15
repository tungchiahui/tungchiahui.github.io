<template>
  <div class="blog-page">
    <h1>
      <i class="fas fa-newspaper" aria-hidden="true"></i>
      <span>博客列表</span>
    </h1>
    <PostList />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'
import PostList from '~/components/PostList.vue'

useHead({
  title: '博客列表',
  meta: [
    {
      name: 'description',
      content: '東澈的博客文章列表，記錄學習、開發與折騰過程。'
    }
  ]
})
</script>
