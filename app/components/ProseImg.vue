<template>
  <img 
    :src="src" 
    :alt="alt" 
    loading="lazy" 
    decoding="async"
    class="prose-img"
  />
</template>

<script setup lang="ts">
// 定义从 Markdown 传入的属性
defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.prose-img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1.5rem auto;
  border-radius: 8px;
}
</style>