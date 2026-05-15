import { defineTransformer } from '@nuxt/content'
import { getLocalizedContentMeta } from '../utils/wiki-content-meta'

export default defineTransformer({
  name: 'content-i18n-path',
  extensions: ['.md', '.mdc'],
  transform(content) {
    const stem = content.stem || getStem(content.id)
    const contentMeta = getLocalizedContentMeta(stem, content as Record<string, unknown>)

    if (!contentMeta) {
      return content
    }

    return {
      ...content,
      ...contentMeta,
    }
  }
})

function getStem(id: string) {
  const normalized = id.replace(/\\/g, '/')
  const withoutSource = normalized.includes(':')
    ? normalized.slice(normalized.indexOf(':') + 1)
    : normalized

  return withoutSource.replace(/\.(md|mdc)$/i, '')
}
