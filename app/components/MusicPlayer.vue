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
import type { MusicSong, SiteAPlayerInstance, SiteAPlayerListSwitchEvent } from '~/composables/useSiteMusicPlayer'

type MetingSong = MusicSong
type APlayerInstance = SiteAPlayerInstance
type APlayerListSwitchEvent = SiteAPlayerListSwitchEvent

// 默认设为 false，确保初始状态是展开的
const hidden = ref(false)
const player = ref<HTMLElement | null>(null)
const aplayerContainer = ref<HTMLElement | null>(null)
const musicPlayer = useSiteMusicPlayer()
const {
  currentAuthor,
  currentCoverStyle,
  currentTitle,
  isPlaying
} = musicPlayer

let aplayer: APlayerInstance | null = null
let playerObserver: MutationObserver | null = null
let syncTimer: number | undefined
let autoResumeTimer: number | undefined
let pendingAutoResumeIndex: number | null = null
let autoResumeAttempts = 0
let lastListSwitchAt = 0
let cdnRecoveryTimer: number | undefined
let cdnGlobalFallbackTimer: number | undefined
let cdnRecoveryTrackKey = ''
let primaryCdnReconnectAttempts = 0

const AUTO_RESUME_DELAYS = [180, 450, 900, 1600, 2800, 4200]
const PRIMARY_CDN_RECONNECT_DELAYS = [160, 420]
const CDN_GLOBAL_FALLBACK_DELAY = 1800
const PRIMARY_CDN_HOST = 'cdn.tungchiahui.cn'
const GLOBAL_CDN_HOST = 'global.cdn.tungchiahui.cn'
const CDN_RECONNECT_PARAM = 'music_cdn_retry'

const miniCoverStyle = computed(() => (
  currentCoverStyle.value
    ? { backgroundImage: currentCoverStyle.value }
    : {}
))

const hasCover = computed(() => Boolean(currentCoverStyle.value))

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
      musicPlayer.setLoadError('音樂載入失敗')
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
  clearAutoResume()
  clearCdnRecovery()
  musicPlayer.unregister(aplayer)
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

  musicPlayer.clearLoadError()
  musicPlayer.setSongs(songs)
  musicPlayer.unregister(aplayer)
  aplayer?.destroy?.()
  aplayer = new APlayer({
    container: aplayerContainer.value,
    autoplay: false,
    lrcType: 3,
    preload: 'auto',
    audio: songs
  })

  musicPlayer.register(aplayer)
  bindAutoResume(aplayer)
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
  const coverStyle = root.querySelector<HTMLElement>('.aplayer-pic')?.style.backgroundImage
  const playButton = root.querySelector<HTMLElement>('.aplayer-pic .aplayer-button')
  const currentIndex = aplayer ? getCurrentTrackIndex(aplayer) : null
  const currentSong = typeof currentIndex === 'number' ? aplayer?.list?.audios?.[currentIndex] : null
  const coverUrl = getTextValue(currentSong?.cover) || getTextValue(currentSong?.pic)

  musicPlayer.updatePlaybackState({
    author,
    coverStyle: coverStyle && coverStyle !== 'none' ? coverStyle : '',
    coverUrl,
    currentIndex,
    currentTime: aplayer?.audio?.currentTime,
    duration: aplayer?.audio?.duration,
    isPlaying: Boolean(playButton?.classList.contains('aplayer-pause')),
    title
  })
}

function bindAutoResume(instance: APlayerInstance) {
  instance.on?.('listswitch', (payload) => {
    lastListSwitchAt = Date.now()

    if (wantsPlayback(instance)) {
      queueAutoResume(getSwitchIndex(payload) ?? getCurrentTrackIndex(instance))
    } else {
      clearAutoResume()
    }
  })

  instance.on?.('ended', () => {
    if (wantsPlayback(instance)) {
      queueAutoResume(getCurrentTrackIndex(instance))
    }
  })

  instance.on?.('loadeddata', () => attemptAutoResume())
  instance.on?.('canplay', () => attemptAutoResume())
  instance.on?.('canplaythrough', () => attemptAutoResume())
  instance.on?.('waiting', () => {
    if (wantsPlayback(instance)) {
      queueAutoResume(getCurrentTrackIndex(instance), true)
    }
  })
  instance.on?.('error', () => {
    if (!wantsPlayback(instance)) {
      return
    }

    if (recoverCurrentTrackCdnFailure(instance)) {
      return
    }
  })
  instance.on?.('playing', () => {
    clearAutoResume()
    clearCdnRecovery()
  })
  instance.on?.('pause', () => {
    if (Date.now() - lastListSwitchAt > 800) {
      clearAutoResume()
      clearCdnRecovery()
    }
  })
}

