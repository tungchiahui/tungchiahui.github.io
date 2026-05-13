<template>
  <div class="content-page">
    <h1>📚 博客列表</h1>
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
      content: '东澈的博客文章列表，记录学习、开发与折腾过程。'
    }
  ]
})
</script>
