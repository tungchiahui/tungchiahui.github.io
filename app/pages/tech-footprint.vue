<script setup lang="ts">
import { useHead } from '#app'
import { computed, ref } from 'vue'
import { getCurrentLocaleSlug, replaceLocaleInPath } from '~~/utils/i18n-locales'
import { getPageCopy } from '~~/utils/i18n-page-copy'
import {
  featuredTools,
  knowledgeTags,
  maintenanceNotes,
  portfolioTracks,
  priorityConfig,
  routeIntro,
  routePriorityGroups,
  routeProgressStats,
  routeSections,
  routeTasks,
  taskStatusConfig
} from '~/data/tech-footprint.js'

type ViewKey = 'tasks' | 'stages' | 'archive'

const route = useRoute()
const activeView = ref<ViewKey>('tasks')
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const copy = computed(() => getPageCopy('techFootprint', currentLocaleSlug.value))
const homePath = computed(() => replaceLocaleInPath('/', currentLocaleSlug.value))

useHead(() => ({
  title: copy.value.metaTitle,
  meta: [
    {
      name: 'description',
      content: copy.value.metaDescription
    }
  ]
}))

const viewTabs = computed<Array<{ key: ViewKey; label: string; eyebrow: string }>>(() => [
  { key: 'tasks', label: copy.value.tabs.tasks, eyebrow: formatCopy(copy.value.tabs.tasksEyebrow, { count: routeTasks.length }) },
  { key: 'stages', label: copy.value.tabs.stages, eyebrow: formatCopy(copy.value.tabs.stagesEyebrow, { count: routeSections.length }) },
  { key: 'archive', label: copy.value.tabs.archive, eyebrow: copy.value.tabs.archiveEyebrow }
])

const sortedTasks = computed(() => [...routeTasks].sort((a, b) => a.order - b.order))

const sectionedTasks = computed(() =>
  routeSections
    .map(section => ({
      ...section,
      tasks: sortedTasks.value.filter(task => task.section === section.id)
    }))
    .filter(section => section.tasks.length > 0)
)

const architectureNodes = computed(() =>
  routeSections.map(section => ({
    title: section.title,
    subtitle: section.modules.slice(0, 3).join(' / '),
    points: section.deliverables
  }))
)

const coreCount = computed(() => routeTasks.filter(task => task.priority === 'core').length)
const doingCount = computed(() => routeTasks.filter(task => task.status === 'doing').length)
const doneCount = computed(() => routeTasks.filter(task => task.status === 'done').length)

const getPriority = (priority: keyof typeof priorityConfig) => priorityConfig[priority]
const getStatus = (status: keyof typeof taskStatusConfig) => taskStatusConfig[status]

function formatCopy(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  )
}
</script>

