<script setup lang="ts">
import WikiDetailPage from '~/pages/wiki/[...slug].vue'
import { isSupportedLocaleSlug } from '~~/utils/i18n-locales'

definePageMeta({
  validate: route => isSupportedLocaleSlug(route.params.locale)
})
</script>

<template>
  <WikiDetailPage />
</template>
