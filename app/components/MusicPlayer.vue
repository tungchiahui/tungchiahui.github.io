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
  >
    {{ hidden ? '🎧 展开' : '🎧 收起' }}
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