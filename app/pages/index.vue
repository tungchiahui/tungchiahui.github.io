<script setup lang="ts">
import { useHead } from '#app'
import { computed } from 'vue'
import PostList from '~/components/PostList.vue'
import WikiList from '~/components/WikiList.vue'
import {
  getCurrentLocaleSlug,
  getLocaleSectionPath,
  replaceLocaleInPath
} from '~~/utils/i18n-locales'

interface FocusArea {
  icon: string
  title: string
  summary: string
}

interface HomeAction {
  to: string
  icon: string
  label: string
}

const heroTags = [
  '技术折腾',
  '项目记录',
  '学习笔记',
  '生活随想'
]

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const blogPath = computed(() => getLocaleSectionPath(currentLocaleSlug.value, 'blog'))
const wikiPath = computed(() => getLocaleSectionPath(currentLocaleSlug.value, 'wiki'))
const morePath = computed(() => replaceLocaleInPath('/more', currentLocaleSlug.value))

const homeActions = computed<HomeAction[]>(() => [
  { to: blogPath.value, icon: 'fas fa-newspaper', label: '浏览博客文章' },
  { to: wikiPath.value, icon: 'fas fa-book-open', label: '进入 Wiki 知识库' },
  { to: morePath.value, icon: 'fas fa-table-cells-large', label: '查看更多页面' }
])

const focusAreas: FocusArea[] = [
  {
    icon: 'fas fa-microchip',
    title: '编程与嵌入式开发',
    summary: '围绕 C/C++、Python 与 Linux 环境，沉淀 STM32、ESP32、FreeRTOS 与驱动开发实践。'
  },
  {
    icon: 'fas fa-robot',
    title: '机器人与自动化',
    summary: '持续实践 ROS1 / ROS2 的运动控制、导航建图与传感器融合，并结合 OpenCV 做环境感知。'
  },
  {
    icon: 'fas fa-display',
    title: '图形界面与工具开发',
    summary: '使用 Qt6 构建上位机与可视化调试工具，提升机器人项目的开发效率与可维护性。'
  },
  {
    icon: 'fas fa-globe',
    title: 'Web 与博客工程',
    summary: '基于 Nuxt 打造内容系统，持续优化内容组织、检索体验与前端性能。'
  },
  {
    icon: 'fas fa-mobile-screen-button',
    title: '移动端工具实践',
    summary: '在 Android 平台开发控制与监控工具，实现设备联动、状态可视化与流程提效。'
  },
  {
    icon: 'fas fa-pen-ruler',
    title: '学习笔记与思考复盘',
    summary: '以可复用的方式记录踩坑、设计取舍与项目反思，方便后续快速回顾与迭代。'
  }
]

useHead({
  title: '东澈的折腾天地',
  meta: [
    { name: 'description', content: '探索、学习与创造的记录' }
  ]
})
</script>


