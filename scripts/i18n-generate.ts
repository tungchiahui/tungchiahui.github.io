import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import OpenCC from 'opencc-js'

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

type TranslationContext = {
  locale: string
  translate: boolean
  memory: MemoryStore
  glossary: Glossary
  overrides: OverrideStore
  provider: TranslationProvider | null
  stats: TranslationStats
}

type TranslationProvider = {
  name: string
  model: string
  baseUrl: string
  translate(input: string, glossary: Glossary): Promise<string>
}

type ProtectedText = {
  text: string
  restore(text: string): string
}

type TranslationStats = {
  startedAt: number
  sourceFiles: number
  processedFiles: number
  blocks: number
  memoryHits: number
  overrideHits: number
  apiRequests: number
  apiTranslated: number
  apiFailed: number
  fallbackMissing: number
  skipped: number
  lastProgressAt: number
}

const rootDir = process.cwd()
const contentDir = path.join(rootDir, 'content')
const i18nContentDir = path.join(contentDir, '_i18n')
const i18nDir = path.join(rootDir, 'i18n')
const enLocale = 'en-us'
const shouldTranslate = process.argv.includes('--translate') || process.env.I18N_TRANSLATE === '1'

const sourceRoots = [
  path.join(contentDir, 'posts'),
  path.join(contentDir, 'wiki')
]

const traditionalTargets = [
  {
    slug: 'zh-hant',
    converter: OpenCC.Converter({ from: 'cn', to: 't' })
  },
  {
    slug: 'zh-hk',
    converter: OpenCC.Converter({ from: 'cn', to: 'hk' })
  },
  {
    slug: 'zh-tw',
    converter: OpenCC.Converter({ from: 'cn', to: 'tw' })
  }
]

const generatedLocaleSlugs = [
  ...traditionalTargets.map(target => target.slug),
  enLocale
]

const convertibleFrontmatterKeys = new Set([
  'title',
  'description',
  'summary',
  'subtitle',
  'excerpt'
])

const generatedMetaKeys = new Set([
  'locale',
  'localeSlug',
  'i18nKey',
  'canonicalPath',
  'sourceStem',
  'legacyPath',
  'docI18nKey'
])

await main()

async function main() {
  await Promise.all(
    generatedLocaleSlugs.map(slug => fs.rm(path.join(i18nContentDir, slug), { recursive: true, force: true }))
  )

  const files = (await Promise.all(sourceRoots.map(root => collectMarkdownFiles(root)))).flat()
  const englishContext = await createEnglishContext()
  englishContext.stats.sourceFiles = files.length

  logStart(englishContext)

  for (const sourceFile of files) {
    const relativePath = path.relative(contentDir, sourceFile)
    const sourceMarkdown = await fs.readFile(sourceFile, 'utf8')

    for (const target of traditionalTargets) {
      const generatedMarkdown = transformTraditionalMarkdown(sourceMarkdown, target.converter)
      await writeGeneratedMarkdown(target.slug, relativePath, generatedMarkdown)
    }

    const englishMarkdown = await transformEnglishMarkdown(sourceMarkdown, englishContext)
    await writeGeneratedMarkdown(enLocale, relativePath, englishMarkdown)

    englishContext.stats.processedFiles += 1
    if (englishContext.stats.processedFiles % 10 === 0 || englishContext.stats.processedFiles === files.length) {
      logFileProgress(englishContext)
    }
  }

  await saveEnglishMemory(englishContext.memory)

  const mode = shouldTranslate ? 'with API translation enabled' : 'without API translation'
  console.log(`Generated ${files.length} source files for ${generatedLocaleSlugs.join(', ')} ${mode}.`)
  logSummary(englishContext)
}

