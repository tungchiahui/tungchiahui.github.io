export type LocaleSlug = 'zh-cn' | 'zh-hant' | 'zh-hk' | 'zh-tw' | 'en-us'
export type LocaleConverter = 'none' | 's2t' | 's2hk' | 's2tw' | 'en'
export type ContentSection = 'blog' | 'wiki'

export interface I18nLocale {
  code: string
  slug: LocaleSlug
  label: string
  fullLabel: string
  converter: LocaleConverter
  flags: readonly string[]
}

export interface SplitLocalePath {
  hasLocale: boolean
  localeSlug: LocaleSlug
  pathWithoutLocale: string
}

export interface ParsedContentStem {
  localeSlug: LocaleSlug
  sourceStem: string
  localizedStem: string
  isGenerated: boolean
}

export const DEFAULT_LOCALE_SLUG: LocaleSlug = 'zh-cn'
export const I18N_CONTENT_PREFIX = '_i18n'
export const FLAG_CDN_BASE = 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/countryflags/'

export const I18N_LOCALES = [
  {
    code: 'zh-CN',
    slug: 'zh-cn',
    label: '简体中文',
    fullLabel: '简体中文',
    converter: 'none',
    flags: [
      'peoples-republic-of-china-flag-png-large.webp'
    ]
  },
  {
    code: 'zh-Hant',
    slug: 'zh-hant',
    label: '繁體中文',
    fullLabel: '繁體中文',
    converter: 's2t',
    flags: [
      'peoples-republic-of-china-flag-png-large.webp'
    ]
  },
  {
    code: 'zh-HK',
    slug: 'zh-hk',
    label: '香港繁體',
    fullLabel: '繁體中文（香港）',
    converter: 's2hk',
    flags: [
      'hong-kong-sar-china-flag-png-large.webp'
    ]
  },
  {
    code: 'zh-TW',
    slug: 'zh-tw',
    label: '台灣正體',
    fullLabel: '正體中文（台灣）',
    converter: 's2tw',
    flags: [
      'peoples-republic-of-china-flag-png-large.webp'
    ]
  },
  {
    code: 'en-US',
    slug: 'en-us',
    label: 'English',
    fullLabel: 'English (US)',
    converter: 'en',
    flags: [
      'united-states-of-america-flag-png-large.webp'
    ]
  }
] as const satisfies readonly I18nLocale[]

export const I18N_LOCALE_SLUGS = I18N_LOCALES.map(locale => locale.slug)

export function isSupportedLocaleSlug(value: unknown): value is LocaleSlug {
  return I18N_LOCALE_SLUGS.includes(value as LocaleSlug)
}

export function getLocaleBySlug(slug: string | undefined): I18nLocale {
  return I18N_LOCALES.find(locale => locale.slug === slug) || I18N_LOCALES[0]
}

export function normalizeSitePath(path: unknown): string {
  const raw = String(path || '').trim()
  if (!raw) return '/'

  const withoutHash = raw.split('#')[0]
  const withoutQuery = withoutHash.split('?')[0]
  const withSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`

  return withSlash.replace(/\/+$/, '') || '/'
}

export function splitLocalePath(path: unknown): SplitLocalePath {
  const cleanPath = normalizeSitePath(path)
  const parts = cleanPath.split('/').filter(Boolean)
  const first = parts[0]

  if (isSupportedLocaleSlug(first)) {
    return {
      hasLocale: true,
      localeSlug: first,
      pathWithoutLocale: `/${parts.slice(1).join('/')}`.replace(/\/+$/, '') || '/'
    }
  }

  return {
    hasLocale: false,
    localeSlug: DEFAULT_LOCALE_SLUG,
    pathWithoutLocale: cleanPath
  }
}

export function getLocaleFromPath(path: unknown): I18nLocale {
  return getLocaleBySlug(splitLocalePath(path).localeSlug)
}

export function getCurrentLocaleSlug(path: unknown): LocaleSlug {
  return splitLocalePath(path).localeSlug
}

export function getLocaleSectionPath(localeSlug: LocaleSlug | string, section: ContentSection): string {
  return `/${getLocaleBySlug(localeSlug).slug}/${section}`
}

export function getLocalizedSearchPath(localeSlug: LocaleSlug | string): string {
  return `/${getLocaleBySlug(localeSlug).slug}/search`
}

export function replaceLocaleInPath(path: unknown, localeSlug: LocaleSlug | string): string {
  const locale = getLocaleBySlug(localeSlug).slug
  const { pathWithoutLocale } = splitLocalePath(path)

  if (pathWithoutLocale === '/') {
    return `/${locale}`
  }

  return `/${locale}${pathWithoutLocale}`
}

export function getContentPathCandidates(path: unknown, section: ContentSection): string[] {
  const cleanPath = normalizeSitePath(path)
  const { hasLocale, pathWithoutLocale } = splitLocalePath(cleanPath)
  const candidates = [cleanPath]

  if (!hasLocale && pathWithoutLocale.startsWith(`/${section}/`)) {
    candidates.push(`/${DEFAULT_LOCALE_SLUG}${pathWithoutLocale}`)
  }

  return Array.from(new Set(candidates))
}

export function getFallbackLocaleSectionPath(path: unknown, targetLocaleSlug: LocaleSlug | string): string {
  const target = getLocaleBySlug(targetLocaleSlug).slug
  const { pathWithoutLocale } = splitLocalePath(path)

  if (pathWithoutLocale === '/wiki' || pathWithoutLocale.startsWith('/wiki/')) {
    return getLocaleSectionPath(target, 'wiki')
  }

  if (pathWithoutLocale === '/search') {
    return getLocalizedSearchPath(target)
  }

  return getLocaleSectionPath(target, 'blog')
}

export function parseLocalizedContentStem(stem: unknown): ParsedContentStem | null {
  const localizedStem = String(stem || '').replace(/\\/g, '/').replace(/^\//, '').replace(/\.(md|mdc)$/i, '')

  if (!localizedStem) {
    return null
  }

  const parts = localizedStem.split('/').filter(Boolean)

  if (parts[0] === I18N_CONTENT_PREFIX) {
    const localeSlug = parts[1]

    if (!isSupportedLocaleSlug(localeSlug)) {
      return null
    }

    return {
      localeSlug,
      sourceStem: parts.slice(2).join('/'),
      localizedStem,
      isGenerated: true
    }
  }

  return {
    localeSlug: DEFAULT_LOCALE_SLUG,
    sourceStem: localizedStem,
    localizedStem,
    isGenerated: false
  }
}

export function getLocaleFlagUrl(localeSlug: LocaleSlug | string, routePath: unknown = '/'): string {
  const locale = getLocaleBySlug(localeSlug)
  const flagName = locale.flags[getDeterministicIndex(`${locale.slug}:${normalizeSitePath(routePath)}`, locale.flags.length)]

  return `${FLAG_CDN_BASE}${flagName}`
}

function getDeterministicIndex(seed: string, length: number): number {
  if (length <= 1) return 0

  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0
  }

  return Math.abs(hash) % length
}