function queueAutoResume(index: number | null, keepAttempts = false) {
  if (index === null) {
    return
  }

  pendingAutoResumeIndex = index
  if (!keepAttempts) {
    autoResumeAttempts = 0
  }

  scheduleAutoResume()
}

function scheduleAutoResume(delay = AUTO_RESUME_DELAYS[Math.min(autoResumeAttempts, AUTO_RESUME_DELAYS.length - 1)]) {
  if (autoResumeTimer) {
    window.clearTimeout(autoResumeTimer)
  }

  autoResumeTimer = window.setTimeout(() => {
    autoResumeTimer = undefined
    attemptAutoResume()
  }, delay)
}

function attemptAutoResume() {
  if (!aplayer || pendingAutoResumeIndex === null) {
    return
  }

  const currentIndex = getCurrentTrackIndex(aplayer)
  if (currentIndex !== null && currentIndex !== pendingAutoResumeIndex) {
    clearAutoResume()
    return
  }

  if (!wantsPlayback(aplayer)) {
    clearAutoResume()
    return
  }

  const audio = aplayer.audio
  if (audio && !audio.paused && !audio.ended) {
    clearAutoResume()
    return
  }

  try {
    aplayer.play?.()
  } catch (e) {}

  window.setTimeout(() => {
    if (!aplayer || pendingAutoResumeIndex === null) {
      return
    }

    const audio = aplayer.audio
    if (audio && !audio.paused && !audio.ended) {
      clearAutoResume()
      return
    }

    autoResumeAttempts += 1
    if (autoResumeAttempts < AUTO_RESUME_DELAYS.length) {
      scheduleAutoResume()
    } else {
      clearAutoResume()
    }
  }, 120)
}

function recoverCurrentTrackCdnFailure(instance: APlayerInstance) {
  const index = getCurrentTrackIndex(instance)
  if (index === null) {
    return false
  }

  const song = instance.list?.audios?.[index]
  if (!song || !isPrimaryCdnUrl(song.url)) {
    return false
  }

  const trackKey = getCdnRecoveryTrackKey(index, song)
  if (cdnRecoveryTrackKey !== trackKey) {
    clearCdnRecovery()
    cdnRecoveryTrackKey = trackKey
    scheduleGlobalCdnFallback(instance, index, song)
  }

  if (primaryCdnReconnectAttempts < PRIMARY_CDN_RECONNECT_DELAYS.length) {
    primaryCdnReconnectAttempts += 1
    schedulePrimaryCdnReconnect(
      instance,
      index,
      song,
      getPrimaryCdnReconnectUrl(song.url, primaryCdnReconnectAttempts),
      PRIMARY_CDN_RECONNECT_DELAYS[primaryCdnReconnectAttempts - 1] ?? 0
    )
    return true
  }

  const fallbackUrl = getGlobalCdnFallbackUrl(song.url)
  if (!fallbackUrl) {
    return false
  }

  reloadCurrentTrackWithUrl(instance, index, song, fallbackUrl)

  return true
}

function scheduleGlobalCdnFallback(
  instance: APlayerInstance,
  index: number,
  song: MetingSong
) {
  if (cdnGlobalFallbackTimer) {
    return
  }

  cdnGlobalFallbackTimer = window.setTimeout(() => {
    cdnGlobalFallbackTimer = undefined

    if (!wantsPlayback(instance) || getCurrentTrackIndex(instance) !== index || !isPrimaryCdnUrl(song.url)) {
      return
    }

    const fallbackUrl = getGlobalCdnFallbackUrl(song.url)
    if (fallbackUrl) {
      reloadCurrentTrackWithUrl(instance, index, song, fallbackUrl)
    }
  }, CDN_GLOBAL_FALLBACK_DELAY)
}