async function writeGeneratedMarkdown(locale: string, relativePath: string, markdown: string) {
  const targetFile = path.join(i18nContentDir, locale, relativePath)
  await fs.mkdir(path.dirname(targetFile), { recursive: true })
  await fs.writeFile(targetFile, markdown)
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (fullPath.startsWith(i18nContentDir)) continue
      files.push(...await collectMarkdownFiles(fullPath))
      continue
    }

    if (entry.isFile() && /\.md$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function transformTraditionalMarkdown(markdown: string, converter: (input: string) => string) {
  const frontmatter = splitFrontmatter(markdown)

  if (!frontmatter) {
    return convertOutsideFencedCode(markdown, converter)
  }

  const transformedFrontmatter = transformTraditionalFrontmatter(frontmatter.body, converter)
  const transformedBody = convertOutsideFencedCode(frontmatter.rest, converter)

  return `---\n${transformedFrontmatter.trimEnd()}\n---${frontmatter.separator}${transformedBody}`
}

async function transformEnglishMarkdown(markdown: string, context: TranslationContext) {
  const frontmatter = splitFrontmatter(markdown)

  if (!frontmatter) {
    return await translateMarkdownBody(markdown, context)
  }

  const transformedFrontmatter = await transformEnglishFrontmatter(frontmatter.body, context)
  const transformedBody = await translateMarkdownBody(frontmatter.rest, context)

  return `---\n${transformedFrontmatter.trimEnd()}\n---${frontmatter.separator}${transformedBody}`
}

function splitFrontmatter(markdown: string) {
  if (!markdown.startsWith('---')) {
    return null
  }

  const newline = markdown.startsWith('---\r\n') ? '\r\n' : '\n'
  const closeNeedle = `${newline}---`
  const closeIndex = markdown.indexOf(closeNeedle, 3)

  if (closeIndex < 0) {
    return null
  }

  const afterCloseIndex = closeIndex + closeNeedle.length
  const separator = markdown.slice(afterCloseIndex, afterCloseIndex + newline.length) === newline ? newline : ''

  return {
    body: markdown.slice(3 + newline.length, closeIndex),
    separator,
    rest: markdown.slice(afterCloseIndex + separator.length)
  }
}

function transformTraditionalFrontmatter(frontmatter: string, converter: (input: string) => string) {
  const lines = frontmatter.split(/\r?\n/)
  const output: string[] = []
  let sourcePath = ''

  for (const line of lines) {
    const match = line.match(/^(\s*)([A-Za-z0-9_-]+)(\s*:\s*)(.*)$/)

    if (!match) {
      output.push(line)
      continue
    }

    const [, indent, key, separator, rawValue] = match
    const normalizedKey = key.trim()

    if (normalizedKey === 'path') {
      sourcePath = parseScalar(rawValue)
      continue
    }

    if (generatedMetaKeys.has(normalizedKey)) {
      continue
    }

    if (convertibleFrontmatterKeys.has(normalizedKey) && rawValue.trim()) {
      output.push(`${indent}${key}${separator}${convertScalar(rawValue, converter)}`)
      continue
    }

    output.push(line)
  }

  if (sourcePath) {
    output.push(`sourcePath: ${JSON.stringify(sourcePath)}`)
  }

  return output.join('\n')
}

async function transformEnglishFrontmatter(frontmatter: string, context: TranslationContext) {
  const lines = frontmatter.split(/\r?\n/)
  const output: string[] = []
  let sourcePath = ''

  for (const line of lines) {
    const match = line.match(/^(\s*)([A-Za-z0-9_-]+)(\s*:\s*)(.*)$/)

    if (!match) {
      output.push(line)
      continue
    }

    const [, indent, key, separator, rawValue] = match
    const normalizedKey = key.trim()

    if (normalizedKey === 'path') {
      sourcePath = parseScalar(rawValue)
      continue
    }

    if (generatedMetaKeys.has(normalizedKey)) {
      continue
    }

    if (convertibleFrontmatterKeys.has(normalizedKey) && rawValue.trim()) {
      const scalar = parseQuotedScalar(rawValue)
      const translated = await translateBlock(scalar.value, context)
      output.push(`${indent}${key}${separator}${scalar.quote ? `${scalar.quote}${escapeScalar(translated.text, scalar.quote)}${scalar.quote}` : translated.text}`)
      if (translated.missing) output.push(yamlMissingMarker(context.locale))
      continue
    }

    output.push(line)
  }

  if (sourcePath) {
    output.push(`sourcePath: ${JSON.stringify(sourcePath)}`)
  }

  return output.join('\n')
}

function parseScalar(value: string) {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

function parseQuotedScalar(value: string) {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return {
      quote: trimmed[0],
      value: trimmed.slice(1, -1)
    }
  }

  return {
    quote: '',
    value: value.trim()
  }
}

function escapeScalar(value: string, quote: string) {
  return quote === '"' ? value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') : value.replace(/'/g, "''")
}

function convertScalar(value: string, converter: (input: string) => string) {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const quote = trimmed[0]
    return `${quote}${converter(trimmed.slice(1, -1))}${quote}`
  }

  return converter(value)
}

function convertOutsideFencedCode(markdown: string, converter: (input: string) => string) {
  return transformOutsideFencedCodeSync(markdown, line => convertMarkdownLine(line, converter))
}

