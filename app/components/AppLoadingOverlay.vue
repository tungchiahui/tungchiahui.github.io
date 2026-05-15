<script setup lang="ts">
import { getUiTextForPath } from '~~/utils/i18n-ui'

const logoUrl = 'https://cdn.tungchiahui.cn/tungwebsite/assets/images/logo.png'
const route = useRoute()
const ui = computed(() => getUiTextForPath(route.path))

defineProps({
  active: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'screen'
  },
  label: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <Transition name="app-loading-fade">
    <div
      v-if="active"
      class="app-loading-overlay"
      :class="`is-${mode}`"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="app-loading-track" aria-hidden="true">
        <span></span>
      </div>

      <div v-if="mode === 'screen'" class="app-loading-screen">
        <div class="app-loading-emblem" aria-hidden="true">
          <img :src="logoUrl" alt="" width="46" height="46" decoding="async" />
          <i></i>
        </div>

        <div class="app-loading-copy">
          <strong>东澈的折腾天地</strong>
          <span>{{ label || ui.loadingDefault }}</span>
        </div>

        <div class="app-loading-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div v-else class="app-loading-reader">
        <span class="app-loading-reader-mark" aria-hidden="true"></span>
        <span>{{ label || ui.loadingDefault }}</span>
      </div>
    </div>
  </Transition>
</template>

<style>
.app-loading-overlay {
  --loader-accent: #14b8a6;
  --loader-accent-strong: #0f766e;
  --loader-panel: color-mix(in srgb, var(--bg-color, #ffffff) 88%, transparent);
  position: fixed;
  inset: 0;
  z-index: 20000;
  pointer-events: none;
}

.app-loading-overlay.is-screen {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 28% 24%, color-mix(in srgb, var(--loader-accent) 18%, transparent), transparent 34%),
    radial-gradient(circle at 72% 76%, rgba(59, 130, 246, 0.12), transparent 30%),
    color-mix(in srgb, var(--bg-color, #ffffff) 94%, transparent);
  backdrop-filter: blur(18px);
}

.app-loading-track {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  overflow: hidden;
  background: color-mix(in srgb, var(--loader-accent) 16%, transparent);
}

.app-loading-track span {
  display: block;
  width: 42%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--loader-accent), #60a5fa, transparent);
  animation: app-loading-track 1.05s ease-in-out infinite;
}

.app-loading-screen {
  width: min(360px, calc(100vw - 48px));
  padding: 28px 24px 24px;
  border: 1px solid color-mix(in srgb, var(--loader-accent) 28%, var(--nav-border, #e5e7eb));
  border-radius: 18px;
  background: var(--loader-panel);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
  text-align: center;
}

.app-loading-emblem {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
}

.app-loading-emblem::before,
.app-loading-emblem::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--loader-accent) 44%, transparent);
}

.app-loading-emblem::before {
  animation: app-loading-ring 1.35s linear infinite;
  border-top-color: var(--loader-accent);
}

.app-loading-emblem::after {
  inset: 9px;
  border-color: color-mix(in srgb, #60a5fa 36%, transparent);
  animation: app-loading-ring 1.8s linear infinite reverse;
}

.app-loading-emblem img {
  position: relative;
  z-index: 1;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: block;
  object-fit: contain;
  padding: 6px;
  background: #ffffff;
  box-shadow: 0 12px 26px rgba(20, 184, 166, 0.28);
}

.app-loading-emblem i {
  position: absolute;
  right: 8px;
  bottom: 10px;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #facc15;
  box-shadow: 0 0 0 5px rgba(250, 204, 21, 0.18);
}

.app-loading-copy {
  display: grid;
  gap: 6px;
}

.app-loading-copy strong {
  color: var(--text-main, #1f2937);
  font-size: 1.05rem;
  line-height: 1.35;
}

.app-loading-copy span {
  color: var(--text-secondary, #64748b);
  font-size: 0.9rem;
}

.app-loading-dots {
  display: inline-flex;
  gap: 7px;
  margin-top: 18px;
}

.app-loading-dots span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--loader-accent);
  animation: app-loading-dot 0.9s ease-in-out infinite;
}

.app-loading-dots span:nth-child(2) {
  animation-delay: 0.12s;
}

.app-loading-dots span:nth-child(3) {
  animation-delay: 0.24s;
}

.app-loading-reader {
  position: fixed;
  top: 78px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 36px;
  max-width: min(320px, calc(100vw - 32px));
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--loader-accent) 34%, var(--nav-border, #e5e7eb));
  border-radius: 999px;
  background: var(--loader-panel);
  color: var(--text-main, #1f2937);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
  font-size: 0.84rem;
  font-weight: 800;
  backdrop-filter: blur(14px);
}

.app-loading-reader-mark {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--loader-accent);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--loader-accent) 36%, transparent);
  animation: app-loading-pulse 1.05s ease-out infinite;
}

html.dark .app-loading-overlay {
  --loader-accent: #5eead4;
  --loader-accent-strong: #99f6e4;
  --loader-panel: color-mix(in srgb, var(--bg-secondary, #1e293b) 86%, transparent);
}

html.dark .app-loading-overlay.is-screen {
  background:
    radial-gradient(circle at 28% 24%, rgba(94, 234, 212, 0.16), transparent 34%),
    radial-gradient(circle at 72% 76%, rgba(96, 165, 250, 0.14), transparent 30%),
    color-mix(in srgb, var(--bg-color, #0f172a) 94%, transparent);
}

html.dark .app-loading-screen,
html.dark .app-loading-reader {
  border-color: #1f3a4d;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
}

.app-loading-fade-enter-active,
.app-loading-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.app-loading-fade-enter-from,
.app-loading-fade-leave-to {
  opacity: 0;
}

.app-loading-fade-enter-from .app-loading-screen,
.app-loading-fade-leave-to .app-loading-screen,
.app-loading-fade-enter-from .app-loading-reader,
.app-loading-fade-leave-to .app-loading-reader {
  transform: translateY(6px);
}

@keyframes app-loading-track {
  0% {
    transform: translateX(-110%);
  }

  100% {
    transform: translateX(240%);
  }
}

@keyframes app-loading-ring {
  to {
    transform: rotate(360deg);
  }
}

@keyframes app-loading-dot {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.42;
  }

  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@keyframes app-loading-pulse {
  100% {
    box-shadow: 0 0 0 9px transparent;
  }
}

@media (max-width: 640px) {
  .app-loading-screen {
    width: min(320px, calc(100vw - 32px));
    padding: 24px 20px 22px;
    border-radius: 16px;
  }

  .app-loading-reader {
    top: 70px;
    right: 12px;
    left: 12px;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-loading-track span,
  .app-loading-emblem::before,
  .app-loading-emblem::after,
  .app-loading-dots span,
  .app-loading-reader-mark {
    animation: none;
  }
}
</style>
