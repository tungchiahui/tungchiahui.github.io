import { nextTick } from 'vue'
import { getCurrentLocaleSlug, type LocaleSlug } from '~~/utils/i18n-locales'

type Converter = (value: string) => string

interface TextState {
  original: string
  converted: string
}

interface AttrState {
  original: string
  converted: string
}

const converterTargets = {
  'zh-hant': 't',
  'zh-hk': 'hk',
  'zh-tw': 'tw'
} as const

const converters: Partial<Record<LocaleSlug, Converter>> = {}
const converterLoads: Partial<Record<LocaleSlug, Promise<Converter>>> = {}

async function getConverter(localeSlug: LocaleSlug): Promise<Converter | undefined> {
  const target = converterTargets[localeSlug as keyof typeof converterTargets]

  if (!target) return undefined
  if (converters[localeSlug]) return converters[localeSlug]

  converterLoads[localeSlug] ||= import('opencc-js').then(({ default: OpenCC }) => {
    const converter = OpenCC.Converter({ from: 'cn', to: target })
    converters[localeSlug] = converter
    return converter
  })

  return converterLoads[localeSlug]
}

const textStates = new WeakMap<Text, TextState>()
const attrStates = new WeakMap<Element, Partial<Record<string, AttrState>>>()
const convertedAttributes = ['title', 'aria-label', 'placeholder', 'alt']
const skipSelector = 'script, style, code, pre, textarea, input, select, option, svg, [ignore-opencc], .ignore-opencc'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let scheduled = false
  let observer: MutationObserver | null = null

  const scheduleConvert = () => {
    if (scheduled) return
    scheduled = true

    window.requestAnimationFrame(async () => {
      scheduled = false
      await nextTick()
      await convertDocument()
    })
  }

  const convertDocument = async () => {
    const localeSlug = getCurrentLocaleSlug(router.currentRoute.value.path)
    const converter = await getConverter(localeSlug)

    convertTextNodes(document.body, converter)
    convertElementAttributes(document.body, converter)
  }

  scheduleConvert()

  nuxtApp.hook('app:beforeMount', scheduleConvert)

  nuxtApp.hook('app:mounted', () => {
    scheduleConvert()

    observer = new MutationObserver(scheduleConvert)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: convertedAttributes
    })
  })

  nuxtApp.hook('page:finish', scheduleConvert)
  router.afterEach(scheduleConvert)

  if (import.meta.hot) {
    import.meta.hot.dispose(() => observer?.disconnect())
  }
})

function convertTextNodes(root: HTMLElement, converter?: Converter) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const textNode = node as Text
      const parent = textNode.parentElement

      if (!parent || parent.closest(skipSelector) || !textNode.nodeValue?.trim()) {
        return NodeFilter.FILTER_REJECT
      }

      return NodeFilter.FILTER_ACCEPT
    }
  })

  let node = walker.nextNode() as Text | null

  while (node) {
    applyTextConversion(node, converter)
    node = walker.nextNode() as Text | null
  }
}

function applyTextConversion(node: Text, converter?: Converter) {
  const current = node.nodeValue || ''
  const state = textStates.get(node)

  if (!converter) {
    if (state && current === state.converted) {
      node.nodeValue = state.original
    }
    return
  }

  const original = state && current === state.converted ? state.original : current
  const converted = converter(original)

  textStates.set(node, { original, converted })

  if (current !== converted) {
    node.nodeValue = converted
  }
}

function convertElementAttributes(root: HTMLElement, converter?: Converter) {
  root.querySelectorAll('*').forEach((element) => {
    if (element.closest(skipSelector)) return

    convertedAttributes.forEach((attribute) => applyAttributeConversion(element, attribute, converter))
  })
}

function applyAttributeConversion(element: Element, attribute: string, converter?: Converter) {
  const current = element.getAttribute(attribute)

  if (!current?.trim()) return

  const elementState = attrStates.get(element) || {}
  const state = elementState[attribute]

  if (!converter) {
    if (state && current === state.converted) {
      element.setAttribute(attribute, state.original)
    }
    return
  }

  const original = state && current === state.converted ? state.original : current
  const converted = converter(original)

  elementState[attribute] = { original, converted }
  attrStates.set(element, elementState)

  if (current !== converted) {
    element.setAttribute(attribute, converted)
  }
}
