import { promises as fs } from 'node:fs'
import path from 'node:path'
import OpenCC from 'opencc-js'

const rootDir = process.cwd()
const contentDir = path.join(rootDir, 'content')
const i18nDir = path.join(contentDir, '_i18n')

const targets = [
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

const sourceRoots = [
  path.join(contentDir, 'posts'),
  path.join(contentDir, 'wiki')
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
    targets.map(target => fs.rm(path.join(i18nDir, target.slug), { recursive: true, force: true }))
  )

  const files = (await Promise.all(sourceRoots.map(root => collectMarkdownFiles(root)))).flat()

  for (const sourceFile of files) {
    const relativePath = path.relative(contentDir, sourceFile)
    const sourceMarkdown = await fs.readFile(sourceFile, 'utf8')

    for (const target of targets) {
      const generatedMarkdown = transformMarkdown(sourceMarkdown, target.converter)
      const targetFile = path.join(i18nDir, target.slug, relativePath)

      await fs.mkdir(path.dirname(targetFile), { recursive: true })
      await fs.writeFile(targetFile, generatedMarkdown)
    }
  }

  console.log(`Generated ${files.length} source files for ${targets.map(target => target.slug).join(', ')}.`)
}

async function collectMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (fullPath.startsWith(i18nDir)) continue
      files.push(...await collectMarkdownFiles(fullPath))
      continue
    }

    if (entry.isFile() && /\.md$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function transformMarkdown(markdown, converter) {
  const frontmatter = splitFrontmatter(markdown)

  if (!frontmatter) {
    return convertOutsideFencedCode(markdown, converter)
  }

  const transformedFrontmatter = transformFrontmatter(frontmatter.body, converter)
  const transformedBody = convertOutsideFencedCode(frontmatter.rest, converter)

  return `---\n${transformedFrontmatter.trimEnd()}\n---${frontmatter.separator}${transformedBody}`
}

function splitFrontmatter(markdown) {
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

function transformFrontmatter(frontmatter, converter) {
  const lines = frontmatter.split(/\r?\n/)
  const output = []
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

function parseScalar(value) {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

function convertScalar(value, converter) {
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

function convertOutsideFencedCode(markdown, converter) {
  const lines = markdown.split(/(\r?\n)/)
  const output = []
  let inFence = false
  let fenceMarker = ''

  for (let index = 0; index < lines.length; index += 2) {
    const line = lines[index] || ''
    const lineBreak = lines[index + 1] || ''
    const fenceMatch = line.match(/^\s*(```+|~~~+)/)
    const shouldConvert = !inFence

    output.push(shouldConvert ? converter(line) : line, lineBreak)

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
