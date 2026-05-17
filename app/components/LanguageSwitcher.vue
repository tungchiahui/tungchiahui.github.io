<template>
  <div ref="switcherRef" class="language-switcher">
    <button
      type="button"
      class="language-trigger"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      aria-controls="language-menu"
      :title="currentLocale.fullLabel"
      @click="toggleMenu"
      @keydown.escape="closeMenu"
    >
      <span class="flag-frame" aria-hidden="true">
        <img
          :src="getLocaleFlagUrl(currentLocale.slug, route.path)"
          :alt="`${currentLocale.fullLabel} ${ui.flagSuffix}`"
          loading="lazy"
          decoding="async"
        >
      </span>
      <span class="language-trigger-copy">
        <span class="language-label">{{ ui.language }}</span>
        <small>{{ currentLocale.fullLabel }}</small>
      </span>
      <i class="fas fa-chevron-up language-chevron" aria-hidden="true"></i>
    </button>

    <Transition name="language-menu-pop">
      <nav
        v-show="isOpen"
        id="language-menu"
        class="language-menu"
        :aria-label="ui.languageMenu"
      >
        <NuxtLink
          v-for="locale in I18N_LOCALES"
          :key="locale.slug"
          :to="getTargetPath(locale.slug)"
          class="language-option"
          active-class=""
          exact-active-class=""
          :class="{ 'is-active': locale.slug === currentLocaleSlug }"
          :title="locale.fullLabel"
          @click="selectLocale(locale.slug)"
        >
          <span class="flag-frame" aria-hidden="true">
            <img
              :src="getLocaleFlagUrl(locale.slug, route.path)"
              :alt="`${locale.fullLabel} ${ui.flagSuffix}`"
              loading="lazy"
              decoding="async"
            >
          </span>
          <span class="language-option-copy">
            <span class="language-option-name">{{ locale.fullLabel }}</span>
            <small>{{ locale.code }}</small>
          </span>
          <span class="language-check-slot">
            <span
              v-if="locale.slug === currentLocaleSlug"
              class="language-check"
              aria-hidden="true"
            >✓</span>
          </span>
        </NuxtLink>
      </nav>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  I18N_LOCALES,
  getContentPathCandidates,
  getCurrentLocaleSlug,
  getFallbackLocaleSectionPath,
  getLocaleBySlug,
  getLocaleFlagUrl,
  normalizeSitePath,
  replaceLocaleInPath,
  splitLocalePath,
  type ContentSection,
  type LocaleSlug
} from '~~/utils/i18n-locales'
import { getUiText } from '~~/utils/i18n-ui'

interface ContentVariant {
  path?: string
  localeSlug?: LocaleSlug
  i18nKey?: string
}

const route = useRoute()
const switcherRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const currentLocale = computed(() => getLocaleBySlug(currentLocaleSlug.value))
const ui = computed(() => getUiText(currentLocaleSlug.value))
const switcherDataKey = computed(() => `language-switcher-data-${route.path}`)

const { data: switcherData } = await useAsyncData(
  switcherDataKey,
  async () => {
    const currentDocument = await resolveCurrentDocument()

    if (!currentDocument?.i18nKey) {
      return { variants: [] as ContentVariant[] }
    }

    const variants = await queryCollection('content')
      .where('i18nKey', '=', currentDocument.i18nKey)
      .select('path', 'localeSlug', 'i18nKey')
      .all() as ContentVariant[]

    return { variants }
  },
  {
    watch: [() => route.path],
    default: () => ({ variants: [] as ContentVariant[] })
  }
)

const variantsByLocale = computed(() => {
  const map = new Map<LocaleSlug, ContentVariant>()

  ;(switcherData.value?.variants || []).forEach((variant) => {
    if (variant.localeSlug && variant.path) {
      map.set(variant.localeSlug, variant)
    }
  })

  return map
})

function getTargetPath(localeSlug: LocaleSlug) {
  return variantsByLocale.value.get(localeSlug)?.path || getLocalizedCurrentPath(localeSlug)
}

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function selectLocale(localeSlug: LocaleSlug) {
  rememberLocale(localeSlug)
  closeMenu()
}

function rememberLocale(localeSlug: LocaleSlug) {
  if (import.meta.client) {
    localStorage.setItem('locale', localeSlug)
  }
}

function getLocalizedCurrentPath(localeSlug: LocaleSlug) {
  const { pathWithoutLocale } = splitLocalePath(route.path)

  if (
    pathWithoutLocale === '/blog' ||
    pathWithoutLocale === '/wiki' ||
    pathWithoutLocale === '/search'
  ) {
    return replaceLocaleInPath(route.path, localeSlug)
  }

  if (pathWithoutLocale.startsWith('/blog/')) {
    return getFallbackLocaleSectionPath(route.path, localeSlug)
  }

  if (pathWithoutLocale.startsWith('/wiki/')) {
    return getFallbackLocaleSectionPath(route.path, localeSlug)
  }

  return replaceLocaleInPath(route.path, localeSlug) || getFallbackLocaleSectionPath(route.path, localeSlug)
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target

  if (target instanceof Node && switcherRef.value?.contains(target)) {
    return
  }

  closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})

