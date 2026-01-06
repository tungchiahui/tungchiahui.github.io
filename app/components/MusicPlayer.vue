<template>
  <!-- 🎵 音乐播放器 -->
  <div
    ref="player"
    id="music-player"
    :class="{ hidden: hidden }"
  >
    <meting-js
      server="tencent"
      type="playlist"
      id="9619599108"
      autoplay="false"
    />
  </div>

  <!-- 🎧 收起 / 展开按钮 -->
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

const hidden = ref(false)
const player = ref<HTMLElement | null>(null)

onMounted(() => {
  try {
    const saved = localStorage.getItem('music_player_hidden')
    if (saved === 'true') {
      hidden.value = true
    }
  } catch (e) {}
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

