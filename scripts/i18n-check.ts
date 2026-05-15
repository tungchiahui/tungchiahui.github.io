import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const targetLocale = process.argv.find(arg => arg.startsWith('--locale='))?.slice('--locale='.length) || 'en-us'
const targetDir = path.join(rootDir, 'content', '_i18n', targetLocale)
const missingMarker = `i18n-missing: ${targetLocale}`

const missingFiles: string[] = []

await main()

async function main() {
  const files = await collectMarkdownFiles(targetDir).catch(() => [])

  for (const file of files) {
    const markdown = await fs.readFile(file, 'utf8')
    if (markdown.includes(missingMarker)) {
      missingFiles.push(path.relative(rootDir, file))
    }
  }

  if (missingFiles.length) {
    console.error(`Found untranslated ${targetLocale} blocks:`)
    missingFiles.forEach(file => console.error(`- ${file}`))
    process.exitCode = 1
    return
  }

  console.log(`No untranslated ${targetLocale} blocks found.`)
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(fullPath))
      continue
    }

    if (entry.isFile() && /\.md$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}
