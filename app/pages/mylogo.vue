<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#app'
import { getCurrentLocaleSlug, replaceLocaleInPath } from '~~/utils/i18n-locales'
import { getPageCopy } from '~~/utils/i18n-page-copy'

const logoUrl = 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/logo.png'
const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const morePath = computed(() => replaceLocaleInPath('/more', currentLocaleSlug.value))
const copy = computed(() => getPageCopy('mylogo', currentLocaleSlug.value))

useHead(() => ({
  title: copy.value.metaTitle,
  meta: [
    {
      name: 'description',
      content: copy.value.metaDescription
    }
  ]
}))
</script>

<template>
  <div class="mylogo-page">
    <nav class="logo-top-nav" :aria-label="copy.navLabel">
      <NuxtLink :to="morePath" class="logo-back-link">← {{ copy.back }}</NuxtLink>
    </nav>

    <header class="logo-hero">
      <div class="logo-visual-panel">
        <div class="logo-image-shell">
          <img
            class="logo-image"
            :src="logoUrl"
            :alt="copy.imageAlt"
            width="220"
            height="220"
            decoding="async"
          />
        </div>
        <div class="logo-identity">
          <span class="identity-label">Personal Mark</span>
          <strong>T / C / H</strong>
        </div>
      </div>

      <div class="logo-hero-copy">
        <p class="logo-kicker">{{ copy.kicker }}</p>
        <h1>{{ copy.title }}</h1>
        <p class="logo-summary">
          {{ copy.summary }}
        </p>
      </div>
    </header>

    <main class="logo-content">
      <section class="logo-section">
        <h2>{{ copy.letterSectionTitle }}</h2>
        <p>
          {{ copy.letterSectionBody }}
        </p>
      </section>

      <section class="logo-key-grid" :aria-label="copy.keyGridLabel">
        <article v-for="card in copy.cards" :key="card.letter" class="logo-key-card">
          <span class="key-letter">{{ card.letter }}</span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.body }}</p>
        </article>
      </section>

      <section class="logo-section">
        <h2>{{ copy.greenTitle }}</h2>
        <p>
          {{ copy.greenBody }}
        </p>
      </section>

      <section class="logo-section logo-attitude-section">
        <h2>{{ copy.attitudeTitle }}</h2>
        <p>
          {{ copy.attitudeBody }}
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.mylogo-page {
  width: min(1040px, 100%);
  margin: 0 auto;
  padding: 30px 20px 56px;
  color: var(--text-main, #1f1f1f);
}

.logo-top-nav {
  margin-bottom: 28px;
}

.logo-back-link {
  display: inline-flex;
  align-items: center;
  color: #00a878;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.logo-back-link:hover {
  opacity: 0.78;
}

.logo-hero {
  display: grid;
  grid-template-columns: minmax(280px, 0.78fr) minmax(0, 1fr);
  gap: 34px;
  align-items: center;
  margin-bottom: 42px;
  padding: 34px;
  border: 1px solid rgba(0, 197, 142, 0.2);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(0, 197, 142, 0.08), rgba(59, 130, 246, 0.06)),
    var(--bg-secondary, #f7f7f8);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.logo-visual-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  min-height: 330px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 197, 142, 0.16);
}

.logo-image-shell {
  display: grid;
  place-items: center;
  width: clamp(178px, 24vw, 240px);
  aspect-ratio: 1;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 20px 42px rgba(0, 197, 142, 0.18),
    0 8px 18px rgba(15, 23, 42, 0.08);
}

.logo-image {
  display: block;
  width: 72%;
  height: 72%;
  object-fit: contain;
}

.logo-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.identity-label {
  color: var(--text-secondary, #666666);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.logo-identity strong {
  color: #00a878;
  font-size: 1.35rem;
}

.logo-hero-copy {
  min-width: 0;
}

.logo-kicker {
  margin: 0 0 12px;
  color: #00a878;
  font-size: 0.95rem;
  font-weight: 800;
}

.logo-hero h1 {
  margin: 0;
  font-size: clamp(2.15rem, 6vw, 4.2rem);
  line-height: 1.08;
}

.logo-summary {
  max-width: 620px;
  margin: 20px 0 0;
  color: var(--text-secondary, #666666);
  font-size: 1.12rem;
  line-height: 1.75;
}

.logo-content {
  display: grid;
  gap: 26px;
}

.logo-section {
  padding: 30px;
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 14px;
  background: var(--bg-color, #ffffff);
}

.logo-section h2 {
  margin: 0 0 16px;
  color: var(--text-main, #1f1f1f);
  font-size: 1.55rem;
}

.logo-section p {
  margin: 0;
  color: var(--text-secondary, #666666);
  font-size: 1.02rem;
  line-height: 1.95;
  text-align: justify;
}

.logo-key-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.logo-key-card {
  padding: 24px;
  border: 1px solid rgba(0, 197, 142, 0.18);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(0, 197, 142, 0.07), rgba(0, 197, 142, 0.02));
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.logo-key-card:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 197, 142, 0.38);
  box-shadow: 0 12px 28px rgba(0, 197, 142, 0.12);
}

.key-letter {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 12px;
  background: #00a878;
  color: #ffffff;
  font-size: 1.45rem;
  font-weight: 900;
}

.logo-key-card h3 {
  margin: 0 0 10px;
  color: var(--text-main, #1f1f1f);
  font-size: 1.12rem;
}

.logo-key-card p {
  margin: 0;
  color: var(--text-secondary, #666666);
  line-height: 1.7;
}

.logo-attitude-section {
  border-color: rgba(0, 197, 142, 0.28);
  background: linear-gradient(135deg, rgba(0, 197, 142, 0.08), rgba(59, 130, 246, 0.05));
}

:global(html.dark) .logo-back-link,
:global(html.dark) .logo-kicker,
:global(html.dark) .logo-identity strong {
  color: #34d399;
}

:global(html.dark) .identity-label {
  color: #d1fae5;
}

:global(html.dark) .logo-hero {
  border-color: rgba(52, 211, 153, 0.26);
  background:
    linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(96, 165, 250, 0.09)),
    var(--bg-secondary, #1e293b);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
}

:global(html.dark) .logo-visual-panel {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(52, 211, 153, 0.22);
}

:global(html.dark) .logo-image-shell {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(52, 211, 153, 0.24);
  box-shadow:
    0 20px 46px rgba(16, 185, 129, 0.22),
    0 10px 24px rgba(0, 0, 0, 0.18);
}

:global(html.dark) .logo-section {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--nav-border, #334155);
}

:global(html.dark) .logo-key-card {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(96, 165, 250, 0.05));
  border-color: rgba(52, 211, 153, 0.22);
}

:global(html.dark) .logo-key-card:hover {
  border-color: rgba(52, 211, 153, 0.45);
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.16);
}

:global(html.dark) .key-letter {
  background: #34d399;
  color: #0f172a;
}

:global(html.dark) .logo-attitude-section {
  border-color: rgba(52, 211, 153, 0.32);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(96, 165, 250, 0.08));
}

@media (max-width: 820px) {
  .mylogo-page {
    padding: 22px 12px 42px;
  }

  .logo-hero {
    grid-template-columns: 1fr;
    gap: 26px;
    padding: 24px;
  }

  .logo-visual-panel {
    min-height: 280px;
  }

  .logo-key-grid {
    grid-template-columns: 1fr;
  }

  .logo-section {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .logo-hero {
    padding: 18px;
    border-radius: 14px;
  }

  .logo-visual-panel {
    min-height: 240px;
  }

  .logo-section {
    padding: 20px;
  }

  .logo-section p {
    text-align: left;
  }

  .logo-summary {
    font-size: 1rem;
  }
}
</style>
