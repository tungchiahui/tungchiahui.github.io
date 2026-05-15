<template>
  <div class="wiki-home-page">
    <header class="wiki-home-header">
      <h1>
        <i class="fas fa-book-open" aria-hidden="true"></i>
        <span>{{ ui.wikiHome }}</span>
      </h1>
      <p>{{ ui.wikiDescription }}</p>
    </header>
    <WikiList />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'
import WikiList from '../../components/WikiList.vue'
import { getCurrentLocaleSlug } from '~~/utils/i18n-locales'
import { getUiText } from '~~/utils/i18n-ui'

const route = useRoute()
const ui = computed(() => getUiText(getCurrentLocaleSlug(route.path)))

useHead({
  title: () => ui.value.wikiHome,
  meta: [
    {
      name: 'description',
      content: () => ui.value.wikiMetaDescription
    }
  ]
})
</script>
