<template>
  <div class="app-layout">
    <MainHeader />
    <main class="page-body" :class="$route.path === '/' ? 'home-page' : ''">
      <NuxtPage />
    </main>
    <MainFooter />

    <!-- 🎵 音乐播放器 -->
    <MusicPlayer />
  </div>
</template>

<script setup lang="ts">
import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
import MusicPlayer from './components/MusicPlayer.vue'
</script>