function convertMarkdownLine(line: string, converter: (input: string) => string) {
  const protectedLine = protectMarkdownInline(line)
  const converted = converter(protectedLine.text)
  return protectedLine.restore(converted)
}

async function translateMarkdownBody(markdown: string, context: TranslationContext) {
  return await transformOutsideFencedCode(markdown, lines => translateMarkdownLines(lines, context))
}

async function transformOutsideFencedCode(markdown: string, transform: (lines: string[]) => Promise<string[]>) {
  const parts = markdown.split(/(\r?\n)/)
  const output: string[] = []
  let pendingLines: string[] = []
  let inFence = false
  let fenceMarker = ''

  const flush = async () => {
    if (!pendingLines.length) return
    output.push(...await transform(pendingLines))
    pendingLines = []
  }

  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index] || ''
    const lineBreak = parts[index + 1] || ''
    const fenceMatch = line.match(/^\s*(```+|~~~+)/)

    if (fenceMatch) {
      await flush()
      output.push(line, lineBreak)
      const marker = fenceMatch[1][0]
      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (marker === fenceMarker) {
        inFence = false
        fenceMarker = ''
      }
      continue
    }

    if (inFence) {
      output.push(line, lineBreak)
      continue
    }

    pendingLines.push(line, lineBreak)
  }

  await flush()
  return output.join('')
}

function transformOutsideFencedCodeSync(markdown: string, transform: (line: string) => string) {
  const lines = markdown.split(/(\r?\n)/)
  const output: string[] = []
  let inFence = false
  let fenceMarker = ''

  for (let index = 0; index < lines.length; index += 2) {
    const line = lines[index] || ''
    const lineBreak = lines[index + 1] || ''
    const fenceMatch = line.match(/^\s*(```+|~~~+)/)
    const shouldConvert = !inFence

    output.push(shouldConvert ? transform(line) : line, lineBreak)

    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (marker === fenceMarker) {
        inFence = false
        fenceMarker = ''
      }
    }
  }

  return output.join('')
}

async function translateMarkdownLines(parts: string[], context: TranslationContext) {
  const output: string[] = []

  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index] || ''
    const lineBreak = parts[index + 1] || ''

    const translated = await translateMarkdownLine(line, context)
    output.push(translated.text, lineBreak)
    if (translated.missing) {
      output.push(missingMarker(context.locale), lineBreak)
    }
  }

  return output
}

async function translateMarkdownLine(line: string, context: TranslationContext): Promise<{ text: string; missing: boolean }> {
  if (!line.trim() || /^\s*<!--.*-->\s*$/.test(line)) {
    return { text: line, missing: false }
  }

  const table = splitTableRow(line)
  if (table) {
    let missing = false
    const cells = []

    for (const cell of table.cells) {
      const translated = await translateBlock(cell, context)
      missing ||= translated.missing
      cells.push(translated.text)
    }

    return {
      text: `${table.leading}${cells.join('|')}${table.trailing}`,
      missing
    }
  }

  const matchers: Array<{ pattern: RegExp; valueIndex: number; format(match: RegExpMatchArray, text: string): string }> = [
    {
      pattern: /^(\s{0,3}#{1,6}\s+)(.+?)(\s+#+\s*)?$/,
      valueIndex: 2,
      format: (match, text) => `${match[1]}${text}${match[3] || ''}`
    },
    {
      pattern: /^(\s{0,3}>\s?)(.+)$/,
      valueIndex: 2,
      format: (match, text) => `${match[1]}${text}`
    },
    {
      pattern: /^(\s*)([-+*]\s+)(.+)$/,
      valueIndex: 3,
      format: (match, text) => `${match[1]}${match[2]}${text}`
    },
    {
      pattern: /^(\s*)(\d+[.)]\s+)(.+)$/,
      valueIndex: 3,
      format: (match, text) => `${match[1]}${match[2]}${text}`
    }
  ]

  for (const matcher of matchers) {
    const match = line.match(matcher.pattern)
    if (!match) continue

    const value = match[matcher.valueIndex] || ''
    const translated = await translateBlock(value, context)
    return {
      text: matcher.format(match, translated.text),
      missing: translated.missing
    }
  }

  return await translateBlock(line, context)
}

