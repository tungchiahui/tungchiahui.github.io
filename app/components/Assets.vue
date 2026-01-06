<!-- app/components/Assets.vue -->
<template>
  <div v-if="false"></div>
</template>

<script setup lang="ts">
useHead({
  script: [
    // Umami
    {
      src: 'https://umami.tungchiahui.cn/script.js',
      'data-website-id': '88a069a8-ac00-4d45-8d5b-a4ed480e8cc3',
      defer: true
    },
    // APlayer
    {
      src: 'https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.js',
      // defer: true
    },
    // Meting
    {
      src: 'https://cdn.tungchiahui.cn/libs/meting/2.0.2/Meting.min.js',
      // defer: true
    },
    // Font Awesome JS
    {
      src: 'https://cdn.tungchiahui.cn/libs/font-awesome/7.1.0/all.min.js',
      defer: true
    }
  ],
  link: [
    // APlayer CSS
    {
      rel: 'stylesheet',
      href: 'https://cdn.tungchiahui.cn/libs/aplayer/1.10.1/APlayer.min.css'
    },
    // Font Awesome CSS
    {
      rel: 'stylesheet',
      href: 'https://cdn.tungchiahui.cn/libs/font-awesome/7.1.0/fontawesome.min.css'
    }
  ]
})
</script>

<style src="~/assets/css/index.css"></style>
<style src="~/assets/css/blogwiki.css"></style>
<style src="~/assets/css/musicplayer.css"></style>

<style lang="scss">
@use "~/assets/scss/index.scss" as *;
</style>
