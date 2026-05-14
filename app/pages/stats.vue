<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#app'

interface MetricRow {
  name: string
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

interface OverviewResponse {
  summary: {
    pageviews: number
    visitors: number
    visits: number
    bounces: number
    totaltime: number
    bounceRate: number
    avgVisitDuration: number
    pagesPerVisit: number
  }
  top: {
    paths: MetricRow[]
    referrers: MetricRow[]
    channels: MetricRow[]
    countries: MetricRow[]
    regions: MetricRow[]
    cities: MetricRow[]
    browsers: MetricRow[]
    os: MetricRow[]
    devices: MetricRow[]
    events: MetricRow[]
  }
}

useHead({
  title: '📊 数据统计',
  meta: [
    {
      name: 'description',
      content: '网站访问数据统计'
    }
  ]
})

function formatNumber(value: number | undefined) {
  return Math.max(0, Number(value || 0)).toLocaleString('zh-CN')
}

function formatPercent(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return '--'
  return `${Math.round(value * 100)}%`
}

function formatDuration(seconds: number | undefined) {
  const total = Math.max(0, Math.round(Number(seconds || 0)))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  if (h > 0) return `${h}小时 ${m}分 ${s}秒`
  if (m > 0) return `${m}分 ${s}秒`
  return `${s}秒`
}

const topLimit = 12

async function loadOverviewData(): Promise<OverviewResponse> {
  const umamiRange = resolveUmamiRange()
  const [
    summary,
    paths,
    referrers,
    channels,
    countries,
    regions,
    cities,
    browsers,
    osList,
    devices,
    events
  ] = await Promise.all([
    fetchUmamiStats(umamiRange),
    fetchUmamiExpandedMetrics('path', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('referrer', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('channel', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('country', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('region', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('city', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('browser', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('os', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('device', umamiRange, { limit: topLimit }),
    fetchUmamiExpandedMetrics('event', umamiRange, { limit: topLimit })
  ])

  const visits = Math.max(summary.visits || 0, 1)
  const bounces = Math.min(summary.bounces || 0, visits)

  return {
    summary: {
      ...summary,
      bounceRate: bounces / visits,
      avgVisitDuration: (summary.totaltime || 0) / visits,
      pagesPerVisit: (summary.pageviews || 0) / visits
    },
    top: {
      paths: paths.slice(0, topLimit),
      referrers: referrers.slice(0, topLimit),
      channels: channels.slice(0, topLimit),
      countries: countries.slice(0, topLimit),
      regions: regions.slice(0, topLimit),
      cities: cities.slice(0, topLimit),
      browsers: browsers.slice(0, topLimit),
      os: osList.slice(0, topLimit),
      devices: devices.slice(0, topLimit),
      events: events.slice(0, topLimit)
    }
  }
}

const { data, pending, error, refresh } = await useAsyncData(
  'umami-overview',
  () => loadOverviewData(),
  {
    server: false,
    default: () => null
  }
)

async function handleRefresh() {
  clearUmamiClientCache()
  await refresh()
}

const summaryCards = computed(() => {
  const summary = data.value?.summary
  if (!summary) return []

  return [
    { label: '访客人数', value: formatNumber(summary.visitors) },
    { label: '访问次数', value: formatNumber(summary.visits) },
    { label: '浏览次数', value: formatNumber(summary.pageviews) },
    { label: '跳出次数', value: formatNumber(summary.bounces) },
    { label: '跳出率', value: formatPercent(summary.bounceRate) },
    { label: '平均停留', value: formatDuration(summary.avgVisitDuration) },
    { label: '平均每次浏览', value: `${summary.pagesPerVisit.toFixed(2)} 页` },
    { label: '累计停留', value: formatDuration(summary.totaltime) }
  ]
})

const sections = computed(() => {
  const top = data.value?.top
  if (!top) return []

  return [
    {
      title: '热门页面',
      rows: top.paths,
      value: (row: MetricRow) => `${formatNumber(row.pageviews)} 浏览 / ${formatNumber(row.visits)} 访问`
    },
    {
      title: '来源网站',
      rows: top.referrers,
      value: (row: MetricRow) => `${formatNumber(row.visits)} 访问`
    },
    {
      title: '渠道',
      rows: top.channels,
      value: (row: MetricRow) => `${formatNumber(row.visits)} 访问`
    },
    {
      title: '国家',
      rows: top.countries,
      value: (row: MetricRow) => `${formatNumber(row.visitors)} 访客`
    },
    {
      title: '地区',
      rows: top.regions,
      value: (row: MetricRow) => `${formatNumber(row.visitors)} 访客`
    },
    {
      title: '城市',
      rows: top.cities,
      value: (row: MetricRow) => `${formatNumber(row.visitors)} 访客`
    },
    {
      title: '浏览器',
      rows: top.browsers,
      value: (row: MetricRow) => `${formatNumber(row.visits)} 访问`
    },
    {
      title: '操作系统',
      rows: top.os,
      value: (row: MetricRow) => `${formatNumber(row.visits)} 访问`
    },
    {
      title: '设备',
      rows: top.devices,
      value: (row: MetricRow) => `${formatNumber(row.visits)} 访问`
    },
    {
      title: '事件',
      rows: top.events,
      value: (row: MetricRow) => `${formatNumber(row.pageviews)} 次`
    }
  ]
})
</script>

<template>
  <div class="stats-page">
    <header class="stats-header">
      <p class="stats-kicker">Analytics</p>
      <h1>📊 数据统计</h1>
      <p class="stats-note">以下数据来自 Umami API，支持实时刷新。</p>
      <button class="refresh-btn" type="button" :disabled="pending" @click="handleRefresh">
        {{ pending ? '刷新中...' : '刷新数据' }}
      </button>
    </header>

    <section v-if="error" class="error-box">
      <p>统计数据暂时不可用，请稍后再试。</p>
    </section>

    <section v-else-if="summaryCards.length" class="summary-grid" aria-label="全站指标">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card">
        <p class="summary-label">{{ card.label }}</p>
        <p class="summary-value">{{ card.value }}</p>
      </article>
    </section>

    <section v-else-if="pending" class="loading-box">
      <p>正在加载统计数据...</p>
    </section>

    <section v-if="sections.length" class="panel-grid">
      <article v-for="section in sections" :key="section.title" class="stats-panel">
        <h2>{{ section.title }}</h2>
        <ol v-if="section.rows.length" class="stats-list">
          <li v-for="(row, index) in section.rows" :key="`${section.title}-${row.name}-${index}`" class="stats-item">
            <span class="stats-rank">{{ index + 1 }}</span>
            <span class="stats-name">{{ row.name || '直接访问' }}</span>
            <span class="stats-value">{{ section.value(row) }}</span>
          </li>
        </ol>
        <p v-else class="empty-row">暂无数据</p>
      </article>
    </section>

    <section class="stats-frame-wrap" aria-label="Umami 共享面板">
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
  margin-bottom: 1.25rem;
}

.stats-kicker {
  margin: 0 0 0.5rem;
  color: #14b8a6;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

.stats-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}

.stats-note {
  margin: 0.65rem 0 0;
  color: var(--text-secondary, #666);
  font-size: 0.92rem;
}

.refresh-btn {
  margin-top: 0.9rem;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  color: var(--text-main, #1f1f1f);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
}

.refresh-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.summary-card {
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-secondary, #f8fafc);
  padding: 10px 12px;
}

.summary-label {
  margin: 0;
  color: var(--text-secondary, #666);
  font-size: 0.78rem;
}

.summary-value {
  margin: 6px 0 0;
  color: var(--text-main, #1f1f1f);
  font-size: 1.05rem;
  font-weight: 800;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stats-panel {
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-color, #fff);
  padding: 12px;
}

.stats-panel h2 {
  margin: 0 0 10px;
  font-size: 1rem;
}

.stats-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.stats-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 8px;
  border-radius: 6px;
  padding: 5px 6px;
  background: var(--bg-secondary, #f8fafc);
}

.stats-rank {
  color: var(--text-secondary, #666);
  font-size: 0.8rem;
  font-weight: 700;
}

.stats-name {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--text-main, #1f1f1f);
  font-size: 0.86rem;
}

.stats-value {
  color: var(--text-secondary, #666);
  font-size: 0.76rem;
  white-space: nowrap;
}

.empty-row,
.loading-box,
.error-box {
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-secondary, #666);
  padding: 0.8rem 0.9rem;
  margin-bottom: 14px;
}

.stats-frame-wrap {
  min-height: 720px;
  overflow: hidden;
  border: 1px solid var(--nav-border, #e5e7eb);
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

  .panel-grid {
    grid-template-columns: 1fr;
  }

  .stats-item {
    grid-template-columns: 24px minmax(0, 1fr);
  }

  .stats-value {
    grid-column: 2;
  }
}
</style>
