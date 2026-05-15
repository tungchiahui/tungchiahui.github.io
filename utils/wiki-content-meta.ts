import { pinyin } from 'pinyin-pro'
import {
  DEFAULT_LOCALE_SLUG,
  getLocaleBySlug,
  normalizeSitePath,
  parseLocalizedContentStem,
  splitLocalePath,
  type LocaleSlug
} from './i18n-locales'

const WIKI_STEM_PREFIX = 'wiki/'
const POST_STEM_PREFIX = 'posts/'

export interface LocalizedContentMeta {
  path: string
  locale: string
  localeSlug: LocaleSlug
  i18nKey: string
  canonicalPath: string
  sourcePath: string
  sourceStem: string
  legacyPath?: string
}

export interface WikiContentMeta extends LocalizedContentMeta {
  chapter?: string
  chapterSort: number
  date?: string
  docKey: string
  docI18nKey: string
  docRoot: string
  docTitle: string
  isWikiDoc: boolean
  isWikiIndex: boolean
  wikiDepth: number
}

export interface PostContentMeta extends LocalizedContentMeta {
  isBlogPost: boolean
}

export function getLocalizedContentMeta(
  stem?: string,
  content: Record<string, unknown> = {}
): LocalizedContentMeta | WikiContentMeta | PostContentMeta | null {
  return getWikiContentMeta(stem) || getPostContentMeta(stem, content)
}

export function getWikiContentMeta(stem?: string): WikiContentMeta | null {
  const parsedStem = parseLocalizedContentStem(stem)

  if (!parsedStem?.sourceStem.startsWith(WIKI_STEM_PREFIX)) {
    return null
  }

  const parts = parsedStem.sourceStem.split('/')

  if (parts.length < 3) {
    return null
  }

  const rawDocKey = parts[1]
  const docSlug = toPinyinSlug(rawDocKey)
  const rawFileName = parts.at(-1) || ''
  const isWikiIndex = rawFileName === 'index'
  const chapter = parseChapter(rawFileName)
  const slugParts = parts.slice(2).map(toPinyinSlug)

  if (slugParts.at(-1) === 'index') {
    slugParts.pop()
  }

  const localeSlug = parsedStem.localeSlug
  const locale = getLocaleBySlug(localeSlug)
  const sourcePath = `/${['wiki', docSlug, ...slugParts].filter(Boolean).join('/')}`
  const localizedPath = `/${[localeSlug, 'wiki', docSlug, ...slugParts].filter(Boolean).join('/')}`
  const docRoot = `/${[localeSlug, 'wiki', docSlug].join('/')}`
  const docI18nKey = `wiki/${docSlug}`

  return {
    path: localizedPath,
    locale: locale.code,
    localeSlug,
    i18nKey: parsedStem.sourceStem,
    canonicalPath: localizedPath,
    sourcePath,
    sourceStem: parsedStem.sourceStem,
    legacyPath: localeSlug === DEFAULT_LOCALE_SLUG ? sourcePath : undefined,
    chapter,
    chapterSort: chapter ? chapterToSort(chapter) : 0,
    date: parseDate(rawDocKey),
    docKey: `${localeSlug}:${docSlug}`,
    docI18nKey,
    docRoot,
    docTitle: titleFromDocKey(rawDocKey),
    isWikiDoc: true,
    isWikiIndex,
    wikiDepth: Math.max(0, parts.length - 2),
  }
}

export function getPostContentMeta(
  stem?: string,
  content: Record<string, unknown> = {}
): PostContentMeta | null {
  const parsedStem = parseLocalizedContentStem(stem)

  if (!parsedStem?.sourceStem.startsWith(POST_STEM_PREFIX)) {
    return null
  }

  const localeSlug = parsedStem.localeSlug
  const locale = getLocaleBySlug(localeSlug)
  const sourcePath = getPostSourcePath(parsedStem.sourceStem, content)
  const localizedPath = `/${localeSlug}${sourcePath}`

  return {
    path: localizedPath,
    locale: locale.code,
    localeSlug,
    i18nKey: parsedStem.sourceStem,
    canonicalPath: localizedPath,
    sourcePath,
    sourceStem: parsedStem.sourceStem,
    legacyPath: localeSlug === DEFAULT_LOCALE_SLUG ? sourcePath : undefined,
    isBlogPost: true
  }
}

function getPostSourcePath(sourceStem: string, content: Record<string, unknown>) {
  const explicitPath = readString(content.sourcePath) || readString(content.path)

  if (explicitPath) {
    const { pathWithoutLocale } = splitLocalePath(explicitPath)

    if (pathWithoutLocale === '/blog' || pathWithoutLocale.startsWith('/blog/')) {
      return pathWithoutLocale
    }
  }

  const fileName = sourceStem.split('/').at(-1) || 'post'
  const slug = toPinyinSlug(fileName.replace(/^\d{4}-\d{2}-\d{2}-/, '')) || toPinyinSlug(fileName) || 'post'

  return normalizeSitePath(`/blog/${slug}`)
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseDate(value: string) {
  return value.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
}

function stripSortPrefix(value: string) {
  return value.replace(/^\d+\./, '')
}

function toPinyinSlug(value: string) {
  const cleanValue = stripSortPrefix(value)
  const converted = pinyin(cleanValue, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  }).join('-')

  return converted
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseChapter(fileName: string) {
  const normalized = stripSortPrefix(fileName)
  const match = normalized.match(/^ch(\d+(?:-\d+)*)/i)

  return match ? match[1].replace(/-/g, '.') : undefined
}

function chapterToSort(chapter: string) {
  const weights = [1000000, 10000, 100, 1]

  return chapter
    .split('.')
    .slice(0, weights.length)
    .reduce((total, part, index) => total + Number(part || 0) * weights[index], 0)
}

function titleFromDocKey(docKey: string) {
  return stripSortPrefix(docKey)
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}
