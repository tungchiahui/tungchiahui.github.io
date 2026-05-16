import { getLocaleBySlug, type LocaleSlug } from './i18n-locales'
import { pageCopy, type PageCopyName } from './generated/i18n-page-copy'

export function getPageCopy<Page extends PageCopyName>(page: Page, localeSlug: LocaleSlug | string) {
  const locale = getLocaleBySlug(localeSlug).slug
  return pageCopy[page][locale]
}
