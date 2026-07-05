<template>
  <a
    v-if="isStaticDocument"
    :href="href"
    :target="target"
    :rel="rel"
  >
    <slot />
  </a>
  <a
    v-else-if="isExternal"
    :href="href"
    :target="target || '_blank'"
    :rel="rel || 'noopener noreferrer'"
  >
    <slot />
  </a>
  <NuxtLink
    v-else
    :to="href"
    :target="target"
    :rel="rel"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: string
  rel?: string
}>()

const href = computed(() => props.href || '')
const isStaticDocument = computed(() => href.value.startsWith('/docs/'))
const isExternal = computed(() => /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(href.value))
</script>
