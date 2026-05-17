<template>
  <div class="friends-wrap">
    <div class="friends-header">
      <h1>
        <i class="fas fa-handshake" aria-hidden="true"></i>
        <span>{{ copy.title }}</span>
      </h1>
      <p>{{ copy.description }}</p>
    </div>

    <div class="friends-divider"></div>

    <div v-for="category in categoriesOrder" :key="category">
      <div class="friend-category-title">{{ copy.categories[category] || category }}</div>
      <div class="friends-grid">
        <a 
          v-for="friend in friendsByCategory(category)" 
          :key="friend.url" 
          class="friend"
          :href="friend.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="friend-top">
            <img
              class="friend-icon-img"
              :src="friend.icon || defaultIcon"
              :alt="friendCopy(friend).name"
              loading="lazy"
              @error="onImgError"
            />
            <div>
              <div class="friend-title">{{ friendCopy(friend).name }}</div>
              <div class="friend-sub">{{ friendCopy(friend).desc }}</div>
            </div>
          </div>

          <div class="friend-meta">
            <div class="friend-tags">
              <span class="tag" v-for="tag in friend.tags" :key="tag">{{ copy.tags[tag] || tag }}</span>
            </div>
          </div>

          <div class="friend-bottom">
            <span class="friend-visit">{{ copy.visit }}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '#app'
import { friends } from '~/data/friends.js'
import { getCurrentLocaleSlug } from '~~/utils/i18n-locales'
import { getPageCopy } from '~~/utils/i18n-page-copy'

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const copy = computed(() => getPageCopy('friend', currentLocaleSlug.value))

useHead(() => ({
  title: copy.value.title,
  meta: [
    {
      name: 'description',
      content: copy.value.metaDescription
    }
  ]
}))

// 动态生成分类，只显示实际有的
const categoriesOrder = [...new Set(friends.map(f => f.category))]

const defaultIcon = "https://cdn.tungchiahui.cn/tungwebsite/assets/images/default-avatar.webp"

const friendsByCategory = (category) => friends.filter(f => f.category === category)

const friendCopy = (friend) => copy.value.friends[friend.key] || {
  name: friend.name,
  desc: friend.desc
}

const onImgError = (e) => {
  e.target.src = defaultIcon
}
</script>

<style scoped>

</style>
