<script setup lang="ts">
import { useHead } from '#app'

useHead({
  title: '📊 数据统计',
  meta: [
    {
      name: 'description',
      content: '网站访问数据统计'
    }
  ]
})
</script>

<template>
  <div class="stats-page">
    <header class="stats-header">
      <p class="stats-kicker">Analytics</p>
      <h1>📊 数据统计</h1>
    </header>

    <section class="stats-frame-wrap" aria-label="网站访问数据统计">
      <iframe
        class="stats-frame"
        src="https://umami.tungchiahui.cn/share/rCG6EZoHmlCmNnWn"
        title="网站访问数据统计"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </section>
  </div>
</template>

<style scoped>
.stats-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.stats-header {
  margin-bottom: 1.5rem;
}

.stats-kicker {
  margin: 0 0 0.5rem;
  color: #14b8a6;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.stats-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}

.stats-frame-wrap {
  min-height: 720px;
  overflow: hidden;
  border: 1px solid var(--nav-border);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.stats-frame {
  display: block;
  width: 100%;
  min-height: 900px;
  border: 0;
}

@media (max-width: 640px) {
  .stats-page {
    padding-inline: 0.75rem;
  }

  .stats-frame-wrap {
    min-height: 680px;
  }
}
</style>
