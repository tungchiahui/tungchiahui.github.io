<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useHead } from '#app'
import {
  GOAL_WEIGHT,
  PLAN_END_DATE,
  PLAN_START_DATE,
  START_WEIGHT,
  createWeeklyRecords,
  importWeightRecordsFromCsv,
  parseIsoDate,
  weightMilestones,
  type WeightRecord
} from '~/data/weight-loss'
import { getCurrentLocaleSlug, getLocaleBySlug, replaceLocaleInPath } from '~~/utils/i18n-locales'
import { getPageCopy } from '~~/utils/i18n-page-copy'

type MetricField = 'weight' | 'bodyFat' | 'muscleMass' | 'waist' | 'note'

interface StoredPlanData {
  version: number
  records?: Array<Partial<WeightRecord> & Pick<WeightRecord, 'date'>>
}

interface ImportFeedback {
  tone: 'success' | 'error'
  text: string
}

const STORAGE_KEY = 'weight_loss_plan_v1'
const CHART_WIDTH = 960
const CHART_HEIGHT = 300
const CHART_PADDING_X = 46
const CHART_PADDING_Y = 30

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const localeCode = computed(() => getLocaleBySlug(currentLocaleSlug.value).code)
const copy = computed(() => getPageCopy('weightLoss', currentLocaleSlug.value))
const morePath = computed(() => replaceLocaleInPath('/more', currentLocaleSlug.value))

const records = ref<WeightRecord[]>(createWeeklyRecords())
const selectedRecordDate = ref(PLAN_START_DATE)
const showAllRecords = ref(false)
const hydrated = ref(false)
const csvInput = ref<HTMLInputElement | null>(null)
const importFeedback = ref<ImportFeedback | null>(null)

useHead(() => ({
  title: copy.value.metaTitle,
  meta: [
    {
      name: 'description',
      content: copy.value.metaDescription
    }
  ]
}))

const activeRecord = computed<WeightRecord>(() =>
  records.value.find(record => record.date === selectedRecordDate.value) || records.value[0]!
)

const latestRecord = computed(() => {
  let latest: WeightRecord | null = null

  for (const record of records.value) {
    if (toNumber(record.weight) !== null) latest = record
  }

  return latest
})

const latestWeight = computed(() => toNumber(latestRecord.value?.weight))
const totalChange = computed(() => {
  if (latestWeight.value === null) return null
  return Math.round((latestWeight.value - START_WEIGHT) * 10) / 10
})
const goalProgress = computed(() => {
  if (latestWeight.value === null) return 0
  return clamp(((START_WEIGHT - latestWeight.value) / (START_WEIGHT - GOAL_WEIGHT)) * 100, 0, 100)
})
const nextMilestone = computed(() => {
  const latestDate = latestRecord.value?.date || PLAN_START_DATE
  return weightMilestones.find(milestone => parseIsoDate(milestone.date) > parseIsoDate(latestDate))
    || weightMilestones[weightMilestones.length - 1]!
})

const milestoneRows = computed(() =>
  weightMilestones.map((milestone, index) => {
    const record = records.value.find(item => item.date === milestone.date)
    return {
      ...milestone,
      focus: copy.value.milestoneFocus[index],
      actual: record?.weight || '',
      result: getStatus(record?.weight || '', milestone.min, milestone.max)
    }
  })
)

