<script setup lang="ts">
import BlogDetailPage from '~/pages/blog/[...slug].vue'
import { isSupportedLocaleSlug } from '~~/utils/i18n-locales'

definePageMeta({
  validate: route => isSupportedLocaleSlug(route.params.locale)
})
</script>

<template>
  <BlogDetailPage />
</template>
