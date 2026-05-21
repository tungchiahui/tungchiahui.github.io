<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#app'
import { getCurrentLocaleSlug, replaceLocaleInPath } from '~~/utils/i18n-locales'
import { getPageCopy } from '~~/utils/i18n-page-copy'

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const localizePath = (path: string) => replaceLocaleInPath(path, currentLocaleSlug.value)

const copy = computed(() => getPageCopy('more', currentLocaleSlug.value))

useHead(() => ({
  title: copy.value.title,
  meta: [
    {
      name: 'description',
      content: copy.value.metaDescription
    }
  ]
}))
</script>

<template>
  <div class="more-wrap">
    <h1>{{ copy.title }}</h1>
    <p class="more-desc">{{ copy.description }}</p>

    <!-- 数据分析类 -->
    <div class="more-category">
      <h2 class="category-title">{{ copy.categories.analytics }}</h2>
      <div class="more-grid">

        <!-- 数据统计 -->
        <NuxtLink class="more-card" :to="localizePath('/stats')">
          <div class="card-title">
            <i class="fas fa-chart-bar" aria-hidden="true"></i>
            <span>{{ copy.cards.stats[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.stats[1] }}</div>
        </NuxtLink>

        <!-- Umami -->
        <a class="more-card" href="https://umami.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-globe" aria-hidden="true"></i>
            <span>Umami</span>
          </div>
          <div class="card-sub">{{ copy.cards.umami[1] }}</div>
        </a>

      </div>
    </div>

    <!-- 加速服务 -->
    <div class="more-category">
      <h2 class="category-title">{{ copy.categories.acceleration }}</h2>
      <div class="more-grid">

        <!-- 中国大陆CDN -->
        <a class="more-card" href="https://cdn.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-server" aria-hidden="true"></i>
            <span>{{ copy.cards.cnCdn[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.cnCdn[1] }}</div>
        </a>

        <!-- 国际CDN -->
        <a class="more-card" href="https://global.cdn.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-network-wired" aria-hidden="true"></i>
            <span>{{ copy.cards.globalCdn[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.globalCdn[1] }}</div>
        </a>

      </div>
    </div>

    <!-- 其他 -->
    <div class="more-category">
      <h2 class="category-title">{{ copy.categories.other }}</h2>
      <div class="more-grid">

        <!-- 音乐播放器 -->
        <NuxtLink class="more-card" :to="localizePath('/music')">
          <div class="card-title">
            <i class="fas fa-music" aria-hidden="true"></i>
            <span>{{ copy.cards.music[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.music[1] }}</div>
        </NuxtLink>

        <!-- 友情链接 -->
        <NuxtLink class="more-card" :to="localizePath('/friend')">
          <div class="card-title">
            <i class="fas fa-handshake" aria-hidden="true"></i>
            <span>{{ copy.cards.friends[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.friends[1] }}</div>
        </NuxtLink>
        
        <!-- 技术路线 -->
        <NuxtLink class="more-card" :to="localizePath('/tech-footprint')">
          <div class="card-title">
            <i class="fas fa-tools" aria-hidden="true"></i>
            <span>{{ copy.cards.footprint[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.footprint[1] }}</div>
        </NuxtLink>

        <!-- 简历 -->
        <NuxtLink class="more-card" :to="localizePath('/cv')">
          <div class="card-title">
            <i class="fas fa-file-alt" aria-hidden="true"></i>
            <span>{{ copy.cards.cv[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.cv[1] }}</div>
        </NuxtLink>

        <!-- 导航页 -->
        <NuxtLink class="more-card" :to="localizePath('/start')">
          <div class="card-title">
            <i class="fas fa-compass" aria-hidden="true"></i>
            <span>{{ copy.cards.start[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.start[1] }}</div>
        </NuxtLink>

        <!-- LOGO介绍 -->
        <NuxtLink class="more-card" :to="localizePath('/mylogo')">
          <div class="card-title">
            <i class="fas fa-shapes" aria-hidden="true"></i>
            <span>{{ copy.cards.logo[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.logo[1] }}</div>
        </NuxtLink>

        <!-- CHAT -->
        <a class="more-card" href="https://chat.tungchiahui.cn" target="_blank" rel="noopener noreferrer">
          <div class="card-title">
            <i class="fas fa-comments" aria-hidden="true"></i>
            <span>CHAT</span>
          </div>
          <div class="card-sub">{{ copy.cards.chat[1] }}</div>
        </a>

      </div>
    </div>


  </div>
</template>