function schedulePrimaryCdnReconnect(
  instance: APlayerInstance,
  index: number,
  song: MetingSong,
  retryUrl: string,
  delay: number
) {
  if (!retryUrl) {
    return
  }

  if (cdnRecoveryTimer) {
    window.clearTimeout(cdnRecoveryTimer)
  }

  cdnRecoveryTimer = window.setTimeout(() => {
    cdnRecoveryTimer = undefined

    if (!wantsPlayback(instance) || getCurrentTrackIndex(instance) !== index) {
      return
    }

    reloadCurrentTrackWithUrl(instance, index, song, retryUrl)
  }, delay)
}

function reloadCurrentTrackWithUrl(
  instance: APlayerInstance,
  index: number,
  song: MetingSong,
  url: string
) {
  song.url = url
  queueAutoResume(index)
  instance.list?.switch?.(index)

  try {
    instance.play?.()
  } catch (e) {}
}

function getPrimaryCdnReconnectUrl(value: unknown, attempt: number) {
  const url = getCdnUrl(value)
  if (!url || url.hostname !== PRIMARY_CDN_HOST) {
    return ''
  }

  url.searchParams.set(CDN_RECONNECT_PARAM, `${attempt}-${Date.now()}`)
  return url.toString()
}

function getGlobalCdnFallbackUrl(value: unknown) {
  const url = getCdnUrl(value)
  if (!url || url.hostname !== PRIMARY_CDN_HOST) {
    return ''
  }

  url.hostname = GLOBAL_CDN_HOST
  url.searchParams.delete(CDN_RECONNECT_PARAM)
  return url.toString()
}

function getCdnRecoveryTrackKey(index: number, song: MetingSong) {
  return `${index}:${getSongId(song) || getCanonicalCdnUrl(song.url)}`
}

function isPrimaryCdnUrl(value: unknown) {
  return getCdnUrl(value)?.hostname === PRIMARY_CDN_HOST
}

function getCanonicalCdnUrl(value: unknown) {
  const url = getCdnUrl(value)
  if (!url) {
    return ''
  }

  url.hostname = PRIMARY_CDN_HOST
  url.searchParams.delete(CDN_RECONNECT_PARAM)
  return url.toString()
}

function getCdnUrl(value: unknown) {
  if (typeof value !== 'string' || !value) {
    return null
  }

  try {
    const url = new URL(value, window.location.origin)
    if (url.hostname !== PRIMARY_CDN_HOST && url.hostname !== GLOBAL_CDN_HOST) {
      return null
    }

    return url
  } catch (e) {
    return null
  }
}

function clearAutoResume() {
  if (autoResumeTimer) {
    window.clearTimeout(autoResumeTimer)
    autoResumeTimer = undefined
  }

  pendingAutoResumeIndex = null
  autoResumeAttempts = 0
}

function clearCdnRecovery() {
  if (cdnRecoveryTimer) {
    window.clearTimeout(cdnRecoveryTimer)
    cdnRecoveryTimer = undefined
  }
  if (cdnGlobalFallbackTimer) {
    window.clearTimeout(cdnGlobalFallbackTimer)
    cdnGlobalFallbackTimer = undefined
  }

  cdnRecoveryTrackKey = ''
  primaryCdnReconnectAttempts = 0
}

function wantsPlayback(instance: APlayerInstance) {
  return instance.paused === false || isPlaying.value
}

function getCurrentTrackIndex(instance: APlayerInstance) {
  return typeof instance.list?.index === 'number' ? instance.list.index : null
}

function getSwitchIndex(payload: APlayerListSwitchEvent | Event | undefined) {
  if (!payload || !('index' in payload) || typeof payload.index !== 'number') {
    return null
  }

  return payload.index
}

function toggleMiniPlay() {
  if (isPlaying.value) {
    clearAutoResume()
    clearCdnRecovery()
  }

  musicPlayer.togglePlayback()
  window.setTimeout(syncCurrentTrack, 120)
}

function skipMiniTrack(direction: 'back' | 'forward') {
  musicPlayer.skip(direction)
  window.setTimeout(syncCurrentTrack, 180)
}

function getTextValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}
</script>