function splitTableRow(line: string) {
  if (!line.includes('|') || /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)) {
    return null
  }

  const leading = line.startsWith('|') ? '|' : ''
  const trailing = line.endsWith('|') ? '|' : ''
  const inner = line.slice(leading ? 1 : 0, trailing ? -1 : undefined)

  return {
    leading,
    trailing,
    cells: inner.split('|').map(cell => cell.trim())
  }
}

async function translateBlock(source: string, context: TranslationContext): Promise<{ text: string; missing: boolean }> {
  if (!source.trim() || !containsChinese(source)) {
    context.stats.skipped += 1
    return { text: source, missing: false }
  }

  context.stats.blocks += 1
  const protectedSource = protectMarkdownInline(source)
  const key = hashText(protectedSource.text)
  const override = readOverride(context.overrides, key, source)

  if (override) {
    context.stats.overrideHits += 1
    return { text: protectedSource.restore(override), missing: false }
  }

  const cached = context.memory[key]
  if (cached?.target) {
    context.stats.memoryHits += 1
    return { text: protectedSource.restore(cached.target), missing: false }
  }

  if (context.translate && context.provider) {
    try {
      context.stats.apiRequests += 1
      const target = await context.provider.translate(protectedSource.text, context.glossary)
      context.memory[key] = {
        source: protectedSource.text,
        target,
        provider: context.provider.name,
        model: context.provider.model,
        updatedAt: new Date().toISOString()
      }
      context.stats.apiTranslated += 1
      logApiProgress(context)
      return { text: protectedSource.restore(target), missing: false }
    } catch (error) {
      context.stats.apiFailed += 1
      console.warn(`i18n: api failed for ${key}: ${formatError(error)}; using fallback source text.`)
      logApiProgress(context, true)
    }
  }

  context.stats.fallbackMissing += 1
  return {
    text: source,
    missing: true
  }
}

function readOverride(overrides: OverrideStore, key: string, source: string) {
  const value = overrides[key] || overrides[source]
  if (!value) return ''
  return typeof value === 'string' ? value : value.target || ''
}

function protectMarkdownInline(line: string): ProtectedText {
  const protectedValues: Array<[string, string]> = []

  const protect = (value: string) => {
    const token = `__I18N_PROTECTED_${protectedValues.length}__`
    protectedValues.push([token, value])
    return token
  }

  let protectedLine = line

  protectedLine = protectedLine.replace(/(`+)(.*?)(\1)/g, (_match, open, content, close) => {
    return protect(`${open}${content}${close}`)
  })

  protectedLine = protectedLine.replace(/^(\s*\[[^\]]+]:\s*)(\S.*)$/g, (_match, prefix, target) => {
    return `${prefix}${protect(target)}`
  })

  protectedLine = protectedLine.replace(/(!?\[[^\]]*]\()([^)]+)(\))/g, (_match, open, target, close) => {
    return `${open}${protect(target)}${close}`
  })

  protectedLine = protectedLine.replace(/\bhttps?:\/\/[^\s<>)]+/g, value => protect(value))

  return {
    text: protectedLine,
    restore(text: string) {
      let restored = text
      for (let index = protectedValues.length - 1; index >= 0; index -= 1) {
        const [token, value] = protectedValues[index]
        restored = restored.split(token).join(value)
      }
      return restored
    }
  }
}

async function createEnglishContext(): Promise<TranslationContext> {
  const memory = await readJson<MemoryStore>(path.join(i18nDir, 'memory', `${enLocale}.json`), {})
  const glossary = await readJson<Glossary>(path.join(i18nDir, 'glossary', `${enLocale}.json`), {})
  const overrides = await readOverrides(path.join(i18nDir, 'overrides', enLocale))
  const provider = shouldTranslate ? createProvider() : null

  if (shouldTranslate && !provider) {
    console.warn('I18N_TRANSLATE is enabled, but no translation provider is configured. Falling back to source text.')
  }

  return {
    locale: enLocale,
    translate: shouldTranslate,
    memory,
    glossary,
    overrides,
    provider,
    stats: createStats()
  }
}

async function saveEnglishMemory(memory: MemoryStore) {
  const file = path.join(i18nDir, 'memory', `${enLocale}.json`)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, `${JSON.stringify(sortObject(memory), null, 2)}\n`)
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T
  } catch {
    return fallback
  }
}

async function readOverrides(dir: string): Promise<OverrideStore> {
  const files = await collectJsonFiles(dir).catch(() => [])
  const result: OverrideStore = {}

  for (const file of files) {
    Object.assign(result, await readJson<OverrideStore>(file, {}))
  }

  return result
}

async function collectJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await collectJsonFiles(fullPath))
    else if (entry.isFile() && /\.json$/i.test(entry.name)) files.push(fullPath)
  }

  return files
}

function createProvider(): TranslationProvider | null {
  const providerName = process.env.TRANSLATE_PROVIDER || 'deepseek'
  const apiKey = process.env.TRANSLATE_API_KEY
  const baseUrl = (process.env.TRANSLATE_BASE_URL || defaultBaseUrl(providerName)).replace(/\/+$/, '')
  const model = process.env.TRANSLATE_MODEL || defaultModel(providerName)

  if (!apiKey) {
    return null
  }

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
    'Translate Simplified Chinese Markdown fragments into natural American English.',
    'Return only the translated fragment.',
    'Do not translate or alter placeholders like __I18N_PROTECTED_0__.',
    'Keep Markdown punctuation and formatting structure intact.',
    'Keep technical product names, code identifiers, file paths, URLs, and image paths unchanged.',
    glossaryText ? `Use this glossary:\n${glossaryText}` : ''
  ].filter(Boolean).join('\n')
}

function hashText(value: string) {
  return createHash('sha256').update(normalizeMemorySource(value)).digest('hex')
}

function normalizeMemorySource(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function containsChinese(value: string) {
  return /[\u3400-\u9fff]/.test(value)
}

function missingMarker(locale: string) {
  return `<!-- i18n-missing: ${locale} -->`
}

function yamlMissingMarker(locale: string) {
  return `# i18n-missing: ${locale}`
}

function sortObject<T extends Record<string, unknown>>(object: T): T {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b))) as T
}

