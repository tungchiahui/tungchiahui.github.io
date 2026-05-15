<script setup lang="ts">
import BlogIndexPage from '~/pages/blog/index.vue'
import { isSupportedLocaleSlug } from '~~/utils/i18n-locales'

definePageMeta({
  validate: route => isSupportedLocaleSlug(route.params.locale)
})
</script>

<template>
  <BlogIndexPage />
</template>
