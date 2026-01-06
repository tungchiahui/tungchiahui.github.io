<template>
  <div class="app-layout">
    <MainHeader />
    <main class="page-body" :class="$route.path === '/' ? 'home-page' : ''">
      <NuxtPage />
    </main>
    <MainFooter />

    <!-- 引入 Assets 组件来加载样式 -->
    <Assets />
    
    <!-- 🎵 音乐播放器 -->
    <MusicPlayer />
  </div>
</template>

<script setup lang="ts">
import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
import Assets from './components/Assets.vue'
import MusicPlayer from './components/MusicPlayer.vue'

useHead({
  script: [
    {
      src: 'https://umami.tungchiahui.cn/script.js',
      'data-website-id': '88a069a8-ac00-4d45-8d5b-a4ed480e8cc3',
      defer: true
    },
    {
      src: 'https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.js',
      // defer: true
    },
    {
      src: 'https://cdn.tungchiahui.cn/libs/meting/2.0.2/Meting.min.js',
      // defer: true
    }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.css'
    }
  ]
})
</script>

<style src="~/assets/css/app.css"></style>
