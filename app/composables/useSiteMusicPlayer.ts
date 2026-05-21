import { computed, ref, shallowRef } from 'vue'

export type MusicSong = Record<string, unknown> & {
  id?: string | number
  mid?: string | number
  songmid?: string | number
  song_song_id?: string | number
  songId?: string | number
  name?: string
  title?: string
  artist?: string
  author?: string
  singer?: string
  cover?: string
  pic?: string
  lrc?: string
  url?: string
}

export type SiteAPlayerEventName =
  | 'canplay'
  | 'canplaythrough'
  | 'ended'
  | 'error'
  | 'listswitch'
  | 'loadeddata'
  | 'pause'
  | 'playing'
  | 'waiting'

export type SiteAPlayerListSwitchEvent = {
  index?: number
}

export type SiteAPlayerInstance = {
  audio?: HTMLAudioElement
  destroy?: () => void
  list?: {
    audios?: MusicSong[]
    index?: number
    switch?: (index: number) => void
  }
  on?: (eventName: SiteAPlayerEventName, handler: (payload?: SiteAPlayerListSwitchEvent | Event) => void) => void
  pause?: () => void
  paused?: boolean
  play?: () => void
  seek?: (time: number) => void
  skipBack?: () => void
  skipForward?: () => void
  toggle?: () => void
}

declare global {
  interface Window {
    APlayer?: new (options: {
      container: HTMLElement
      autoplay?: boolean
      lrcType?: number
      preload?: 'none' | 'metadata' | 'auto'
      audio: MusicSong[]
    }) => SiteAPlayerInstance
  }
}

type PlaybackState = {
  author?: string
  coverStyle?: string
  coverUrl?: string
  currentIndex?: number | null
  currentTime?: number
  duration?: number
  isPlaying?: boolean
  title?: string
}

const instance = shallowRef<SiteAPlayerInstance | null>(null)
const songs = ref<MusicSong[]>([])
const currentIndex = ref(-1)
const currentTitle = ref('音樂播放器')
const currentAuthor = ref('點擊展開')
const currentCoverUrl = ref('')
const currentCoverStyle = ref('')
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isReady = ref(false)
const loadError = ref('')
const playbackIntent = ref(false)
const volume = ref(0.8)

const currentSong = computed(() => {
  const list = getInstanceSongs()
  return currentIndex.value >= 0 ? list[currentIndex.value] || null : null
})

const progress = computed(() => {
  if (!duration.value) {
    return 0
  }

  return Math.min(1, Math.max(0, currentTime.value / duration.value))
})

export function useSiteMusicPlayer() {
  return {
    currentAuthor,
    currentCoverStyle,
    currentCoverUrl,
    currentIndex,
    currentSong,
    currentTime,
    currentTitle,
    duration,
    instance,
    isPlaying,
    isReady,
    loadError,
    playbackIntent,
    progress,
    songs,
    volume,
    clearLoadError,
    pause,
    play,
    register,
    seekToRatio,
    setPlaybackIntent,
    setLoadError,
    setSongs,
    setVolume,
    skip,
    switchTrack,
    syncFromInstance,
    togglePlayback,
    unregister,
    updatePlaybackState
  }
}

function register(player: SiteAPlayerInstance) {
  instance.value = player
  isReady.value = true
  loadError.value = ''

  if (typeof player.audio?.volume === 'number') {
    volume.value = player.audio.volume
  }

  syncFromInstance()
}

function unregister(player?: SiteAPlayerInstance | null) {
  if (!player || instance.value === player) {
    instance.value = null
    isReady.value = false
    isPlaying.value = false
    playbackIntent.value = false
  }
}

function setSongs(nextSongs: MusicSong[]) {
  songs.value = nextSongs
}

function setLoadError(message: string) {
  loadError.value = message
  isReady.value = false
}

function clearLoadError() {
  loadError.value = ''
}

