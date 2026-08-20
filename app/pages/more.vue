<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useHead } from '#app'
import { getCurrentLocaleSlug, replaceLocaleInPath } from '~~/utils/i18n-locales'
import { getPageCopy } from '~~/utils/i18n-page-copy'

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const localizePath = (path: string) => replaceLocaleInPath(path, currentLocaleSlug.value)

const copy = computed(() => getPageCopy('more', currentLocaleSlug.value))

const analyticsLinks = computed(() => [
  {
    id: 'stats',
    title: copy.value.cards.stats[0],
    description: copy.value.cards.stats[1],
    destination: localizePath('/stats'),
    displayUrl: 'tungchiahui.cn/stats',
    icon: 'fas fa-chart-line',
    accent: 'teal',
    external: false
  },
  {
    id: 'umami',
    title: copy.value.cards.umami[0],
    description: copy.value.cards.umami[1],
    destination: 'https://umami.tungchiahui.cn',
    displayUrl: 'umami.tungchiahui.cn',
    icon: 'fas fa-globe',
    accent: 'blue',
    external: true
  }
])

const resourceLinks = computed(() => [
  {
    id: 'weight-loss',
    title: copy.value.cards.weightLoss[0],
    description: copy.value.cards.weightLoss[1],
    destination: localizePath('/weight-loss'),
    icon: 'fas fa-weight-scale',
    accent: 'coral',
    external: false
  },
  {
    id: 'music',
    title: copy.value.cards.music[0],
    description: copy.value.cards.music[1],
    destination: localizePath('/music'),
    icon: 'fas fa-music',
    accent: 'violet',
    external: false
  },
  {
    id: 'friends',
    title: copy.value.cards.friends[0],
    description: copy.value.cards.friends[1],
    destination: localizePath('/friend'),
    icon: 'fas fa-handshake',
    accent: 'amber',
    external: false
  },
  {
    id: 'footprint',
    title: copy.value.cards.footprint[0],
    description: copy.value.cards.footprint[1],
    destination: localizePath('/tech-footprint'),
    icon: 'fas fa-route',
    accent: 'teal',
    external: false
  },
  {
    id: 'cv',
    title: copy.value.cards.cv[0],
    description: copy.value.cards.cv[1],
    destination: localizePath('/cv'),
    icon: 'fas fa-id-card',
    accent: 'blue',
    external: false
  },
  {
    id: 'start',
    title: copy.value.cards.start[0],
    description: copy.value.cards.start[1],
    destination: localizePath('/start'),
    icon: 'fas fa-compass',
    accent: 'sky',
    external: false
  },
  {
    id: 'logo',
    title: copy.value.cards.logo[0],
    description: copy.value.cards.logo[1],
    destination: localizePath('/mylogo'),
    icon: 'fas fa-shapes',
    accent: 'rose',
    external: false
  },
  {
    id: 'chat',
    title: copy.value.cards.chat[0],
    description: copy.value.cards.chat[1],
    destination: 'https://chat.tungchiahui.cn',
    icon: 'fas fa-comments',
    accent: 'emerald',
    external: true
  }
])

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
  <main class="more-page">
    <section class="more-hero" aria-labelledby="more-title">
      <div class="hero-copy">
        <p class="hero-kicker">
          <span aria-hidden="true"></span>
          {{ copy.kicker }}
        </p>
        <h1 id="more-title">{{ copy.title }}</h1>
        <p class="hero-description">{{ copy.description }}</p>
      </div>

      <nav class="hero-directory" :aria-label="copy.directoryLabel">
        <a href="#analytics" class="directory-index-item">
          <strong>02</strong>
          <span>{{ copy.categories.analytics }}</span>
          <i class="fas fa-arrow-down" aria-hidden="true"></i>
        </a>
        <a href="#storage" class="directory-index-item">
          <strong>04</strong>
          <span>{{ copy.categories.storage }}</span>
          <i class="fas fa-arrow-down" aria-hidden="true"></i>
        </a>
        <a href="#resources" class="directory-index-item">
          <strong>08</strong>
          <span>{{ copy.categories.other }}</span>
          <i class="fas fa-arrow-down" aria-hidden="true"></i>
        </a>
      </nav>
    </section>

    <section id="analytics" class="directory-section">
      <div class="section-heading">
        <div>
          <p class="section-index">01 / INSIGHT</p>
          <h2>{{ copy.categories.analytics }}</h2>
        </div>
        <p>{{ copy.sectionDescriptions.analytics }}</p>
      </div>

      <div class="analytics-grid">
        <template v-for="item in analyticsLinks" :key="item.id">
          <a
            v-if="item.external"
            class="directory-card analytics-card"
            :class="`accent-${item.accent}`"
            :href="item.destination"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="card-icon" aria-hidden="true"><i :class="item.icon"></i></span>
            <span class="card-kind">{{ copy.labels.external }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <span class="card-footer">
              <code>{{ item.displayUrl }}</code>
              <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
            </span>
          </a>

          <NuxtLink
            v-else
            class="directory-card analytics-card"
            :class="`accent-${item.accent}`"
            :to="item.destination"
          >
            <span class="card-icon" aria-hidden="true"><i :class="item.icon"></i></span>
            <span class="card-kind">{{ copy.labels.internal }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <span class="card-footer">
              <code>{{ item.displayUrl }}</code>
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </span>
          </NuxtLink>
        </template>
      </div>
    </section>

    <section id="storage" class="directory-section">
      <div class="section-heading">
        <div>
          <p class="section-index">02 / STORAGE</p>
          <h2>{{ copy.categories.storage }}</h2>
        </div>
        <p>{{ copy.storageDescription }}</p>
      </div>

      <div class="storage-shell">
        <div class="storage-flow" aria-hidden="true">
          <span>AList WebUI</span>
          <i class="fas fa-arrow-right"></i>
          <span>S3 API</span>
          <i class="fas fa-arrow-right"></i>
          <span>Primary CDN · R2 Backup</span>
        </div>

        <div class="storage-grid">
          <article
            v-for="service in storageServices"
            :key="service.id"
            class="storage-card"
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
    </section>

    <section id="resources" class="directory-section">
      <div class="section-heading">
        <div>
          <p class="section-index">03 / EXPLORE</p>
          <h2>{{ copy.categories.other }}</h2>
        </div>
        <p>{{ copy.sectionDescriptions.other }}</p>
      </div>

      <div class="resource-grid">
        <template v-for="item in resourceLinks" :key="item.id">
          <a
            v-if="item.external"
            class="directory-card resource-card"
            :class="`accent-${item.accent}`"
            :href="item.destination"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="card-icon" aria-hidden="true"><i :class="item.icon"></i></span>
            <span class="card-kind">{{ copy.labels.external }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <span class="resource-arrow"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></span>
          </a>

          <NuxtLink
            v-else
            class="directory-card resource-card"
            :class="`accent-${item.accent}`"
            :to="item.destination"
          >
            <span class="card-icon" aria-hidden="true"><i :class="item.icon"></i></span>
            <span class="card-kind">{{ copy.labels.internal }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <span class="resource-arrow"><i class="fas fa-arrow-right" aria-hidden="true"></i></span>
          </NuxtLink>
        </template>
      </div>
    </section>
  </main>
</template>
