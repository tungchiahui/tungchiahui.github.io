import { getCurrentLocaleSlug, getLocaleBySlug, type LocaleSlug } from './i18n-locales'
import { pageCopy } from './generated/i18n-page-copy'

export type UiText = Record<string, string>

export function getUiText(localeSlug: LocaleSlug | string): UiText {
  const locale = getLocaleBySlug(localeSlug).slug
  return pageCopy.ui[locale] as UiText
}

export function getUiTextForPath(path: unknown): UiText {
  return getUiText(getCurrentLocaleSlug(path))
}

export function formatUiText(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  )
}
