import { pinyin } from 'pinyin-pro'
import {
  DEFAULT_LOCALE_SLUG,
  getLocaleBySlug,
  parseLocalizedContentStem,
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
  chapterOrder?: string
  chapterDepth: number
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
  date?: string
  isBlogPost: boolean
}

export function getLocalizedContentMeta(
  stem?: string,
  _content: Record<string, unknown> = {}
): LocalizedContentMeta | WikiContentMeta | PostContentMeta | null {
  return getWikiContentMeta(stem) || getPostContentMeta(stem)
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
  if (!rawDocKey) {
    return null
  }

  const docSlug = toPinyinSlug(rawDocKey)
  const rawFileName = parts.at(-1) || ''
  const isWikiIndex = rawFileName === 'index'
  const chapterOrder = parseChapterOrder(rawFileName)
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
    chapterOrder,
    chapterDepth: chapterOrder ? chapterOrder.split('-').length - 1 : 0,
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

export function getPostContentMeta(stem?: string): PostContentMeta | null {
  const parsedStem = parseLocalizedContentStem(stem)

  if (!parsedStem?.sourceStem.startsWith(POST_STEM_PREFIX)) {
    return null
  }

  const localeSlug = parsedStem.localeSlug
  const locale = getLocaleBySlug(localeSlug)
  const { sourcePath, date } = getPostFileMeta(parsedStem.sourceStem)
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
    date,
    isBlogPost: true
  }
}

function getPostFileMeta(sourceStem: string) {
  const parts = sourceStem.split('/').slice(1).filter(Boolean)
  const rawFileName = parts.at(-1) || 'post'
  const pathParts = rawFileName.toLowerCase() === 'index'
    ? parts.slice(0, -1)
    : parts
  const slugParts = pathParts.map(toPinyinSlug).filter(Boolean)
  const dateParts = rawFileName.toLowerCase() === 'index'
    ? [...pathParts].reverse()
    : [rawFileName, ...parts.slice(0, -1).reverse()]

  return {
    sourcePath: `/${['blog', ...slugParts].filter(Boolean).join('/')}`,
    date: dateParts.map(parseDate).find(Boolean)
  }
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

function parseChapterOrder(fileName: string) {
  const normalized = stripSortPrefix(fileName)
  return normalized.match(/^(\d{4}(?:-\d{4})*)-/)?.[1]
}

function titleFromDocKey(docKey: string) {
  return stripSortPrefix(docKey)
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}