<template>
  <div class="landing-page">
    <section class="landing-hero" aria-labelledby="home-title">
      <p class="hero-kicker">
        <i class="fas fa-compass" aria-hidden="true"></i>
        Tung Chia-hui Lab Notes
      </p>
      <h1 id="home-title">欢迎来到东澈的折腾天地</h1>
      <p class="hero-summary">
        这里是我的个人主页，记录学习、开发和生活里的折腾过程:
        从机器人与嵌入式，到 Web、工具和一些日常思考。
      </p>

      <div class="hero-actions">
        <NuxtLink v-for="action in homeActions" :key="action.to" :to="action.to" class="hero-btn">
          <i :class="action.icon" aria-hidden="true"></i>
          <span>{{ action.label }}</span>
        </NuxtLink>
      </div>
      <ul class="hero-tags">
        <li v-for="tag in heroTags" :key="tag">
          <i class="fas fa-check-circle" aria-hidden="true"></i>
          <span>{{ tag }}</span>
        </li>
      </ul>
    </section>

    <section class="focus-section" aria-labelledby="focus-title">
      <div class="section-head">
        <h2 id="focus-title">本站内容方向</h2>
        <p>聚焦工程实践与可落地经验，而不是只停留在概念。</p>
      </div>

      <div class="focus-grid">
        <article v-for="area in focusAreas" :key="area.title" class="focus-card">
          <div class="focus-icon" aria-hidden="true">
            <i :class="area.icon"></i>
          </div>
          <h3>{{ area.title }}</h3>
          <p>{{ area.summary }}</p>
        </article>
      </div>
    </section>

    <section class="latest-section" aria-label="最新内容">
      <div class="latest-grid">
        <article class="latest-panel">
          <header class="panel-head">
            <h2>
              <i class="fas fa-newspaper" aria-hidden="true"></i>
              <span>最新博客</span>
            </h2>
            <NuxtLink :to="blogPath" class="panel-link">查看全部</NuxtLink>
          </header>
          <PostList :limit="5" :show-search="false" />
        </article>

        <article class="latest-panel">
          <header class="panel-head">
            <h2>
              <i class="fas fa-book-open" aria-hidden="true"></i>
              <span>最新 Wiki</span>
            </h2>
            <NuxtLink :to="wikiPath" class="panel-link">查看全部</NuxtLink>
          </header>
          <WikiList
            :limit="5"
            :show-search="false"
            :show-traffic="true"
            :show-chapters="true"
            :show-toggle="true"
          />
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  --home-accent: #14b8a6;
  --home-accent-strong: #0f766e;
  --home-accent-soft: color-mix(in srgb, var(--home-accent) 14%, transparent);
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 0 2rem;
  display: grid;
  gap: 1.2rem;
}

.landing-hero,
.focus-section,
.latest-panel {
  border: 1px solid var(--nav-border, #dbe5ee);
  border-radius: 22px;
  background: var(--bg-color, #fff);
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}

.landing-hero {
  position: relative;
  overflow: hidden;
  padding: clamp(1.5rem, 2.3vw, 2.4rem);
  isolation: isolate;
}

.landing-hero::before,
.landing-hero::after {
  content: '';
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(1px);
  z-index: -1;
}

.landing-hero::before {
  width: 340px;
  height: 340px;
  right: -130px;
  top: -180px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.28), rgba(20, 184, 166, 0));
}

.landing-hero::after {
  width: 280px;
  height: 280px;
  left: -140px;
  bottom: -140px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.24), rgba(59, 130, 246, 0));
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.44rem 0.78rem;
  margin: 0 0 0.9rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--home-accent-strong);
  background: var(--home-accent-soft);
}

.hero-kicker i {
  color: var(--home-accent-strong);
}

.landing-hero h1 {
  margin: 0 0 0.8rem;
  font-size: clamp(1.7rem, 3vw, 2.5rem);
  line-height: 1.2;
}

