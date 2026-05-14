<template>
  <div class="wiki-home-page">
    <header class="wiki-home-header">
      <h1>
        <i class="fas fa-book-open" aria-hidden="true"></i>
        <span>Wiki 知识库</span>
      </h1>
      <p>按教程和章节组织的技术文档。</p>
    </header>
    <WikiList />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'
import WikiList from '../../components/WikiList.vue'

useHead({
  title: 'Wiki 知识库',
  meta: [
    {
      name: 'description',
      content: '按教程和章节组织的技术文档与学习笔记。'
    }
  ]
})
</script>