const chart = computed(() => {
  const targetValues = records.value.flatMap(record => [record.targetMin, record.targetMax])
  const actualValues = records.value
    .map(record => toNumber(record.weight))
    .filter((value): value is number => value !== null)
  const minWeight = Math.floor(Math.min(GOAL_WEIGHT - 2, ...targetValues, ...actualValues))
  const maxWeight = Math.ceil(Math.max(START_WEIGHT + 1, ...targetValues, ...actualValues))
  const plotWidth = CHART_WIDTH - CHART_PADDING_X * 2
  const plotHeight = CHART_HEIGHT - CHART_PADDING_Y * 2
  const denominator = Math.max(records.value.length - 1, 1)
  const range = Math.max(maxWeight - minWeight, 1)
  const pointFor = (value: number, index: number) => ({
    x: CHART_PADDING_X + (index / denominator) * plotWidth,
    y: CHART_PADDING_Y + ((maxWeight - value) / range) * plotHeight
  })
  const targetPoints = records.value.map((record, index) =>
    pointFor((record.targetMin + record.targetMax) / 2, index)
  )
  const actualPoints = records.value.flatMap((record, index) => {
    const value = toNumber(record.weight)
    return value === null ? [] : [{ ...pointFor(value, index), value, date: record.date }]
  })
  const labels = records.value
    .map((record, index) => ({ index, date: record.date, point: pointFor(minWeight, index) }))
    .filter(item => item.index % 4 === 0 || item.index === records.value.length - 1)
  const gridValues = Array.from({ length: 6 }, (_, index) =>
    Math.round((maxWeight - ((maxWeight - minWeight) / 5) * index) * 10) / 10
  )

  return {
    minWeight,
    maxWeight,
    targetPolyline: targetPoints.map(point => `${point.x},${point.y}`).join(' '),
    actualPolyline: actualPoints.map(point => `${point.x},${point.y}`).join(' '),
    actualPoints,
    labels,
    gridValues: gridValues.map(value => ({
      value,
      y: pointFor(value, 0).y
    }))
  }
})

const planWeeks = computed(() => records.value.length - 1)

onMounted(() => {
  loadStoredData()

  const today = parseIsoDate(getLocalIsoDate())
  let closest = records.value[0]!
  for (const record of records.value) {
    if (parseIsoDate(record.date) <= today) closest = record
  }
  selectedRecordDate.value = closest.date
  hydrated.value = true
  persistData()
})

watch(records, () => {
  if (!hydrated.value) return
  persistData()
}, { deep: true })

function loadStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const stored = JSON.parse(raw) as StoredPlanData
    const storedByDate = new Map((stored.records || []).map(record => [record.date, record]))

    records.value = createWeeklyRecords().map(defaultRecord => {
      const storedRecord = storedByDate.get(defaultRecord.date)
      if (!storedRecord) return defaultRecord

      return {
        ...defaultRecord,
        weight: cleanStoredValue(storedRecord.weight, defaultRecord.weight),
        bodyFat: cleanStoredValue(storedRecord.bodyFat),
        muscleMass: cleanStoredValue(storedRecord.muscleMass),
        waist: cleanStoredValue(storedRecord.waist),
        note: cleanStoredValue(storedRecord.note)
      }
    })
  } catch {
    records.value = createWeeklyRecords()
  }
}

