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
      content: '东澈的博客文章列表，记录学习、开发与折腾过程。'
    }
  ]
})
</script>