async function resolveCurrentDocument(): Promise<ContentVariant | null> {
  const section = getContentSection(route.path)

  if (!section) {
    return null
  }

  for (const path of getContentPathCandidates(route.path, section)) {
    const normalizedPath = normalizeSitePath(path)
    const document = await queryCollection('content')
      .where('path', '=', normalizedPath)
      .select('path', 'localeSlug', 'i18nKey')
      .first() as ContentVariant | null

    if (document) {
      return document
    }
  }

  return null
}

function getContentSection(path: unknown): ContentSection | null {
  const { pathWithoutLocale } = splitLocalePath(path)

  if (pathWithoutLocale === '/blog' || pathWithoutLocale.startsWith('/blog/')) {
    return 'blog'
  }

  if (pathWithoutLocale === '/wiki' || pathWithoutLocale.startsWith('/wiki/')) {
    return 'wiki'
  }

  return null
}
</script>

<style scoped>
.language-switcher,
.language-switcher * {
  box-sizing: border-box;
}

.language-switcher {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  width: min(100%, 250px);
  min-width: 0;
  color: var(--text-main);
}

.language-trigger {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 44px;
  padding: 7px 10px;
  border: 1px solid color-mix(in srgb, #14b8a6 28%, var(--nav-border, #e5e7eb));
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-color, #ffffff) 92%, #ecfeff);
  color: var(--text-main);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.language-trigger:hover,
.language-trigger[aria-expanded="true"] {
  border-color: color-mix(in srgb, #14b8a6 66%, var(--nav-border, #e5e7eb));
  background: color-mix(in srgb, #14b8a6 12%, var(--bg-color, #ffffff));
  box-shadow: 0 14px 28px rgba(20, 184, 166, 0.14), 0 8px 18px rgba(15, 23, 42, 0.1);
  transform: translateY(-1px);
}

.language-chevron {
  justify-self: end;
  color: var(--text-secondary);
  font-size: 0.72rem;
  transition: transform 0.2s ease;
}

.language-trigger[aria-expanded="true"] .language-chevron {
  transform: rotate(180deg);
}

.language-menu {
  position: absolute;
  left: 0;
  bottom: calc(100% + 10px);
  z-index: 1300;
  display: grid;
  width: min(292px, calc(100vw - 32px));
  min-width: 0;
  gap: 4px;
  padding: 6px;
  border: 1px solid color-mix(in srgb, #14b8a6 28%, var(--nav-border, #e5e7eb));
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-color, #ffffff) 94%, transparent);
  box-shadow: 0 20px 42px rgba(15, 23, 42, 0.18), 0 8px 18px rgba(20, 184, 166, 0.1);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  transform-origin: left bottom;
}

.language-menu-pop-enter-active,
.language-menu-pop-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.language-menu-pop-enter-from,
.language-menu-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

.language-option {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 50px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text-main);
  text-decoration: none;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.language-option:hover {
  background: color-mix(in srgb, #14b8a6 9%, transparent);
}

.language-option.is-active {
  border-color: color-mix(in srgb, #14b8a6 36%, transparent);
  background: color-mix(in srgb, #14b8a6 13%, transparent);
}

.flag-frame {
  width: 28px;
  height: 18px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--nav-border, #dbe5ee) 88%, #8a97a6);
  border-radius: 3px;
  background: #fff;
}

.flag-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.language-trigger-copy,
.language-option-copy {
  display: grid;
  min-width: 0;
  text-align: left;
}

.language-trigger-copy {
  gap: 1px;
}

.language-option-copy {
  gap: 3px;
}

.language-label,
.language-option-name {
  overflow: hidden;
  color: var(--text-main);
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.language-label {
  font-size: 0.82rem;
  font-weight: 850;
}

.language-option-name {
  font-size: 0.9rem;
  font-weight: 850;
}

.language-trigger-copy small,
.language-option-copy small {
  overflow: hidden;
  color: var(--text-secondary);
  font-weight: 750;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.language-trigger-copy small {
  font-size: 0.68rem;
}

.language-option-copy small {
  font-size: 0.72rem;
}

.language-check-slot {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  color: #0f766e;
}

.language-check {
  font-size: 0.78rem;
  font-weight: 900;
  line-height: 1;
}

html.dark .language-trigger,
html.dark .language-menu {
  border-color: color-mix(in srgb, #34d399 28%, var(--nav-border, #334155));
  background: color-mix(in srgb, var(--bg-secondary, #1e293b) 90%, transparent);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34), 0 8px 20px rgba(52, 211, 153, 0.1);
}

html.dark .language-trigger:hover,
html.dark .language-trigger[aria-expanded="true"],
html.dark .language-option:hover,
html.dark .language-option.is-active {
  border-color: color-mix(in srgb, #34d399 42%, transparent);
  background: color-mix(in srgb, #34d399 13%, transparent);
}

html.dark .language-check-slot {
  color: #5eead4;
}

@media (max-width: 640px) {
  .language-switcher {
    width: min(100%, 280px);
  }

  .language-menu {
    width: min(292px, calc(100vw - 24px));
  }
}
</style>
