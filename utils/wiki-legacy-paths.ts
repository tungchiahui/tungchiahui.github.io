const WIKI_STEM_PREFIX = 'wiki/'

const WIKI_LEGACY_DOC_PATH_ALIASES: Record<string, string[]> = {
  '2024-01-21-arm-keil-mdk6-jiao-cheng': ['/wiki/arm-keil-mdk6-tutorial'],
  '2026-02-16-flutter-jiao-cheng': ['/wiki/flutter-tutorial'],
  '2024-10-03-docker-jiao-cheng': ['/wiki/docker-tutorial'],
  '2024-03-30-linux-jiao-cheng': ['/wiki/linux-tutorial'],
  '2025-07-01-jekyll-jing-tai-wang-zhan-kuang-jia': ['/wiki/jekyll-framework'],
  '2025-07-18-linux-stm32-cmake-vscode-huan-jing-da-jian': ['/wiki/linux-stm32-cmake-vscode'],
  '2023-09-29-ji-qi-ren-gong-cheng-shi-cheng-zhang-ji-hua': ['/wiki/roboengineer_plan']
}

export function getWikiLegacyPathAliases(docI18nKey?: string, isWikiIndex = true): string[] {
  if (!isWikiIndex || !docI18nKey?.startsWith(WIKI_STEM_PREFIX)) {
    return []
  }

  const docSlug = docI18nKey.slice(WIKI_STEM_PREFIX.length)
  return WIKI_LEGACY_DOC_PATH_ALIASES[docSlug] || []
}