function updatePlaybackState(state: PlaybackState) {
  if (typeof state.currentIndex === 'number') {
    currentIndex.value = state.currentIndex
  }

  const song = currentSong.value
  const title = state.title || getSongTitle(song)
  const author = state.author || getSongAuthor(song)
  const coverUrl = state.coverUrl || getSongCover(song)

  if (title) {
    currentTitle.value = title
  }

  currentAuthor.value = author || '點擊展開'
  currentCoverUrl.value = coverUrl
  currentCoverStyle.value = state.coverStyle || (coverUrl ? `url("${coverUrl}")` : '')

  if (typeof state.isPlaying === 'boolean') {
    isPlaying.value = state.isPlaying
    if (state.isPlaying) {
      playbackIntent.value = true
    }
  }

  if (typeof state.currentTime === 'number' && Number.isFinite(state.currentTime)) {
    currentTime.value = Math.max(0, state.currentTime)
  }

  if (typeof state.duration === 'number' && Number.isFinite(state.duration)) {
    duration.value = Math.max(0, state.duration)
  }
}

function syncFromInstance(state: PlaybackState = {}) {
  const player = instance.value
  if (!player) {
    updatePlaybackState(state)
    return
  }

  updatePlaybackState({
    currentIndex: getCurrentIndex(player),
    currentTime: player.audio?.currentTime,
    duration: player.audio?.duration,
    isPlaying: getInstanceIsPlaying(player),
    ...state
  })
}

function play() {
  playbackIntent.value = true
  isPlaying.value = true

  try {
    instance.value?.play?.()
  } catch (e) {}

  scheduleSync()
}

function pause() {
  try {
    instance.value?.pause?.()
  } catch (e) {
    instance.value?.audio?.pause()
  }

  isPlaying.value = false
  playbackIntent.value = false
  scheduleSync()
}

function togglePlayback() {
  const player = instance.value

  if (player ? (getInstanceIsPlaying(player) || playbackIntent.value) : (isPlaying.value || playbackIntent.value)) {
    pause()
  } else {
    play()
  }
}

function skip(direction: 'back' | 'forward') {
  const player = instance.value
  if (!player) {
    return
  }

  if (getInstanceIsPlaying(player) || playbackIntent.value) {
    playbackIntent.value = true
  }

  if (direction === 'back') {
    if (player.skipBack) {
      player.skipBack()
    } else {
      switchTrack(getWrappedIndex(currentIndex.value - 1))
    }
  } else if (player.skipForward) {
    player.skipForward()
  } else {
    switchTrack(getWrappedIndex(currentIndex.value + 1))
  }

  scheduleSync()
}

function switchTrack(index: number) {
  const player = instance.value
  const list = getInstanceSongs()
  if (!player || index < 0 || index >= list.length) {
    return
  }

  player.list?.switch?.(index)
  play()
  scheduleSync(180)
}

function seekToRatio(ratio: number) {
  const player = instance.value
  const nextTime = Math.max(0, Math.min(1, ratio)) * duration.value
  if (!player || !duration.value) {
    return
  }

  if (player.seek) {
    player.seek(nextTime)
  } else if (player.audio) {
    player.audio.currentTime = nextTime
  }

  currentTime.value = nextTime
  scheduleSync()
}

function setVolume(nextVolume: number) {
  volume.value = Math.max(0, Math.min(1, nextVolume))

  if (instance.value?.audio) {
    instance.value.audio.volume = volume.value
  }
}

function setPlaybackIntent(nextPlaybackIntent: boolean) {
  playbackIntent.value = nextPlaybackIntent
}

function getCurrentIndex(player: SiteAPlayerInstance) {
  return typeof player.list?.index === 'number' ? player.list.index : currentIndex.value
}

function getWrappedIndex(index: number) {
  const list = getInstanceSongs()
  if (!list.length) {
    return -1
  }

  return (index + list.length) % list.length
}

function getInstanceSongs() {
  return instance.value?.list?.audios?.length ? instance.value.list.audios : songs.value
}

function getInstanceIsPlaying(player: SiteAPlayerInstance) {
  if (player.audio) {
    return !player.audio.paused && !player.audio.ended
  }

  return player.paused === false
}

function scheduleSync(delay = 120) {
  if (typeof window === 'undefined') {
    return
  }

  window.setTimeout(() => syncFromInstance(), delay)
}

function getSongTitle(song: MusicSong | null) {
  return getTextValue(song?.name) || getTextValue(song?.title) || getTextValue(song?.songname)
}

function getSongAuthor(song: MusicSong | null) {
  return getTextValue(song?.artist) || getTextValue(song?.author) || getTextValue(song?.singer)
}

function getSongCover(song: MusicSong | null) {
  return getTextValue(song?.cover) || getTextValue(song?.pic)
}

function getTextValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(getTextValue).filter(Boolean).join(' / ')
  }

  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}
