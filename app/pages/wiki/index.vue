<template>
  <div class="wiki-home-page">
    <header class="wiki-home-header">
      <h1>Wiki 知识库</h1>
      <p>按教程和章节组织的技术文档。</p>
    </header>
    <WikiList />
  </div>
</template>

<script setup lang="ts">
import WikiList from '../../components/WikiList.vue'
</script>

<style scoped>
.wiki-home-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "Noto Sans CJK SC",
    sans-serif;
}

.wiki-home-header {
  margin-bottom: 1.5rem;
}

.wiki-home-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  line-height: 1.2;
}

.wiki-home-header p {
  margin: 0;
  color: var(--text-secondary, #666);
}
</style>