.hero-summary {
  margin: 0;
  font-size: clamp(1rem, 1.6vw, 1.08rem);
  line-height: 1.75;
  color: var(--text-secondary, #64748b);
  max-width: 760px;
}

.hero-actions {
  margin-top: 1.3rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.72rem;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.52rem;
  min-height: 42px;
  padding: 0 1rem;
  border-radius: 12px;
  background: #0f766e;
  border: 1px solid rgba(15, 118, 110, 0.4);
  color: #f8fafc;
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;
}

.hero-btn:hover {
  background: #115e59;
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(15, 118, 110, 0.26);
}

.hero-tags {
  list-style: none;
  margin: 1.1rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.hero-tags li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.68rem;
  border-radius: 999px;
  border: 1px solid var(--nav-border, #dbe5ee);
  background: color-mix(in srgb, var(--bg-color, #fff) 92%, #f0fdfa);
  color: var(--text-secondary, #64748b);
  font-size: 0.82rem;
  font-weight: 600;
}

.hero-tags i {
  color: var(--home-accent-strong);
  font-size: 0.8rem;
}

.focus-section {
  padding: clamp(1.1rem, 2.2vw, 1.8rem);
}

.section-head h2 {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
}

.section-head p {
  margin: 0.35rem 0 0;
  color: var(--text-secondary, #64748b);
}

.focus-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.82rem;
}

.focus-card {
  border: 1px solid var(--nav-border, #dbe5ee);
  border-radius: 16px;
  padding: 1rem;
  background: color-mix(in srgb, var(--bg-color, #fff) 90%, #ecfeff);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.focus-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--home-accent) 44%, transparent);
  box-shadow: 0 10px 24px rgba(15, 118, 110, 0.12);
}

.focus-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--home-accent-soft);
  color: var(--home-accent-strong);
}

.focus-card h3 {
  margin: 0.72rem 0 0.42rem;
  font-size: 1.02rem;
}

.focus-card p {
  margin: 0;
  color: var(--text-secondary, #64748b);
  line-height: 1.64;
  font-size: 0.92rem;
}

.latest-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.latest-panel {
  padding: 1rem;
}

.panel-head {
  margin-bottom: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.panel-head h2 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.08rem;
}

.panel-head h2 i {
  color: var(--home-accent-strong);
}

.panel-link {
  color: var(--home-accent-strong);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
}

.panel-link:hover {
  text-decoration: underline;
}

.landing-hero,
.focus-section,
.latest-panel {
  animation: section-enter 0.52s ease both;
}

.focus-section {
  animation-delay: 0.08s;
}

.latest-panel {
  animation-delay: 0.16s;
}

.latest-panel:nth-child(2) {
  animation-delay: 0.22s;
}

@keyframes section-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .focus-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .latest-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .landing-page {
    gap: 0.82rem;
  }

  .landing-hero,
  .focus-section,
  .latest-panel {
    border-radius: 16px;
  }

  .focus-grid {
    grid-template-columns: 1fr;
  }

  .hero-btn {
    width: 100%;
    justify-content: center;
  }
}

</style>

<style>
html.dark .landing-page .landing-hero,
html.dark .landing-page .focus-section,
html.dark .landing-page .latest-panel {
  background: color-mix(in srgb, var(--bg-color, #0f172a) 92%, #0b2d35);
  box-shadow: 0 16px 40px rgba(2, 6, 23, 0.48);
}

html.dark .landing-page .hero-summary,
html.dark .landing-page .section-head p,
html.dark .landing-page .focus-card p {
  color: #cbd5e1;
}

html.dark .landing-page .hero-kicker {
  border-color: rgba(94, 234, 212, 0.58);
  background: color-mix(in srgb, #134e4a 62%, #0f172a);
  color: #5eead4;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(94, 234, 212, 0.08);
  text-shadow: 0 1px 10px rgba(2, 6, 23, 0.72);
}

html.dark .landing-page .hero-kicker i {
  color: #5eead4;
}

html.dark .landing-page .hero-btn {
  background: #14b8a6;
  border-color: rgba(94, 234, 212, 0.28);
  color: #082f30;
}

html.dark .landing-page .hero-btn:hover {
  background: #2dd4bf;
}

html.dark .landing-page .focus-card,
html.dark .landing-page .hero-tags li {
  border-color: #1f3a4d;
  background: color-mix(in srgb, var(--bg-color, #0f172a) 90%, #06343a);
}

html.dark .landing-page .hero-tags li {
  color: #f1f5f9;
  font-weight: 700;
}

html.dark .landing-page .focus-icon {
  border-color: rgba(94, 234, 212, 0.48);
  background: color-mix(in srgb, #134e4a 58%, #0f172a);
  color: #5eead4;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.08), 0 0 14px rgba(94, 234, 212, 0.12);
}

html.dark .landing-page .panel-link,
html.dark .landing-page .panel-head h2 i,
html.dark .landing-page .hero-tags i {
  color: #5eead4;
}
</style>
