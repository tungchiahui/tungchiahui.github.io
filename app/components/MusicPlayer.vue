<template>
  <div
    ref="player"
    id="music-player"
    :class="{ collapsed: hidden }"
  >
    <button
      v-if="!hidden"
      class="music-player-collapse"
      @click="toggle"
      aria-label="收起音樂播放器"
      title="收起音樂播放器"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
      <span>收起</span>
    </button>

    <div ref="aplayerContainer" class="music-player-aplayer" />
  </div>

  <div
    v-if="hidden"
    id="music-player-mini"
  >
    <span
      class="music-player-mini-icon"
      :class="{ 'has-cover': hasCover }"
      :style="miniCoverStyle"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24">
        <path d="M9 18V5l11-2v13" />
        <path d="M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" />
        <path d="M20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" />
      </svg>
    </span>
    <button
      class="music-player-mini-text"
      @click="toggle"
      aria-label="展開音樂播放器"
      title="展開音樂播放器"
    >
      <span class="music-player-mini-title">{{ currentTitle }}</span>
      <span class="music-player-mini-subtitle">{{ currentAuthor || '點擊展開' }}</span>
    </button>
    <button
      class="music-player-mini-skip"
      @click="skipMiniTrack('back')"
      aria-label="上一首"
      title="上一首"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 6 9 12l10 6V6Z" />
        <path d="M5 5v14" />
      </svg>
    </button>
    <button
      class="music-player-mini-play"
      @click="toggleMiniPlay"
      :aria-label="isPlaying ? '暫停音樂' : '播放音樂'"
      :title="isPlaying ? '暫停' : '播放'"
    >
      <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14" />
        <path d="M16 5v14" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7Z" />
      </svg>
    </button>
    <button
      class="music-player-mini-skip"
      @click="skipMiniTrack('forward')"
      aria-label="下一首"
      title="下一首"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6l10 6-10 6V6Z" />
        <path d="M19 5v14" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { CDN_AUDIO_BY_ID, MUSIC_SERVER, PLAYLIST_API } from '~/data/cdn-audio'

type MetingSong = Record<string, unknown> & {
  id?: string | number
  mid?: string | number
  songmid?: string | number
  song_song_id?: string | number
  songId?: string | number
  cover?: string
  pic?: string
  lrc?: string
  url?: string
}

type APlayerInstance = {
  destroy?: () => void
}

declare global {
  interface Window {
    APlayer?: new (options: {
      container: HTMLElement
      autoplay?: boolean
      lrcType?: number
      audio: MetingSong[]
    }) => APlayerInstance
  }
}

// 默认设为 false，确保初始状态是展开的
const hidden = ref(false)
const player = ref<HTMLElement | null>(null)
const aplayerContainer = ref<HTMLElement | null>(null)
const currentTitle = ref('音樂播放器')
const currentAuthor = ref('點擊展開')
const currentCover = ref('')
const isPlaying = ref(false)

let aplayer: APlayerInstance | null = null
let playerObserver: MutationObserver | null = null
let syncTimer: number | undefined

const miniCoverStyle = computed(() => (
  currentCover.value
    ? { backgroundImage: currentCover.value }
    : {}
))

const hasCover = computed(() => Boolean(currentCover.value))

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
    initPlayer().catch(() => {
      currentTitle.value = '音樂載入失敗'
      currentAuthor.value = '點擊稍後重試'
    })
  }, 300)
})

onBeforeUnmount(() => {
  playerObserver?.disconnect()
  if (syncTimer) {
    window.clearInterval(syncTimer)
  }
  aplayer?.destroy?.()
  aplayer = null
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

function startPlayerSync() {
  syncCurrentTrack()

  syncTimer = window.setInterval(syncCurrentTrack, 1000)
  playerObserver = new MutationObserver(syncCurrentTrack)

  if (player.value) {
    playerObserver.observe(player.value, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ['class', 'style']
    })
  }
}

async function initPlayer() {
  if (!aplayerContainer.value) {
    return
  }

  const APlayer = await waitForAPlayer()
  const songs = await fetchPlaylist()

  aplayer?.destroy?.()
  aplayer = new APlayer({
    container: aplayerContainer.value,
    autoplay: false,
    lrcType: 3,
    audio: songs
  })

  startPlayerSync()
}

async function fetchPlaylist() {
  const response = await fetch(PLAYLIST_API)

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.status}`)
  }

  const songs = await response.json() as MetingSong[]

  if (!Array.isArray(songs)) {
    throw new Error('Playlist API did not return an array')
  }

  return songs.map((song) => {
    const songId = getSongId(song)
    const cdnUrl = songId ? CDN_AUDIO_BY_ID[`${MUSIC_SERVER}:${songId}`] : undefined
    const normalizedSong = {
      ...song,
      cover: song.cover ?? song.pic
    }

    return cdnUrl
      ? { ...normalizedSong, url: cdnUrl }
      : normalizedSong
  })
}

function getSongId(song: MetingSong) {
  const songId = song.id ?? song.mid ?? song.songmid ?? song.song_song_id ?? song.songId
  if (songId !== undefined && songId !== null) {
    return String(songId)
  }

  return getSongIdFromUrl(song.url) || getSongIdFromUrl(song.lrc)
}

function getSongIdFromUrl(value: unknown) {
  if (typeof value !== 'string' || !value) {
    return ''
  }

  try {
    return new URL(value, window.location.origin).searchParams.get('id') || ''
  } catch (e) {
    return ''
  }
}

function waitForAPlayer() {
  if (window.APlayer) {
    return Promise.resolve(window.APlayer)
  }

  return new Promise<NonNullable<typeof window.APlayer>>((resolve, reject) => {
    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1

      if (window.APlayer) {
        window.clearInterval(timer)
        resolve(window.APlayer)
      } else if (attempts >= 50) {
        window.clearInterval(timer)
        reject(new Error('APlayer script was not loaded'))
      }
    }, 100)
  })
}

function syncCurrentTrack() {
  const root = player.value
  if (!root) {
    return
  }

  const title = root.querySelector<HTMLElement>('.aplayer-title')?.textContent?.trim()
  const author = root.querySelector<HTMLElement>('.aplayer-author')?.textContent
    ?.replace(/^\s*-\s*/, '')
    .trim()
  const cover = root.querySelector<HTMLElement>('.aplayer-pic')?.style.backgroundImage
  const playButton = root.querySelector<HTMLElement>('.aplayer-pic .aplayer-button')

  if (title) {
    currentTitle.value = title
  }

  currentAuthor.value = author || '點擊展開'
  currentCover.value = cover && cover !== 'none' ? cover : ''
  isPlaying.value = Boolean(playButton?.classList.contains('aplayer-pause'))
}

function toggleMiniPlay() {
  const playButton = player.value?.querySelector<HTMLElement>('.aplayer-pic .aplayer-button')
  playButton?.click()
  window.setTimeout(syncCurrentTrack, 120)
}

function skipMiniTrack(direction: 'back' | 'forward') {
  const selector = direction === 'back' ? '.aplayer-icon-back' : '.aplayer-icon-forward'
  const button = player.value?.querySelector<HTMLElement>(selector)
  button?.click()
  window.setTimeout(syncCurrentTrack, 180)
}
</script>
