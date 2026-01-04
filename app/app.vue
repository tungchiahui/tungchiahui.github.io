<template>
  <div class="app-layout">
    <MainHeader />
    <main class="page-body">
      <NuxtPage />
    </main>
    <MainFooter />
  </div>
</template>

<script setup lang="ts">
import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'

// === 全局 Umami 脚本 ===
useHead({
  script: [
    {
      src: 'https://umami.tungchiahui.cn/script.js',
      'data-website-id': '88a069a8-ac00-4d45-8d5b-a4ed480e8cc3',
      defer: true
    }
  ]
})
</script>

<style src="~/assets/css/app.css"></style>
