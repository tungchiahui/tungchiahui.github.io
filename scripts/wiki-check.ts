import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getWikiContentMeta } from '../utils/wiki-content-meta'

const rootDir = process.cwd()
const contentDir = path.join(rootDir, 'content')
const wikiDir = path.join(contentDir, 'wiki')
const files = await collectMarkdownFiles(wikiDir)
const errors: string[] = []
const paths = new Map<string, string>()
const validWikiPaths = new Set<string>(['/wiki'])
const ordersByDoc = new Map<string, Map<string, string>>()

for (const file of files) {
  const relativePath = path.relative(contentDir, file).replace(/\\/g, '/')
  const stem = relativePath.replace(/\.(md|mdc)$/i, '')
  const fileName = path.basename(file).replace(/\.(md|mdc)$/i, '')
  const meta = getWikiContentMeta(stem)

  if (!meta) {
    errors.push(`${relativePath}: 无法解析 Wiki 元数据`)
    continue
  }

  if (!meta.isWikiIndex && !meta.chapterOrder) {
    errors.push(`${relativePath}: 章节文件名必须以四位 order 开头`)
  }

  const existingPath = paths.get(meta.sourcePath)
  if (existingPath) {
    errors.push(`${relativePath}: URL 与 ${existingPath} 冲突 (${meta.sourcePath})`)
  } else {
    paths.set(meta.sourcePath, relativePath)
    validWikiPaths.add(meta.sourcePath)
  }

  if (meta.chapterOrder) {
    const docOrders = ordersByDoc.get(meta.docI18nKey) || new Map<string, string>()
    const existingOrder = docOrders.get(meta.chapterOrder)

    if (existingOrder) {
      errors.push(
        `${relativePath}: order ${meta.chapterOrder} 与 ${existingOrder} 重复`
      )
    } else {
      docOrders.set(meta.chapterOrder, relativePath)
      ordersByDoc.set(meta.docI18nKey, docOrders)
    }
  }

  if (fileName.startsWith('ch')) {
    errors.push(`${relativePath}: 仍在使用旧 ch 章节前缀`)
  }
}

const sourceFiles = await collectMarkdownFiles(contentDir, true)

for (const file of sourceFiles) {
  const source = await fs.readFile(file, 'utf8')
  const relativePath = path.relative(rootDir, file).replace(/\\/g, '/')
  const legacyLinks = source.match(/\/wiki\/[^)\s"'<>]+\/ch\d+(?:-\d+)*-[^)\s"'<>#]+/gi) || []

  for (const link of legacyLinks) {
    errors.push(`${relativePath}: 仍引用旧章节链接 ${link}`)
  }

  const wikiLinks = source.matchAll(/(?<![A-Za-z0-9.])\/wiki\/[^\s"'<>)]*/g)

  for (const match of wikiLinks) {
    const rawLink = match[0].replace(/[.,;:，。；：]+$/, '')
    const linkPath = rawLink.split(/[?#]/)[0].replace(/\/+$/, '')

    if (linkPath && !validWikiPaths.has(linkPath)) {
      errors.push(`${relativePath}: Wiki 链接不存在 ${rawLink}`)
    }
  }
}

if (errors.length) {
  console.error(`Wiki 检查失败，共 ${errors.length} 个问题：`)
  errors.forEach(error => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`Wiki 检查通过：${files.length} 个文件，order、URL 与站内链接均正常。`)
}

async function collectMarkdownFiles(dir: string, skipGenerated = false): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const result: string[] = []

  for (const entry of entries) {
    if (skipGenerated && entry.isDirectory() && entry.name === '_i18n') {
      continue
    }

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      result.push(...await collectMarkdownFiles(fullPath, skipGenerated))
    } else if (entry.isFile() && /\.mdc?$/i.test(entry.name)) {
      result.push(fullPath)
    }
  }

  return result
}