<template>
  <div class="tech-footprint-page">
    <nav class="route-nav" :aria-label="copy.navLabel">
      <NuxtLink :to="homePath" class="back-link">{{ copy.backHome }}</NuxtLink>
      <span class="nav-divider"></span>
      <span class="nav-current">{{ copy.navCurrent }}</span>
    </nav>

    <header class="route-hero">
      <div class="hero-copy">
        <p class="hero-badge">{{ routeIntro.badge }}</p>
        <h1>{{ routeIntro.title }}</h1>
        <p class="hero-summary">{{ routeIntro.summary }}</p>

        <div class="track-panel">
          <div>
            <span class="track-label">{{ copy.mainTrack }}</span>
            <p>{{ routeIntro.mainTrack }}</p>
          </div>
          <div>
            <span class="track-label">{{ copy.sideTrack }}</span>
            <p>{{ routeIntro.sideTrack }}</p>
          </div>
        </div>
      </div>

      <aside class="hero-card" :aria-label="copy.goalLabel">
        <span class="hero-card-kicker">{{ copy.goalLabel }}</span>
        <p>{{ routeIntro.finalGoal }}</p>
        <div class="hero-metrics">
          <div v-for="stat in routeProgressStats" :key="stat.label" class="metric-item">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
            <small>{{ stat.caption }}</small>
          </div>
        </div>
      </aside>
    </header>

    <section class="tool-strip" :aria-label="copy.toolchainLabel">
      <div v-for="tool in featuredTools" :key="tool.name" class="tool-item">
        <img :src="tool.logo" :alt="tool.name" loading="lazy" />
        <div>
          <strong>{{ tool.name }}</strong>
          <span>{{ tool.role }}</span>
        </div>
      </div>
    </section>

    <section class="architecture-section" aria-labelledby="architecture-title">
      <div class="section-heading">
        <p class="section-kicker">{{ copy.systemMap }}</p>
        <h2 id="architecture-title">{{ copy.architectureTitle }}</h2>
        <p>{{ copy.architectureDescription }}</p>
      </div>

      <div class="architecture-grid">
        <article v-for="(node, index) in architectureNodes" :key="node.title" class="architecture-card">
          <span class="node-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <h3>{{ node.title }}</h3>
          <p class="node-subtitle">{{ node.subtitle }}</p>
          <ul>
            <li v-for="point in node.points" :key="point">{{ point }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="roadmap-section" aria-labelledby="roadmap-title">
      <div class="roadmap-header">
        <div>
          <p class="section-kicker">{{ copy.checklist }}</p>
          <h2 id="roadmap-title">{{ copy.roadmapTitle }}</h2>
          <p>
            {{ formatCopy(copy.roadmapDescription, { total: routeTasks.length, core: coreCount }) }}
          </p>
        </div>

        <div class="todo-summary" :aria-label="copy.taskStatsLabel">
          <div>
            <strong>{{ routeTasks.length }}</strong>
            <span>{{ copy.totalTasks }}</span>
          </div>
          <div>
            <strong>{{ coreCount }}</strong>
            <span>{{ copy.coreTasks }}</span>
          </div>
          <div>
            <strong>{{ doingCount }}</strong>
            <span>{{ copy.doingTasks }}</span>
          </div>
          <div>
            <strong>{{ doneCount }}</strong>
            <span>{{ copy.doneTasks }}</span>
          </div>
        </div>

        <div class="view-switch" role="tablist" :aria-label="copy.roadmapViewLabel">
          <button
            v-for="tab in viewTabs"
            :key="tab.key"
            type="button"
            role="tab"
            :aria-selected="activeView === tab.key"
            class="view-tab"
            :class="{ active: activeView === tab.key }"
            @click="activeView = tab.key"
          >
            <span>{{ tab.eyebrow }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div v-if="activeView === 'tasks'" class="project-lanes">
        <section v-for="section in sectionedTasks" :key="section.id" class="period-lane">
          <div class="period-heading">
            <span>{{ section.stage }}</span>
            <h3>{{ section.title }}</h3>
            <p>{{ section.focus }}</p>
          </div>

          <div class="period-projects">
            <article
              v-for="task in section.tasks"
              :key="task.id"
              class="project-card"
              :class="'priority-' + getPriority(task.priority).tone"
            >
              <div class="project-topline">
                <div class="todo-title-line">
                  <span class="project-check" :class="'status-' + task.status" aria-hidden="true">
                    <span v-if="task.status === 'done'">✓</span>
                  </span>
                  <span class="project-index">{{ copy.taskPrefix }} {{ String(task.order).padStart(2, '0') }}</span>
                </div>
                <div class="project-pills">
                  <span class="status-pill" :style="{ color: getStatus(task.status).color }">
                    {{ getStatus(task.status).label }}
                  </span>
                  <span class="priority-pill">{{ getPriority(task.priority).label }}</span>
                </div>
              </div>

              <h4>{{ task.title }}</h4>
              <p class="project-goal">{{ task.goal }}</p>

              <div class="project-stack">
                <span v-for="item in task.stack" :key="item">{{ item }}</span>
              </div>

              <ul class="project-outcomes">
                <li v-for="item in task.checklist" :key="item">
                  <span class="todo-checkbox" aria-hidden="true"></span>
                  {{ item }}
                </li>
              </ul>
            </article>
          </div>
        </section>
      </div>

      <div v-else-if="activeView === 'stages'" class="stage-timeline">
        <article v-for="stage in routeSections" :key="stage.id" class="stage-card">
          <div class="stage-marker">
            <span>{{ stage.stage }}</span>
          </div>

          <div class="stage-content">
            <h3>{{ stage.title }}</h3>
            <p class="stage-focus">{{ stage.focus }}</p>

            <div class="module-cloud">
              <span v-for="module in stage.modules" :key="module">{{ module }}</span>
            </div>

            <div class="deliverable-list">
              <strong>{{ copy.deliverables }}</strong>
              <ul>
                <li v-for="item in stage.deliverables" :key="item">
                  <span class="todo-checkbox" aria-hidden="true"></span>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="route-archive-board">
        <div class="portfolio-grid">
          <article v-for="track in portfolioTracks" :key="track.title" class="portfolio-card">
            <h3>{{ track.title }}</h3>
            <p>{{ track.description }}</p>
            <div class="portfolio-tags">
              <span v-for="skill in track.skills" :key="skill">{{ skill }}</span>
            </div>
          </article>
        </div>

        <div class="route-archive-columns">
          <section class="keyword-panel">
            <h3>{{ copy.keywordsTitle }}</h3>
            <div class="keyword-groups">
              <div v-for="group in knowledgeTags" :key="group.title" class="keyword-group">
                <strong>{{ group.title }}</strong>
                <div>
                  <span v-for="keyword in group.keywords" :key="keyword">{{ keyword }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="role-panel">
            <h3>{{ copy.maintenanceTitle }}</h3>
            <div class="maintenance-groups">
              <div v-for="group in maintenanceNotes" :key="group.title" class="maintenance-group">
                <strong>{{ group.title }}</strong>
                <ul>
                  <li v-for="note in group.notes" :key="note">{{ note }}</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>

    <section class="priority-section" aria-labelledby="priority-title">
      <div class="section-heading compact">
        <p class="section-kicker">{{ copy.priority }}</p>
        <h2 id="priority-title">{{ copy.priorityTitle }}</h2>
        <p>{{ copy.priorityDescription }}</p>
      </div>

      <div class="priority-grid">
        <article
          v-for="group in routePriorityGroups"
          :key="group.title"
          class="priority-card"
          :class="'priority-' + getPriority(group.priority).tone"
        >
          <div class="priority-card-head">
            <span>{{ getPriority(group.priority).label }}</span>
            <h3>{{ group.title }}</h3>
          </div>
          <p>{{ getPriority(group.priority).description }}</p>
          <ol>
            <li v-for="item in group.items" :key="item">{{ item }}</li>
          </ol>
        </article>
      </div>
    </section>
  </div>
</template>

<style src="~/assets/css/tech-footprint.css" scoped></style>