function persistData() {
  const payload: StoredPlanData = {
    version: 1,
    records: records.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function updateMetric(field: MetricField, event: Event) {
  const input = event.target as HTMLInputElement | HTMLTextAreaElement
  activeRecord.value[field] = input.value
}

function clearPersonalData() {
  if (!window.confirm(copy.value.clearConfirm)) return

  records.value = createWeeklyRecords()
  selectedRecordDate.value = PLAN_START_DATE
  importFeedback.value = null
  localStorage.removeItem(STORAGE_KEY)
}

function chooseCsvFile() {
  importFeedback.value = null
  csvInput.value?.click()
}

async function importCsv(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const result = importWeightRecordsFromCsv(await file.text(), records.value)

    if (result.imported === 0) {
      importFeedback.value = { tone: 'error', text: copy.value.importFailed }
      return
    }

    importFeedback.value = {
      tone: 'success',
      text: copy.value.importSuccess
        .replace('{imported}', String(result.imported))
        .replace('{skipped}', String(result.skipped))
    }
  } catch {
    importFeedback.value = { tone: 'error', text: copy.value.importReadFailed }
  } finally {
    input.value = ''
  }
}

function exportCsv() {
  const headers = [
    copy.value.date,
    copy.value.targetRange,
    copy.value.averageWeight,
    copy.value.bodyFat,
    copy.value.muscleMass,
    copy.value.waist,
    copy.value.note
  ]
  const rows = records.value.map(record => [
    record.date,
    formatRange(record.targetMin, record.targetMax),
    record.weight,
    record.bodyFat,
    record.muscleMass,
    record.waist,
    record.note
  ])
  const csv = [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `weight-loss-progress-${getLocalIsoDate()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function getStatus(weight: string, targetMin: number, targetMax: number) {
  const value = toNumber(weight)
  if (value === null) return { tone: 'pending', text: copy.value.statusPending }
  if (value < targetMin) return { tone: 'ahead', text: copy.value.statusAhead }
  if (value <= targetMax) return { tone: 'target', text: copy.value.statusOnTarget }

  return {
    tone: 'behind',
    text: copy.value.statusBehind.replace('{difference}', (value - targetMax).toFixed(1))
  }
}

function formatRange(min: number, max: number) {
  if (min === max) return `${min.toFixed(1)} kg`
  return `${min.toFixed(1)}-${max.toFixed(1)} kg`
}

function formatDate(date: string, short = false) {
  return new Intl.DateTimeFormat(localeCode.value, short
    ? { month: 'short', day: 'numeric', timeZone: 'UTC' }
    : { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  ).format(new Date(`${date}T00:00:00Z`))
}

function getLocalIsoDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function cleanStoredValue(value: unknown, fallback = '') {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback
}

function toNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function escapeCsv(value: string | number) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
</script>

<template>
  <div class="weight-loss-page">
    <nav class="weight-nav" :aria-label="copy.navLabel">
      <NuxtLink :to="morePath">{{ copy.backMore }}</NuxtLink>
      <span aria-hidden="true"></span>
      <strong>{{ copy.navCurrent }}</strong>
    </nav>

    <header class="weight-hero">
      <div class="weight-hero-copy">
        <p class="weight-eyebrow">{{ copy.eyebrow }}</p>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.intro }}</p>
      </div>

      <div class="weight-goal-grid">
        <div>
          <span>{{ copy.startWeight }}</span>
          <strong>{{ START_WEIGHT }}<small> kg</small></strong>
        </div>
        <div>
          <span>{{ copy.firstGoal }}</span>
          <strong>90<small> kg</small></strong>
        </div>
        <div>
          <span>{{ copy.finalGoal }}</span>
          <strong>{{ GOAL_WEIGHT }}<small> kg</small></strong>
        </div>
        <div>
          <span>{{ copy.planDuration }}</span>
          <strong>{{ planWeeks }}<small> {{ copy.weeks }}</small></strong>
        </div>
      </div>
    </header>

    <section class="weight-summary-grid" aria-label="Progress summary">
      <article>
        <span>{{ copy.currentWeight }}</span>
        <strong>{{ latestWeight === null ? copy.noRecord : `${latestWeight.toFixed(1)} kg` }}</strong>
        <small v-if="latestRecord">{{ formatDate(latestRecord.date) }}</small>
      </article>
      <article>
        <span>{{ copy.totalChange }}</span>
        <strong>{{ totalChange === null ? copy.noRecord : `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg` }}</strong>
        <small>{{ START_WEIGHT }} kg → {{ GOAL_WEIGHT }} kg</small>
      </article>
      <article class="progress-summary">
        <span>{{ copy.goalProgress }}</span>
        <strong>{{ goalProgress.toFixed(0) }}%</strong>
        <div class="summary-progress"><i :style="{ width: `${goalProgress}%` }"></i></div>
      </article>
      <article>
        <span>{{ copy.nextMilestone }}</span>
        <strong>{{ formatRange(nextMilestone.min, nextMilestone.max) }}</strong>
        <small>{{ formatDate(nextMilestone.date) }}</small>
      </article>
    </section>

    <aside class="health-notice">
      <i class="fa-solid fa-heart-pulse" aria-hidden="true"></i>
      <div>
        <h2>{{ copy.healthTitle }}</h2>
        <p>{{ copy.healthBody }}</p>
        <a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html" target="_blank" rel="noopener noreferrer">
          {{ copy.healthSource }}
          <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
        </a>
      </div>
    </aside>

    <section class="weight-panel plan-panel" aria-labelledby="plan-title">
      <div class="panel-heading">
        <div>
          <p class="weight-eyebrow">Plan</p>
          <h2 id="plan-title">{{ copy.planTitle }}</h2>
        </div>
      </div>

      <div class="plan-grid">
        <article>
          <i class="fa-solid fa-sun" aria-hidden="true"></i>
          <h3>{{ copy.summerPlan }}</h3>
          <dl>
            <div><dt>{{ copy.calories }}</dt><dd>{{ copy.summerCalories }}</dd></div>
            <div><dt>{{ copy.activity }}</dt><dd>{{ copy.summerActivity }}</dd></div>
            <div><dt>{{ copy.meals }}</dt><dd>{{ copy.summerMeals }}</dd></div>
          </dl>
        </article>
        <article>
          <i class="fa-solid fa-person-running" aria-hidden="true"></i>
          <h3>{{ copy.schoolPlan }}</h3>
          <dl>
            <div><dt>{{ copy.calories }}</dt><dd>{{ copy.schoolCalories }}</dd></div>
            <div><dt>{{ copy.activity }}</dt><dd>{{ copy.schoolActivity }}</dd></div>
            <div><dt>{{ copy.meals }}</dt><dd>{{ copy.schoolMeals }}</dd></div>
          </dl>
        </article>
        <article>
          <i class="fa-solid fa-couch" aria-hidden="true"></i>
          <h3>{{ copy.restPlan }}</h3>
          <dl>
            <div><dt>{{ copy.calories }}</dt><dd>{{ copy.restCalories }}</dd></div>
            <div><dt>{{ copy.activity }}</dt><dd>{{ copy.restActivity }}</dd></div>
            <div><dt>{{ copy.meals }}</dt><dd>{{ copy.restMeals }}</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <section class="weight-panel record-panel" aria-labelledby="record-title">
      <div class="panel-heading record-heading">
        <div>
          <p class="weight-eyebrow">Track</p>
          <h2 id="record-title">{{ copy.recordTitle }}</h2>
          <p>{{ copy.recordDescription }}</p>
        </div>
        <span class="save-state"><i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i>{{ copy.autoSaved }}</span>
      </div>

      <div class="record-toolbar">
        <label>
          <span>{{ copy.selectWeek }}</span>
          <select v-model="selectedRecordDate">
            <option v-for="(record, index) in records" :key="record.date" :value="record.date">
              {{ copy.tableWeek }} {{ index + 1 }} · {{ formatDate(record.date) }}
            </option>
          </select>
        </label>
        <div class="target-chip">
          <span>{{ copy.targetRange }}</span>
          <strong>{{ formatRange(activeRecord.targetMin, activeRecord.targetMax) }}</strong>
        </div>
        <div class="status-chip" :class="`tone-${getStatus(activeRecord.weight, activeRecord.targetMin, activeRecord.targetMax).tone}`">
          <span>{{ copy.recordStatus }}</span>
          <strong>{{ getStatus(activeRecord.weight, activeRecord.targetMin, activeRecord.targetMax).text }}</strong>
        </div>
      </div>

      <div class="metric-form">
        <label>
          <span>{{ copy.averageWeight }}</span>
          <div class="input-unit">
            <input
              :value="activeRecord.weight"
              type="number"
              min="35"
              max="250"
              step="0.1"
              inputmode="decimal"
              @input="updateMetric('weight', $event)"
            >
            <b>{{ copy.weightUnit }}</b>
          </div>
        </label>
        <label>
          <span>{{ copy.bodyFat }} <small>{{ copy.optional }}</small></span>
          <div class="input-unit">
            <input
              :value="activeRecord.bodyFat"
              type="number"
              min="2"
              max="70"
              step="0.1"
              inputmode="decimal"
              @input="updateMetric('bodyFat', $event)"
            >
            <b>{{ copy.percentUnit }}</b>
          </div>
        </label>
        <label>
          <span>{{ copy.muscleMass }} <small>{{ copy.optional }}</small></span>
          <div class="input-unit">
            <input
              :value="activeRecord.muscleMass"
              type="number"
              min="10"
              max="100"
              step="0.1"
              inputmode="decimal"
              @input="updateMetric('muscleMass', $event)"
            >
            <b>{{ copy.weightUnit }}</b>
          </div>
        </label>
        <label>
          <span>{{ copy.waist }} <small>{{ copy.optional }}</small></span>
          <div class="input-unit">
            <input
              :value="activeRecord.waist"
              type="number"
              min="40"
              max="200"
              step="0.1"
              inputmode="decimal"
              @input="updateMetric('waist', $event)"
            >
            <b>{{ copy.waistUnit }}</b>
          </div>
        </label>
        <label class="note-field">
          <span>{{ copy.note }} <small>{{ copy.optional }}</small></span>
          <textarea
            :value="activeRecord.note"
            rows="2"
            :placeholder="copy.notePlaceholder"
            @input="updateMetric('note', $event)"
          ></textarea>
        </label>
      </div>

      <div class="record-actions">
        <p><i class="fa-solid fa-lock" aria-hidden="true"></i>{{ copy.dataNote }}</p>
        <div>
          <input
            ref="csvInput"
            class="csv-file-input"
            type="file"
            accept=".csv,text/csv"
            @change="importCsv"
          >
          <button type="button" class="secondary-button" @click="chooseCsvFile">
            <i class="fa-solid fa-file-import" aria-hidden="true"></i>{{ copy.importCsv }}
          </button>
          <button type="button" class="secondary-button" @click="exportCsv">
            <i class="fa-solid fa-file-export" aria-hidden="true"></i>{{ copy.exportCsv }}
          </button>
          <button type="button" class="danger-button" @click="clearPersonalData">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>{{ copy.clearData }}
          </button>
        </div>
      </div>
      <p
        v-if="importFeedback"
        class="import-feedback"
        :class="`tone-${importFeedback.tone}`"
        role="status"
      >
        <i
          :class="importFeedback.tone === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'"
          aria-hidden="true"
        ></i>
        {{ importFeedback.text }}
      </p>
    </section>

    <section class="weight-panel trend-panel" aria-labelledby="trend-title">
      <div class="panel-heading">
        <div>
          <p class="weight-eyebrow">Trend</p>
          <h2 id="trend-title">{{ copy.trendTitle }}</h2>
          <p>{{ copy.trendDescription }}</p>
        </div>
        <div class="chart-legend">
          <span><i class="target-dot"></i>{{ copy.targetLine }}</span>
          <span><i class="actual-dot"></i>{{ copy.actualLine }}</span>
        </div>
      </div>

      <div class="chart-scroll">
        <svg
          class="weight-chart"
          :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
          role="img"
          :aria-label="copy.trendTitle"
        >
          <g v-for="grid in chart.gridValues" :key="grid.value">
            <line :x1="CHART_PADDING_X" :x2="CHART_WIDTH - CHART_PADDING_X" :y1="grid.y" :y2="grid.y" class="chart-grid-line" />
            <text :x="CHART_PADDING_X - 10" :y="grid.y + 4" text-anchor="end" class="chart-axis-label">{{ grid.value }}</text>
          </g>
          <polyline :points="chart.targetPolyline" class="target-line" />
          <polyline v-if="chart.actualPoints.length > 1" :points="chart.actualPolyline" class="actual-line" />
          <circle
            v-for="point in chart.actualPoints"
            :key="point.date"
            :cx="point.x"
            :cy="point.y"
            r="4.5"
            class="actual-point"
          >
            <title>{{ formatDate(point.date) }} · {{ point.value.toFixed(1) }} kg</title>
          </circle>
          <g v-for="label in chart.labels" :key="label.date">
            <text :x="label.point.x" :y="CHART_HEIGHT - 8" text-anchor="middle" class="chart-axis-label">{{ formatDate(label.date, true) }}</text>
          </g>
        </svg>
      </div>
    </section>

    <section class="weight-panel milestone-panel" aria-labelledby="milestone-title">
      <div class="panel-heading">
        <div>
          <p class="weight-eyebrow">Milestones</p>
          <h2 id="milestone-title">{{ copy.milestoneTitle }}</h2>
          <p>{{ copy.milestoneDescription }}</p>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{{ copy.stage }}</th>
              <th>{{ copy.date }}</th>
              <th>{{ copy.targetRange }}</th>
              <th>{{ copy.actual }}</th>
              <th>{{ copy.status }}</th>
              <th>{{ copy.focus }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in milestoneRows" :key="row.date">
              <td><b>{{ row.stage === 0 ? copy.startPoint : row.stage }}</b></td>
              <td>{{ formatDate(row.date) }}</td>
              <td><strong>{{ formatRange(row.min, row.max) }}</strong></td>
              <td>{{ row.actual ? `${Number(row.actual).toFixed(1)} kg` : '—' }}</td>
              <td><span class="table-status" :class="`tone-${row.result.tone}`">{{ row.result.text }}</span></td>
              <td>{{ row.focus }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="weight-panel all-records-panel" aria-labelledby="all-records-title">
      <button
        type="button"
        class="records-toggle"
        :aria-expanded="showAllRecords"
        aria-controls="all-records-table"
        @click="showAllRecords = !showAllRecords"
      >
        <span>
          <i class="fa-solid fa-table-list" aria-hidden="true"></i>
          <strong id="all-records-title">{{ copy.allRecords }}</strong>
        </span>
        <span>{{ showAllRecords ? copy.hideRecords : copy.showRecords }} <i class="fa-solid fa-chevron-down" :class="{ rotated: showAllRecords }" aria-hidden="true"></i></span>
      </button>

      <div v-if="showAllRecords" id="all-records-table" class="table-scroll weekly-record-table">
        <table>
          <thead>
            <tr>
              <th>{{ copy.tableWeek }}</th>
              <th>{{ copy.date }}</th>
              <th>{{ copy.targetRange }}</th>
              <th>{{ copy.averageWeight }}</th>
              <th>{{ copy.bodyFat }}</th>
              <th>{{ copy.muscleMass }}</th>
              <th>{{ copy.waist }}</th>
              <th>{{ copy.status }}</th>
              <th>{{ copy.note }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in records" :key="record.date">
              <td>{{ index + 1 }}</td>
              <td>{{ formatDate(record.date) }}</td>
              <td>{{ formatRange(record.targetMin, record.targetMax) }}</td>
              <td><input v-model="record.weight" type="number" step="0.1" inputmode="decimal" :aria-label="copy.averageWeight"></td>
              <td><input v-model="record.bodyFat" type="number" step="0.1" inputmode="decimal" :aria-label="copy.bodyFat"></td>
              <td><input v-model="record.muscleMass" type="number" step="0.1" inputmode="decimal" :aria-label="copy.muscleMass"></td>
              <td><input v-model="record.waist" type="number" step="0.1" inputmode="decimal" :aria-label="copy.waist"></td>
              <td><span class="table-status" :class="`tone-${getStatus(record.weight, record.targetMin, record.targetMax).tone}`">{{ getStatus(record.weight, record.targetMin, record.targetMax).text }}</span></td>
              <td><input v-model="record.note" type="text" :placeholder="copy.optional" :aria-label="copy.note"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
