import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pageCopySource } from '../utils/i18n-page-copy-source'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type PageCopyEntry = {
  zh: JsonValue
  en?: JsonValue
}
type MemoryEntry = {
  source: string
  target: string
  provider?: string
  model?: string
  updatedAt?: string
}
type MemoryStore = Record<string, MemoryEntry>
type Glossary = Record<string, string>
type OverrideStore = Record<string, string | { target?: string }>
type TranslationProvider = {
  name: string
  model: string
  baseUrl: string
  translate(input: string, glossary: Glossary): Promise<string>
}
type Stats = {
  strings: number
  memoryHits: number
  legacyImported: number
  overrideHits: number
  apiRequests: number
  apiTranslated: number
  apiFailed: number
  fallbackMissing: number
}

const rootDir = process.cwd()
const i18nDir = path.join(rootDir, 'i18n')
const enLocale = 'en-us'
const memoryFile = path.join(i18nDir, 'ui-memory', `${enLocale}.json`)
const overrideFile = path.join(i18nDir, 'ui-overrides', `${enLocale}.json`)
const glossaryFile = path.join(i18nDir, 'glossary', `${enLocale}.json`)

const memory = await readJson<MemoryStore>(memoryFile, {})
const overrides = await readJson<OverrideStore>(overrideFile, {})
const glossary = await readJson<Glossary>(glossaryFile, {})
const provider = createProvider()
const stats: Stats = {
  strings: 0,
  memoryHits: 0,
  legacyImported: 0,
  overrideHits: 0,
  apiRequests: 0,
  apiTranslated: 0,
  apiFailed: 0,
  fallbackMissing: 0
}

if (!provider) {
  console.warn('i18n-ui: no translation provider configured. Existing memory will be used; legacy English fields will be imported if present.')
}

for (const [page, copy] of Object.entries(pageCopySource as Record<string, PageCopyEntry>)) {
  await visitCopy(page, copy.zh, copy.en)
}

await fs.mkdir(path.dirname(memoryFile), { recursive: true })
await fs.writeFile(memoryFile, `${JSON.stringify(sortObject(memory), null, 2)}\n`)

console.log('i18n-ui: translation memory updated')
console.log(`i18n-ui: strings ${stats.strings}`)
console.log(`i18n-ui: memory hits ${stats.memoryHits}`)
console.log(`i18n-ui: legacy imported ${stats.legacyImported}`)
console.log(`i18n-ui: override hits ${stats.overrideHits}`)
console.log(`i18n-ui: api translated ${stats.apiTranslated}`)
console.log(`i18n-ui: api failed ${stats.apiFailed}`)
console.log(`i18n-ui: fallback missing ${stats.fallbackMissing}`)
console.log(`i18n-ui: memory saved ${path.relative(rootDir, memoryFile)}`)

async function visitCopy(page: string, value: JsonValue, legacy?: JsonValue, keyPath: string[] = []) {
  if (typeof value === 'string') {
    if (!containsChinese(value)) return

    stats.strings += 1
    const pathKey = [page, ...keyPath].join('.')
    const key = memoryKey(pathKey, value)

    const override = readOverride(pathKey, key, value)
    if (override) {
      memory[key] = createMemoryEntry(value, override, 'override')
      stats.overrideHits += 1
      return
    }

    if (memory[key]?.target) {
      stats.memoryHits += 1
      return
    }

    if (typeof legacy === 'string' && legacy && legacy !== value) {
      memory[key] = createMemoryEntry(value, legacy, 'legacy')
      stats.legacyImported += 1
      return
    }

    if (provider) {
      stats.apiRequests += 1
      try {
        const target = await provider.translate(value, glossary)
        memory[key] = createMemoryEntry(value, target, provider.name, provider.model)
        stats.apiTranslated += 1
        return
      } catch (error) {
        stats.apiFailed += 1
        console.warn(`i18n-ui: api failed for ${pathKey}: ${formatError(error)}; using fallback source text.`)
      }
    }

    memory[key] = createMemoryEntry(value, value, 'fallback')
    stats.fallbackMissing += 1
    return
  }

  if (Array.isArray(value)) {
    const legacyItems = Array.isArray(legacy) ? legacy : []
    for (const [index, item] of value.entries()) {
      await visitCopy(page, item, legacyItems[index], [...keyPath, String(index)])
    }
    return
  }

  if (value && typeof value === 'object') {
    const legacyObject = legacy && typeof legacy === 'object' && !Array.isArray(legacy) ? legacy as Record<string, JsonValue> : {}
    for (const [key, item] of Object.entries(value)) {
      await visitCopy(page, item, legacyObject[key], [...keyPath, key])
    }
  }
}

function createMemoryEntry(source: string, target: string, provider?: string, model?: string): MemoryEntry {
  return {
    source,
    target,
    provider,
    model,
    updatedAt: new Date().toISOString()
  }
}

function readOverride(pathKey: string, hashKey: string, source: string) {
  const value = overrides[pathKey] ?? overrides[hashKey] ?? overrides[source]
  if (typeof value === 'string') return value
  return value?.target
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T
  } catch {
    return fallback
  }
}

function createProvider(): TranslationProvider | null {
  const providerName = process.env.TRANSLATE_PROVIDER || 'deepseek'
  const apiKey = process.env.TRANSLATE_API_KEY
  const baseUrl = (process.env.TRANSLATE_BASE_URL || defaultBaseUrl(providerName)).replace(/\/+$/, '')
  const model = process.env.TRANSLATE_MODEL || defaultModel(providerName)

  if (!apiKey) return null

  return {
    name: providerName,
    model,
    baseUrl,
    async translate(input: string, glossary: Glossary) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(glossary)
            },
            {
              role: 'user',
              content: input
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Translation provider failed: ${response.status} ${await response.text()}`)
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
      return (data.choices?.[0]?.message?.content || input).trim()
    }
  }
}

function defaultBaseUrl(provider: string) {
  if (provider === 'deepseek') return 'https://api.deepseek.com'
  if (provider === 'openai') return 'https://api.openai.com/v1'
  if (provider === 'mimo') return 'https://api.xiaomimimo.com/v1'
  return ''
}

function defaultModel(provider: string) {
  if (provider === 'deepseek') return 'deepseek-chat'
  if (provider === 'openai') return 'gpt-4.1-mini'
  if (provider === 'mimo') return 'mimo-v2-flash'
  return 'deepseek-chat'
}

function buildSystemPrompt(glossary: Glossary) {
  const glossaryText = Object.entries(glossary)
    .map(([source, target]) => `- ${source} => ${target}`)
    .join('\n')

  return [
    'Translate Simplified Chinese Vue UI copy into concise, natural American English.',
    'Return only the translated UI text.',
    'Keep product names, code identifiers, CSS class names, URLs, keyboard keys, and placeholders unchanged.',
    'Preserve placeholders like {total}, {core}, {count}, %s, and __I18N_PROTECTED_0__ exactly.',
    'Prefer short labels for buttons, tabs, navigation, and aria labels.',
    glossaryText ? `Use this glossary:\n${glossaryText}` : ''
  ].filter(Boolean).join('\n')
}

function memoryKey(pathKey: string, source: string) {
  return `${pathKey}:${hashText(source)}`
}

function hashText(value: string) {
  return createHash('sha256').update(value.replace(/\s+/g, ' ').trim()).digest('hex')
}

function containsChinese(value: string) {
  return /[\u3400-\u9fff]/.test(value)
}

function sortObject<T extends Record<string, unknown>>(object: T): T {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b))) as T
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
