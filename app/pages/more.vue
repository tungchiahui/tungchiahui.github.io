<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useHead } from '#app'
import { getCurrentLocaleSlug, replaceLocaleInPath } from '~~/utils/i18n-locales'
import { getPageCopy } from '~~/utils/i18n-page-copy'

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const localizePath = (path: string) => replaceLocaleInPath(path, currentLocaleSlug.value)

const copy = computed(() => getPageCopy('more', currentLocaleSlug.value))

const copiedService = ref<string | null>(null)
const copyErrorService = ref<string | null>(null)
let copyFeedbackTimer: ReturnType<typeof setTimeout> | undefined

const storageServices = computed(() => [
  {
    id: 'alist',
    title: copy.value.cards.alist[0],
    description: copy.value.cards.alist[1],
    endpoint: 'https://alist.tungchiahui.cn',
    badge: 'WEBUI',
    icon: 'fas fa-folder-open',
    canOpen: true
  },
  {
    id: 's3',
    title: copy.value.cards.s3[0],
    description: copy.value.cards.s3[1],
    endpoint: 'https://s3.tungchiahui.cn',
    badge: 'S3 API',
    icon: 'fas fa-database',
    canOpen: false
  },
  {
    id: 'primary-cdn',
    title: copy.value.cards.cnCdn[0],
    description: copy.value.cards.cnCdn[1],
    endpoint: 'https://cdn.tungchiahui.cn',
    badge: 'PRIMARY',
    icon: 'fas fa-server',
    canOpen: false
  },
  {
    id: 'global-cdn',
    title: copy.value.cards.globalCdn[0],
    description: copy.value.cards.globalCdn[1],
    endpoint: 'https://global.cdn.tungchiahui.cn',
    badge: 'R2 BACKUP',
    icon: 'fas fa-earth-asia',
    canOpen: false
  }
])

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    return document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

async function copyEndpoint(serviceId: string, endpoint: string) {
  let succeeded = false

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(endpoint)
      succeeded = true
    }
  } catch {
    succeeded = false
  }

  if (!succeeded) {
    try {
      succeeded = fallbackCopy(endpoint)
    } catch {
      succeeded = false
    }
  }

  copiedService.value = succeeded ? serviceId : null
  copyErrorService.value = succeeded ? null : serviceId

  if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer)
  copyFeedbackTimer = setTimeout(() => {
    copiedService.value = null
    copyErrorService.value = null
  }, 2000)
}

onBeforeUnmount(() => {
  if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer)
})

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

    <!-- 对象存储与分发 -->
    <div class="more-category">
      <h2 class="category-title">{{ copy.categories.storage }}</h2>
      <p class="category-description">{{ copy.storageDescription }}</p>
      <div class="more-grid storage-grid">
        <article
          v-for="service in storageServices"
          :key="service.id"
          class="more-card storage-card"
        >
          <div class="service-card-head">
            <span class="service-icon" aria-hidden="true">
              <i :class="service.icon"></i>
            </span>
            <span class="service-badge">{{ service.badge }}</span>
          </div>

          <div class="service-copy">
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
            <code>{{ service.endpoint }}</code>
          </div>

          <div class="service-actions">
            <a
              v-if="service.canOpen"
              class="service-action service-action-primary"
              :href="service.endpoint"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
              <span>{{ copy.actions.open }}</span>
            </a>
            <button
              class="service-action"
              type="button"
              :aria-label="`${copy.actions.copy}：${service.title}`"
              @click="copyEndpoint(service.id, service.endpoint)"
            >
              <i
                :class="copiedService === service.id
                  ? 'fas fa-check'
                  : copyErrorService === service.id
                    ? 'fas fa-triangle-exclamation'
                    : 'fas fa-copy'"
                aria-hidden="true"
              ></i>
              <span aria-live="polite">
                {{ copiedService === service.id
                  ? copy.actions.copied
                  : copyErrorService === service.id
                    ? copy.actions.copyFailed
                    : copy.actions.copy }}
              </span>
            </button>
          </div>
        </article>
      </div>
    </div>

    <!-- 其他 -->
    <div class="more-category">
      <h2 class="category-title">{{ copy.categories.other }}</h2>
      <div class="more-grid">

        <!-- 减脂计划 -->
        <NuxtLink class="more-card" :to="localizePath('/weight-loss')">
          <div class="card-title">
            <i class="fas fa-weight-scale" aria-hidden="true"></i>
            <span>{{ copy.cards.weightLoss[0] }}</span>
          </div>
          <div class="card-sub">{{ copy.cards.weightLoss[1] }}</div>
        </NuxtLink>

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
