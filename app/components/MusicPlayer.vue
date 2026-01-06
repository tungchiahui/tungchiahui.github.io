<template>
  <!-- 🎵 音乐播放器 -->
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
    <!-- api="https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r" -->
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
const ready = ref(false)   // 延迟挂载标志
const player = ref<HTMLElement | null>(null)

onMounted(() => {
  try {
    const saved = localStorage.getItem('music_player_hidden')
    if (saved === 'true') {
      hidden.value = true
    }
  } catch (e) {}

  // 延迟挂载，确保 MetingJS 脚本已经加载完
  setTimeout(() => {
    ready.value = true
  }, 300) // 延迟 300ms，可根据需要调整
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
