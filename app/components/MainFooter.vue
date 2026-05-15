<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import {
  getCurrentLocaleSlug,
  getLocaleSectionPath,
  replaceLocaleInPath
} from '~~/utils/i18n-locales'

const config = useRuntimeConfig()
const route = useRoute()

const currentYear = new Date().getFullYear()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const homePath = computed(() => replaceLocaleInPath('/', currentLocaleSlug.value))

const variableFooterLinks = [
  { to: '/blog', label: '博客', icon: 'fas fa-newspaper' },
  { to: '/wiki', label: 'Wiki', icon: 'fas fa-book-open' },
  { to: '/stats', label: '資料統計', icon: 'fas fa-chart-line' },
  { to: '/friend', label: '友情連結', icon: 'fas fa-handshake' },
  { to: '/about', label: '關於本站', icon: 'fas fa-circle-info' }
]

const moreFooterLink = { to: '/more', label: '更多頁面', icon: 'fas fa-table-cells-large' }
const footerLinks = ref([...variableFooterLinks, moreFooterLink])
const localizedFooterLinks = computed(() => footerLinks.value.map(link => ({
  ...link,
  to: getLocalizedFooterPath(link.to)
})))

onMounted(() => {
  footerLinks.value = [...shuffleLinks(variableFooterLinks), moreFooterLink]
})

const socialLinks = computed(() => {
  const social = (config.public.social || {}) as Record<string, string | undefined>

  return [
    { key: 'website', label: 'Website', href: social.website, icon: 'fas fa-link' },
    { key: 'email', label: 'E-Mail', href: social.email, icon: 'fas fa-envelope' },
    { key: 'github', label: 'GitHub', href: social.github, icon: 'fab fa-github' },
    { key: 'qq', label: 'QQ', href: social.qq, icon: 'fab fa-qq' },
    { key: 'telegram', label: 'Telegram', href: social.telegram, icon: 'fab fa-telegram' },
    { key: 'bilibili', label: 'Bilibili', href: social.bilibili, icon: 'fa-brands fa-bilibili' },
    { key: 'youtube', label: 'YouTube', href: social.youtube, icon: 'fab fa-youtube' },
    { key: 'twitter', label: 'Twitter', href: social.twitter, icon: 'fab fa-twitter' },
    { key: 'instagram', label: 'Instagram', href: social.instagram, icon: 'fab fa-instagram' },
    { key: 'facebook', label: 'Facebook', href: social.facebook, icon: 'fab fa-facebook' },
    { key: 'douyin', label: '抖音', href: social.douyin, icon: 'fab fa-tiktok' },
    { key: 'tiktok', label: 'TikTok', href: social.tiktok, icon: 'fab fa-tiktok' },
    { key: 'coolapk', label: 'CoolAPK', href: social.coolapk, icon: 'fab fa-android' }
  ].filter(link => Boolean(link.href))
})

const recordLinks = computed(() => {
  const record = (config.public.record || {}) as Record<string, string | undefined>

  return [
    {
      key: 'icp',
      label: record.icp,
      href: 'https://beian.miit.gov.cn/',
      icon: 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/footer/favicon-miit.webp',
      alt: '工信部图标'
    },
    {
      key: 'beian',
      label: record.beian,
      href: 'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=37030302001121',
      icon: 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/footer/favicon-mps.webp',
      alt: '公安备案图标'
    }
  ].filter(link => Boolean(link.label))
})

function shuffleLinks<T>(links: T[]) {
  const shuffled = [...links]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = current
  }

  return shuffled
}

function getLocalizedFooterPath(path: string) {
  if (path === '/blog') {
    return getLocaleSectionPath(currentLocaleSlug.value, 'blog')
  }

  if (path === '/wiki') {
    return getLocaleSectionPath(currentLocaleSlug.value, 'wiki')
  }

  return replaceLocaleInPath(path, currentLocaleSlug.value)
}
</script>

<template>
  <footer class="main-footer">
    <div class="footer-shell">
      <section class="footer-intro" aria-label="站點資訊">
        <NuxtLink :to="homePath" class="footer-mark" aria-label="返回首頁">
          <span class="footer-mark-icon" aria-hidden="true">
            <i class="fas fa-compass"></i>
          </span>
          <span class="footer-mark-copy">
            <strong>东澈的折腾天地</strong>
            <small>Tung Chia-hui Lab Notes</small>
          </span>
        </NuxtLink>

        <p class="footer-description">
          記錄學習、開發和生活裡的折騰過程，把工程實踐和踩坑經驗整理成可以反覆查閱的筆記。
        </p>

        <a
          class="powered-link"
          href="https://nuxt.com"
          target="_blank"
          rel="noopener noreferrer"
          title="造訪 Nuxt 官網"
        >
          <img
            class="nuxt-favicon"
            src="https://nuxt.com/icon.png"
            alt="Nuxt"
            loading="lazy"
            decoding="async"
          />
          <span>Powered by Nuxt</span>
        </a>
      </section>

      <nav class="footer-nav" aria-label="頁腳導覽">
        <h2>站內導覽</h2>
        <div class="footer-link-grid">
          <NuxtLink v-for="link in localizedFooterLinks" :key="link.to" :to="link.to" class="footer-link">
            <i :class="link.icon" aria-hidden="true"></i>
            <span>{{ link.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <section class="footer-language" aria-label="語言設定">
        <h2>語言</h2>
        <LanguageSwitcher class="footer-language-switcher" />
      </section>

      <section class="footer-connect" aria-label="頁腳工具">
        <h2>聯絡方式</h2>
        <div class="footer-social">
          <a
            v-for="link in socialLinks"
            :key="link.key"
            :href="link.href"
            target="_blank"
            rel="noopener"
            :title="link.label"
            :aria-label="link.label"
          >
            <i :class="link.icon" aria-hidden="true"></i>
          </a>
        </div>
      </section>

      <div class="footer-bottom">
        <p class="footer-copyright">Copyright {{ currentYear }} 东澈的折腾天地</p>

        <div class="footer-records">
          <a
            v-for="record in recordLinks"
            :key="record.key"
            :href="record.href"
            target="_blank"
            rel="noopener"
            class="footer-record"
          >
            <img :src="record.icon" :alt="record.alt" loading="lazy" decoding="async" />
            <span>{{ record.label }}</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style src="~/assets/css/footer.css"></style>
