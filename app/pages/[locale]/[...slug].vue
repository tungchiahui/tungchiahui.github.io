<script setup lang="ts">
import { computed } from 'vue'
import AboutPage from '~/pages/about.vue'
import CvPage from '~/pages/cv.vue'
import FriendPage from '~/pages/friend.vue'
import MorePage from '~/pages/more.vue'
import MyLogoPage from '~/pages/mylogo.vue'
import StartPage from '~/pages/start.vue'
import StatsPage from '~/pages/stats.vue'
import TechFootprintPage from '~/pages/tech-footprint.vue'
import { isSupportedLocaleSlug } from '~~/utils/i18n-locales'

const localizedPages = {
  about: AboutPage,
  cv: CvPage,
  friend: FriendPage,
  more: MorePage,
  mylogo: MyLogoPage,
  start: StartPage,
  stats: StatsPage,
  'tech-footprint': TechFootprintPage
}

type LocalizedPageKey = keyof typeof localizedPages

definePageMeta({
  validate(route) {
    return isSupportedLocaleSlug(route.params.locale) && getPageKey(route.params.slug) in localizedPages
  }
})

const route = useRoute()
const CurrentPage = computed(() => localizedPages[getPageKey(route.params.slug) as LocalizedPageKey])

function getPageKey(value: unknown) {
  return Array.isArray(value) ? value.join('/') : String(value || '')
}
</script>

<template>
  <component :is="CurrentPage" />
</template>
