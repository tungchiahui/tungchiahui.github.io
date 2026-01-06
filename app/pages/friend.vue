<template>
  <div class="friends-wrap">
    <div class="friends-header">
      <h1>🤝 友情链接</h1>
      <p>汇聚技术资源、开源社区、竞赛团队及优质网站，方便学习、交流与探索更多创新内容。</p>
    </div>

    <div class="friends-divider"></div>

    <div v-for="category in categoriesOrder" :key="category">
      <div class="friend-category-title">{{ category }}</div>
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
              :alt="friend.name"
              loading="lazy"
              @error="onImgError"
            />
            <div>
              <div class="friend-title">{{ friend.name }}</div>
              <div class="friend-sub">{{ friend.desc }}</div>
            </div>
          </div>

          <div class="friend-meta">
            <div class="friend-tags">
              <span class="tag" v-for="tag in friend.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="friend-bottom">
            <span class="friend-visit">访问网站</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { friends } from '~/data/friends.js'

// 动态生成分类，只显示实际有的
const categoriesOrder = [...new Set(friends.map(f => f.category))]

const defaultIcon = "https://cdn.tungchiahui.cn/tungwebsite/assets/images/default-avatar.webp"

const friendsByCategory = (category) => friends.filter(f => f.category === category)

const onImgError = (e) => {
  e.target.src = defaultIcon
}
</script>

<style scoped>

</style>
