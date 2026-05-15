<script setup lang="ts">
import WikiIndexPage from '~/pages/wiki/index.vue'
import { isSupportedLocaleSlug } from '~~/utils/i18n-locales'

definePageMeta({
  validate: route => isSupportedLocaleSlug(route.params.locale)
})
</script>

<template>
  <WikiIndexPage />
</template>
