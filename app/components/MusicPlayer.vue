<template>
  <div
    ref="player"
    id="music-player"
    :class="{ hidden: hidden }"
  >
    <meting-js
      v-if="ready"
      server="tencent"
      type="playlist"
      id="9619599108"
      autoplay="false"
      api="https://music.3e0.cn/?server=:server&type=:type&id=:id&r=:r"
    />
  </div>

  <button
    id="toggle-player-fixed"
    :class="{ open: !hidden }"
    @click="toggle"
    :aria-pressed="!hidden"
    :aria-label="hidden ? '展开音乐播放器' : '收起音乐播放器'"
    :title="hidden ? '展开音乐播放器' : '收起音乐播放器'"
  >
    <span class="toggle-player-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M9 18V5l11-2v13" />
        <path d="M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" />
        <path d="M20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" />
      </svg>
    </span>
    <span class="toggle-player-text">{{ hidden ? '展开' : '收起' }}</span>
    <svg class="toggle-player-chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 默认设为 false，确保初始状态是展开的
const hidden = ref(false)
const ready = ref(false)
const player = ref<HTMLElement | null>(null)

onMounted(() => {
  try {
    const saved = localStorage.getItem('music_player_hidden')
    // 只有当本地存储明确记录为 'true' 时才隐藏
    // 如果没有记录（第一次打开），则保持 hidden.value = false
    if (saved === 'true') {
      hidden.value = true
    } else if (saved === 'false') {
      hidden.value = false
    }
  } catch (e) {}

  setTimeout(() => {
    ready.value = true
  }, 300)
})

function toggle() {
  hidden.value = !hidden.value
  try {
    localStorage.setItem(
      'music_player_hidden',
      hidden.value ? 'true' : 'false'
    )
  } catch (e) {}
}
</script>
