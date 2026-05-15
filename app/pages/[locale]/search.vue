<script setup lang="ts">
import SearchPage from '~/pages/search.vue'
import { isSupportedLocaleSlug } from '~~/utils/i18n-locales'

definePageMeta({
  validate: route => isSupportedLocaleSlug(route.params.locale)
})
</script>

<template>
  <SearchPage />
</template>
