interface UmamiShareToken {
  websiteId: string
  token: string
}

export interface UmamiMetricRow {
  name: string
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

export interface UmamiStatsResponse {
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
  comparison: {
    pageviews: number
    visitors: number
    visits: number
    bounces: number
    totaltime: number
  }
}

interface UmamiClientConfig {
  baseUrl: string
  shareId: string
  startAt: string | number
  pathLimit: number
}

export interface UmamiRange {
  startAt: number
  endAt: number
}

const SHARE_TOKEN_HEADER = 'x-umami-share-token'
const shareTokenCache = new Map<string, UmamiShareToken>()
const metricsCache = new Map<string, UmamiMetricRow[]>()
const statsCache = new Map<string, UmamiStatsResponse>()
const cacheTimeStore = new Map<string, number>()
const CACHE_TTL_MS = 60 * 1000

function asNumber(value: number | string | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeBaseUrl(url: string): string {
  return String(url || '').replace(/\/+$/, '')
}

function normalizePath(path: string): string {
  const clean = String(path || '/').trim()
  if (!clean) return '/'
  const withSlash = clean.startsWith('/') ? clean : `/${clean}`
  return withSlash.replace(/\/+$/, '') || '/'
}

function parseBoundary(input: string | number | undefined, fallback: number): number {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input
  }

  if (typeof input === 'string') {
    const n = Number(input)
    if (Number.isFinite(n)) {
      return n
    }

    const timestamp = Date.parse(input)
    if (Number.isFinite(timestamp)) {
      return timestamp
    }
  }

  return fallback
}

function getUmamiConfig(): UmamiClientConfig {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public || {}
  const umamiConfig = (publicConfig as any).umami || {}

  return {
    baseUrl: normalizeBaseUrl(umamiConfig.baseUrl || 'https://umami.tungchiahui.cn'),
    shareId: String(umamiConfig.shareId || 'rCG6EZoHmlCmNnWn'),
    startAt: umamiConfig.startAt || '2024-01-01T00:00:00.000Z',
    pathLimit: Number.isFinite(Number(umamiConfig.pathLimit)) ? Number(umamiConfig.pathLimit) : 5000
  }
}

export function resolveUmamiRange(startAtInput?: string | number, endAtInput?: string | number): UmamiRange {
  const config = getUmamiConfig()
  const now = Date.now()
  const fallbackStartAt = parseBoundary(config.startAt, now - 365 * 24 * 60 * 60 * 1000)
  const startAt = parseBoundary(startAtInput, fallbackStartAt)
  const endAt = parseBoundary(endAtInput, now)

  return endAt >= startAt
    ? { startAt, endAt }
    : { startAt, endAt: startAt }
}

async function getShareToken(forceRefresh = false): Promise<UmamiShareToken> {
  const config = getUmamiConfig()
  const cacheKey = `${config.baseUrl}::${config.shareId}`
  if (!forceRefresh) {
    const cached = shareTokenCache.get(cacheKey)
    if (cached) return cached
  }

  const token = await $fetch<UmamiShareToken>(`${config.baseUrl}/api/share/${config.shareId}`)
  shareTokenCache.set(cacheKey, token)
  return token
}

async function umamiApiFetch<T>(
  path: string,
  query: Record<string, string | number | undefined>
): Promise<T> {
  const config = getUmamiConfig()
  const shareToken = await getShareToken()
  const endpoint = `${config.baseUrl}/api${path}`

  try {
    return await $fetch<T>(endpoint, {
      query,
      headers: {
        [SHARE_TOKEN_HEADER]: shareToken.token
      }
    })
  } catch (error: any) {
    const status = Number(error?.statusCode || error?.status || 0)
    if (status === 401 || status === 403) {
      const refreshedToken = await getShareToken(true)
      return await $fetch<T>(endpoint, {
        query,
        headers: {
          [SHARE_TOKEN_HEADER]: refreshedToken.token
        }
      })
    }
    throw error
  }
}

function toMetricRow(row: any): UmamiMetricRow {
  return {
    name: String(row?.name || ''),
    pageviews: asNumber(row?.pageviews),
    visitors: asNumber(row?.visitors),
    visits: asNumber(row?.visits),
    bounces: asNumber(row?.bounces),
    totaltime: asNumber(row?.totaltime)
  }
}

export function normalizeUmamiPath(path: string): string {
  return normalizePath(path)
}

function readCachedValue<T>(key: string, map: Map<string, T>): T | null {
  const updatedAt = cacheTimeStore.get(key)
  if (!updatedAt) return null

  if (Date.now() - updatedAt > CACHE_TTL_MS) {
    cacheTimeStore.delete(key)
    map.delete(key)
    return null
  }

  return map.get(key) || null
}

function saveCachedValue<T>(key: string, value: T, map: Map<string, T>) {
  cacheTimeStore.set(key, Date.now())
  map.set(key, value)
}

export function clearUmamiClientCache() {
  shareTokenCache.clear()
  metricsCache.clear()
  statsCache.clear()
  cacheTimeStore.clear()
}

export async function fetchUmamiStats(range: UmamiRange): Promise<UmamiStatsResponse> {
  const config = getUmamiConfig()
  const share = await getShareToken()
  const cacheKey = `${share.websiteId}|stats|${range.startAt}|${range.endAt}`
  const cached = readCachedValue(cacheKey, statsCache)
  if (cached) return cached

  const stats = await umamiApiFetch<UmamiStatsResponse>(
    `/websites/${share.websiteId}/stats`,
    {
      startAt: range.startAt,
      endAt: range.endAt
    }
  )

  saveCachedValue(cacheKey, stats, statsCache)
  return stats
}

export async function fetchUmamiExpandedMetrics(
  type: string,
  range: UmamiRange,
  extraQuery: Record<string, string | number | undefined> = {}
): Promise<UmamiMetricRow[]> {
  const config = getUmamiConfig()
  const share = await getShareToken()
  const cacheKey = `${share.websiteId}|expanded|${type}|${range.startAt}|${range.endAt}|${JSON.stringify(extraQuery)}`
  const cached = readCachedValue(cacheKey, metricsCache)
  if (cached) return cached

  const rows = await umamiApiFetch<any[]>(
    `/websites/${share.websiteId}/metrics/expanded`,
    {
      type,
      startAt: range.startAt,
      endAt: range.endAt,
      ...extraQuery
    }
  )

  const normalizedRows = (rows || []).map(toMetricRow)
  saveCachedValue(cacheKey, normalizedRows, metricsCache)
  return normalizedRows
}

export async function fetchUmamiPathStats(path: string, range: UmamiRange): Promise<UmamiMetricRow> {
  const normalizedPath = normalizePath(path)
  const rows = await fetchUmamiExpandedMetrics('path', range, {
    path: normalizedPath,
    limit: 1
  })

  return rows[0] || {
    name: normalizedPath,
    pageviews: 0,
    visitors: 0,
    visits: 0,
    bounces: 0,
    totaltime: 0
  }
}

export function sumUmamiRows(rows: Array<Partial<UmamiMetricRow> | null | undefined>): UmamiMetricRow {
  return rows.reduce<UmamiMetricRow>((total, row) => {
    if (!row) return total

    total.pageviews += asNumber(row.pageviews)
    total.visitors += asNumber(row.visitors)
    total.visits += asNumber(row.visits)
    total.bounces += asNumber(row.bounces)
    total.totaltime += asNumber(row.totaltime)

    return total
  }, {
    name: '',
    pageviews: 0,
    visitors: 0,
    visits: 0,
    bounces: 0,
    totaltime: 0
  })
}

export async function fetchUmamiPathsStats(paths: string[], range: UmamiRange): Promise<UmamiMetricRow> {
  const uniquePaths = Array.from(new Set(paths.map(normalizePath).filter(Boolean)))

  if (!uniquePaths.length) {
    return {
      name: '',
      pageviews: 0,
      visitors: 0,
      visits: 0,
      bounces: 0,
      totaltime: 0
    }
  }

  const pathMap = await fetchUmamiPathMetricsMapForPaths(uniquePaths, range)
  const total = sumUmamiRows(uniquePaths.map(path => pathMap.get(path)))
  total.name = uniquePaths.join(',')

  return total
}

export async function fetchUmamiPathMetricsMap(range: UmamiRange): Promise<Map<string, UmamiMetricRow>> {
  const config = getUmamiConfig()
  const rows = await fetchUmamiExpandedMetrics('path', range, {
    limit: config.pathLimit
  })

  const map = new Map<string, UmamiMetricRow>()
  rows.forEach((row) => {
    map.set(normalizePath(row.name), row)
  })
  return map
}

export async function fetchUmamiPathMetricsMapForPaths(paths: string[], range: UmamiRange): Promise<Map<string, UmamiMetricRow>> {
  const uniquePaths = Array.from(new Set(paths.map(normalizePath).filter(Boolean)))
  const map = new Map<string, UmamiMetricRow>()

  if (!uniquePaths.length) {
    return map
  }

  const baseMap = await fetchUmamiPathMetricsMap(range)
  uniquePaths.forEach((path) => {
    const row = baseMap.get(path)
    if (row) {
      map.set(path, row)
    }
  })

  const missingPaths = uniquePaths.filter(path => !map.has(path))
  if (!missingPaths.length) {
    return map
  }

  const missingRows = await Promise.all(
    missingPaths.map(async (path) => {
      const row = await fetchUmamiPathStats(path, range).catch(() => ({
        name: path,
        pageviews: 0,
        visitors: 0,
        visits: 0,
        bounces: 0,
        totaltime: 0
      }))
      return [path, row] as const
    })
  )

  missingRows.forEach(([path, row]) => {
    map.set(path, row)
  })

  return map
}
