import OpenCC from 'opencc-js'
import { getRequestURL } from 'h3'
import { getCurrentLocaleSlug, type LocaleSlug } from '../../utils/i18n-locales'

type Converter = (value: string) => string

const converterTargets: Partial<Record<LocaleSlug, 't' | 'hk' | 'tw'>> = {
  'zh-hant': 't',
  'zh-hk': 'hk',
  'zh-tw': 'tw'
}

const converters = new Map<string, Converter>()
const protectedTags = new Set(['script', 'style', 'pre', 'code', 'textarea', 'svg'])

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const localeSlug = getCurrentLocaleSlug(getRequestURL(event).pathname)
    const converter = getConverter(localeSlug)

    if (!converter) {
      return
    }

    html.head = html.head.map(chunk => convertHtmlChunk(chunk, converter))
    html.body = html.body.map(chunk => convertHtmlChunk(chunk, converter))
    html.bodyAppend = html.bodyAppend.map(chunk => convertHtmlChunk(chunk, converter))
  })
})

function getConverter(localeSlug: LocaleSlug): Converter | undefined {
  const target = converterTargets[localeSlug]

  if (!target) {
    return undefined
  }

  const cached = converters.get(target)
  if (cached) {
    return cached
  }

  const converter = OpenCC.Converter({ from: 'cn', to: target })
  converters.set(target, converter)
  return converter
}

function convertHtmlChunk(html: string, converter: Converter) {
  let output = ''
  let index = 0
  const tagStack: string[] = []

  while (index < html.length) {
    if (html.startsWith('<!--', index)) {
      const endIndex = html.indexOf('-->', index + 4)
      const nextIndex = endIndex >= 0 ? endIndex + 3 : html.length
      output += html.slice(index, nextIndex)
      index = nextIndex
      continue
    }

    if (html[index] === '<') {
      const endIndex = html.indexOf('>', index + 1)

      if (endIndex < 0) {
        output += shouldConvertText(tagStack) ? converter(html.slice(index)) : html.slice(index)
        break
      }

      const tag = html.slice(index, endIndex + 1)
      output += shouldConvertText(tagStack) ? convertTagAttributes(tag, converter) : tag
      updateTagStack(tag, tagStack)
      index = endIndex + 1
      continue
    }

    const nextTagIndex = html.indexOf('<', index)
    const endIndex = nextTagIndex >= 0 ? nextTagIndex : html.length
    const text = html.slice(index, endIndex)
    output += shouldConvertText(tagStack) ? converter(text) : text
    index = endIndex
  }

  return output
}

function shouldConvertText(tagStack: string[]) {
  return !tagStack.some(tag => protectedTags.has(tag))
}

function convertTagAttributes(tag: string, converter: Converter) {
  const tagName = readTagName(tag)
  const attrs = tagName === 'meta'
    ? ['title', 'aria-label', 'placeholder', 'alt', 'content']
    : ['title', 'aria-label', 'placeholder', 'alt']

  let converted = tag

  attrs.forEach((attr) => {
    const pattern = new RegExp(`\\b(${attr})=(["'])(.*?)\\2`, 'gi')
    converted = converted.replace(pattern, (_match, name: string, quote: string, value: string) => {
      return `${name}=${quote}${converter(value)}${quote}`
    })
  })

  return converted
}

function updateTagStack(tag: string, tagStack: string[]) {
  const tagName = readTagName(tag)

  if (!tagName || tag.startsWith('<!') || tag.startsWith('<?')) {
    return
  }

  if (tag.startsWith('</')) {
    const index = tagStack.lastIndexOf(tagName)
    if (index >= 0) {
      tagStack.splice(index, 1)
    }
    return
  }

  if (isSelfClosingTag(tag, tagName)) {
    return
  }

  tagStack.push(tagName)
}

function readTagName(tag: string) {
  const match = tag.match(/^<\/?\s*([a-zA-Z0-9:-]+)/)
  return match?.[1]?.toLowerCase() || ''
}

function isSelfClosingTag(tag: string, tagName: string) {
  return tag.endsWith('/>') || [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ].includes(tagName)
}
