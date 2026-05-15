<template>
  <div class="blog-page">
    <h1>
      <i class="fas fa-newspaper" aria-hidden="true"></i>
      <span>{{ ui.blogList }}</span>
    </h1>
    <PostList />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'
import PostList from '~/components/PostList.vue'
import { getCurrentLocaleSlug } from '~~/utils/i18n-locales'
import { getUiText } from '~~/utils/i18n-ui'

const route = useRoute()
const ui = computed(() => getUiText(getCurrentLocaleSlug(route.path)))

useHead({
  title: () => ui.value.blogList,
  meta: [
    {
      name: 'description',
      content: () => ui.value.blogDescription
    }
  ]
})
</script>