function createStats(): TranslationStats {
  const now = Date.now()
  return {
    startedAt: now,
    sourceFiles: 0,
    processedFiles: 0,
    blocks: 0,
    memoryHits: 0,
    overrideHits: 0,
    apiRequests: 0,
    apiTranslated: 0,
    apiFailed: 0,
    fallbackMissing: 0,
    skipped: 0,
    lastProgressAt: now
  }
}

function logStart(context: TranslationContext) {
  console.log(`i18n: source files ${context.stats.sourceFiles}`)
  console.log(`i18n: target locales ${generatedLocaleSlugs.join(', ')}`)
  console.log(`i18n: translate mode ${context.translate ? 'on' : 'off'}`)
  console.log(`i18n: memory entries ${Object.keys(context.memory).length}`)
  console.log(`i18n: glossary terms ${Object.keys(context.glossary).length}`)
  console.log(`i18n: override entries ${Object.keys(context.overrides).length}`)

  if (context.provider) {
    console.log(`i18n: provider ${context.provider.name} / ${context.provider.model}`)
    console.log(`i18n: provider base ${context.provider.baseUrl}`)
  }
}

function logFileProgress(context: TranslationContext) {
  const { stats } = context
  console.log(`i18n: files ${stats.processedFiles}/${stats.sourceFiles}, blocks ${stats.blocks}, memory hits ${stats.memoryHits}, api translated ${stats.apiTranslated}, missing ${stats.fallbackMissing}, elapsed ${formatDuration(Date.now() - stats.startedAt)}`)
}

function logApiProgress(context: TranslationContext, force = false) {
  const { stats } = context
  const now = Date.now()

  if (!force && stats.apiRequests % 10 !== 0 && now - stats.lastProgressAt < 5000) {
    return
  }

  stats.lastProgressAt = now
  console.log(`i18n: api ${stats.apiTranslated}/${stats.apiRequests}, failed ${stats.apiFailed}, elapsed ${formatDuration(now - stats.startedAt)}`)
}

function logSummary(context: TranslationContext) {
  const { stats } = context
  console.log('i18n: done')
  console.log(`i18n: files ${stats.processedFiles}/${stats.sourceFiles}`)
  console.log(`i18n: blocks ${stats.blocks}`)
  console.log(`i18n: memory hits ${stats.memoryHits}`)
  console.log(`i18n: override hits ${stats.overrideHits}`)
  console.log(`i18n: api requests ${stats.apiRequests}`)
  console.log(`i18n: api translated ${stats.apiTranslated}`)
  console.log(`i18n: api failed ${stats.apiFailed}`)
  console.log(`i18n: fallback missing ${stats.fallbackMissing}`)
  console.log(`i18n: memory saved i18n/memory/${enLocale}.json`)
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace(/\s+/g, ' ').slice(0, 300)
  }

  return String(error).replace(/\s+/g, ' ').slice(0, 300)
}
