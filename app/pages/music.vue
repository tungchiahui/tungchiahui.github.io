<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#app'
import { MUSIC_PLAYLIST_ID } from '~/data/cdn-audio'
import type { MusicSong } from '~/composables/useSiteMusicPlayer'
import { getCurrentLocaleSlug } from '~~/utils/i18n-locales'

const route = useRoute()
const currentLocaleSlug = computed(() => getCurrentLocaleSlug(route.path))
const isEnglish = computed(() => currentLocaleSlug.value === 'en-us')

const player = useSiteMusicPlayer()
const {
  currentAuthor,
  currentCoverStyle,
  currentIndex,
  currentTime,
  currentTitle,
  duration,
  isPlaying,
  isReady,
  loadError,
  progress,
  songs,
  volume
} = player

const qqMusicPlaylistUrl = `https://y.qq.com/n/ryqq/playlist/${MUSIC_PLAYLIST_ID}`

const copy = computed(() => isEnglish.value
  ? {
      title: 'Music Player',
      meta: 'Full-page music player for Tung Chia-hui Lab Notes.',
      kicker: 'Tung Chia-hui Playlist',
      playlist: 'Playlist',
      empty: 'Loading playlist',
      openQq: 'Open QQ Music Playlist',
      ready: 'Ready',
      loading: 'Loading',
      playing: 'Playing',
      paused: 'Paused',
      volume: 'Volume'
    }
  : {
      title: '音乐播放器',
      meta: '东澈的折腾天地全屏音乐播放器。',
      kicker: '东澈的歌单',
      playlist: '播放列表',
      empty: '歌单加载中',
      openQq: '打开 QQ 音乐歌单',
      ready: '已就绪',
      loading: '加载中',
      playing: '播放中',
      paused: '已暂停',
      volume: '音量'
    })

const progressPercent = computed(() => Math.round(progress.value * 1000) / 10)
const volumePercent = computed(() => Math.round(volume.value * 100))
const coverClass = computed(() => ({ 'has-cover': Boolean(currentCoverStyle.value) }))
const statusText = computed(() => {
  if (loadError.value) {
    return loadError.value
  }

  if (!isReady.value) {
    return copy.value.loading
  }

  return isPlaying.value ? copy.value.playing : copy.value.paused
})

useHead(() => ({
  title: copy.value.title,
  meta: [
    {
      name: 'description',
      content: copy.value.meta
    }
  ]
}))

function handleSeek(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  player.seekToRatio(value / 100)
}

function handleVolume(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  player.setVolume(value / 100)
}

function songTitle(song: MusicSong) {
  return getTextValue(song.name) || getTextValue(song.title) || getTextValue(song.songname) || copy.value.playlist
}

function songAuthor(song: MusicSong) {
  return getTextValue(song.artist) || getTextValue(song.author) || getTextValue(song.singer) || copy.value.ready
}

function songCoverStyle(song: MusicSong) {
  const cover = getTextValue(song.cover) || getTextValue(song.pic)
  return cover ? { backgroundImage: `url("${cover}")` } : {}
}

function formatTime(value: number) {
  const total = Math.max(0, Math.floor(Number(value) || 0))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getTextValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(getTextValue).filter(Boolean).join(' / ')
  }

  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}
</script>

<template>
  <div class="music-page">
    <section class="music-hero" aria-labelledby="music-page-title">
      <div
        class="music-cover"
        :class="coverClass"
        :style="currentCoverStyle ? { backgroundImage: currentCoverStyle } : {}"
        aria-hidden="true"
      >
        <i class="fas fa-music"></i>
      </div>

      <div class="music-now">
        <p class="music-kicker">{{ copy.kicker }}</p>
        <h1 id="music-page-title">{{ currentTitle }}</h1>
        <p class="music-author">{{ currentAuthor }}</p>

        <div class="music-progress">
          <span>{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            :value="progressPercent"
            :disabled="!duration"
            aria-label="播放进度"
            @input="handleSeek"
          >
          <span>{{ formatTime(duration) }}</span>
        </div>

        <div class="music-controls" aria-label="音乐控制">
          <button type="button" class="music-icon-button" title="上一首" aria-label="上一首" @click="player.skip('back')">
            <i class="fas fa-backward-step" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="music-play-button"
            :title="isPlaying ? '暂停' : '播放'"
            :aria-label="isPlaying ? '暂停' : '播放'"
            @click="player.togglePlayback()"
          >
            <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'" aria-hidden="true"></i>
          </button>
          <button type="button" class="music-icon-button" title="下一首" aria-label="下一首" @click="player.skip('forward')">
            <i class="fas fa-forward-step" aria-hidden="true"></i>
          </button>
          <a class="music-qq-link" :href="qqMusicPlaylistUrl" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
            <span>{{ copy.openQq }}</span>
          </a>
        </div>
      </div>

      <aside class="music-meta-panel" aria-label="播放器状态">
        <div class="music-status">
          <span class="music-status-dot" :class="{ active: isPlaying }"></span>
          <strong>{{ statusText }}</strong>
        </div>
        <label class="music-volume">
          <span>{{ copy.volume }}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="volumePercent"
            aria-label="音量"
            @input="handleVolume"
          >
          <strong>{{ volumePercent }}%</strong>
        </label>
      </aside>
    </section>

    <section class="music-playlist" aria-labelledby="music-playlist-title">
      <header class="music-section-head">
        <h2 id="music-playlist-title">{{ copy.playlist }}</h2>
        <span>{{ songs.length }}</span>
      </header>

      <div v-if="songs.length" class="music-track-list">
        <button
          v-for="(song, index) in songs"
          :key="`${song.id || song.mid || song.url || index}`"
          type="button"
          class="music-track"
          :class="{ active: index === currentIndex }"
          @click="player.switchTrack(index)"
        >
          <span class="music-track-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="music-track-cover" :style="songCoverStyle(song)" aria-hidden="true">
            <i class="fas fa-music"></i>
          </span>
          <span class="music-track-copy">
            <strong>{{ songTitle(song) }}</strong>
            <small>{{ songAuthor(song) }}</small>
          </span>
          <i class="fas fa-wave-square music-track-playing" aria-hidden="true"></i>
        </button>
      </div>

      <div v-else class="music-empty">{{ copy.empty }}</div>
    </section>
  </div>
</template>

<style scoped>
.music-page {
  --music-accent: #14b8a6;
  --music-accent-strong: #0f766e;
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 1120px;
  padding: 20px 0 36px;
}

.music-hero {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--bg-color, #fff) 88%, #ecfeff), var(--bg-color, #fff));
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 18px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr) minmax(220px, 260px);
  padding: clamp(18px, 3vw, 30px);
}

.music-cover {
  align-items: center;
  aspect-ratio: 1;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--music-accent) 24%, transparent), rgba(59, 130, 246, 0.14)),
    var(--bg-secondary, #f7f7f8);
  background-position: center;
  background-size: cover;
  border: 1px solid color-mix(in srgb, var(--music-accent) 26%, var(--nav-border, #e5e7eb));
  border-radius: 16px;
  box-shadow: 0 18px 34px rgba(15, 118, 110, 0.18);
  color: var(--music-accent-strong);
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.music-cover.has-cover i {
  display: none;
}

.music-cover i {
  font-size: clamp(3rem, 8vw, 5.6rem);
}

.music-now {
  align-content: center;
  display: grid;
  gap: 14px;
  min-width: 0;
}

.music-kicker {
  color: var(--music-accent-strong);
  font-size: 0.9rem;
  font-weight: 800;
  margin: 0;
}

.music-now h1 {
  color: var(--text-main, #1f1f1f);
  font-size: clamp(2rem, 5vw, 4.2rem);
  line-height: 1.05;
  margin: 0;
  overflow-wrap: anywhere;
}

.music-author {
  color: var(--text-secondary, #666);
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
}

.music-progress,
.music-volume {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.music-progress span,
.music-volume span,
.music-volume strong {
  color: var(--text-secondary, #666);
  font-size: 0.86rem;
  font-weight: 800;
}

.music-progress input,
.music-volume input {
  accent-color: var(--music-accent);
  width: 100%;
}

.music-controls {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.music-icon-button,
.music-play-button,
.music-qq-link {
  align-items: center;
  border: 1px solid var(--nav-border, #e5e7eb);
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  text-decoration: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.music-icon-button,
.music-play-button {
  background: var(--bg-color, #fff);
  color: var(--text-main, #1f1f1f);
}

.music-icon-button {
  border-radius: 12px;
  height: 44px;
  width: 44px;
}

.music-play-button {
  background: var(--music-accent);
  border-color: transparent;
  border-radius: 14px;
  color: #fff;
  height: 54px;
  width: 54px;
}

.music-qq-link {
  background: #0f766e;
  border-color: rgba(15, 118, 110, 0.24);
  border-radius: 12px;
  color: #fff;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
}

.music-icon-button:hover,
.music-play-button:hover,
.music-qq-link:hover {
  border-color: color-mix(in srgb, var(--music-accent) 48%, transparent);
  box-shadow: 0 12px 24px rgba(15, 118, 110, 0.22);
  transform: translateY(-1px);
}

.music-meta-panel {
  align-content: center;
  background: color-mix(in srgb, var(--bg-secondary, #f7f7f8) 82%, transparent);
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 14px;
  display: grid;
  gap: 18px;
  padding: 16px;
}

.music-status {
  align-items: center;
  color: var(--text-main, #1f1f1f);
  display: flex;
  gap: 10px;
}

.music-status-dot {
  background: #94a3b8;
  border-radius: 999px;
  height: 10px;
  width: 10px;
}

.music-status-dot.active {
  background: var(--music-accent);
  box-shadow: 0 0 0 7px color-mix(in srgb, var(--music-accent) 18%, transparent);
}

.music-volume {
  grid-template-columns: 48px minmax(0, 1fr) 44px;
}

.music-playlist {
  background: var(--bg-color, #fff);
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 16px;
  padding: 16px;
}

.music-section-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.music-section-head h2 {
  font-size: 1.2rem;
  margin: 0;
}

.music-section-head span {
  color: var(--text-secondary, #666);
  font-weight: 800;
}

.music-track-list {
  display: grid;
  gap: 8px;
}

.music-track {
  align-items: center;
  background: color-mix(in srgb, var(--bg-color, #fff) 94%, #ecfeff);
  border: 1px solid var(--nav-border, #e5e7eb);
  border-radius: 12px;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px 46px minmax(0, 1fr) 24px;
  min-height: 64px;
  padding: 8px 12px;
  text-align: left;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  width: 100%;
}

.music-track:hover,
.music-track.active {
  background: color-mix(in srgb, var(--music-accent) 10%, var(--bg-color, #fff));
  border-color: color-mix(in srgb, var(--music-accent) 44%, transparent);
  transform: translateY(-1px);
}

.music-track-index {
  color: var(--text-secondary, #666);
  font-size: 0.8rem;
  font-weight: 900;
}

.music-track-cover {
  align-items: center;
  aspect-ratio: 1;
  background: var(--bg-secondary, #f7f7f8);
  background-position: center;
  background-size: cover;
  border-radius: 10px;
  color: var(--music-accent-strong);
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.music-track-cover[style*='background-image'] i {
  display: none;
}

.music-track-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.music-track-copy strong,
.music-track-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-track-copy strong {
  color: var(--text-main, #1f1f1f);
  font-size: 0.98rem;
}

.music-track-copy small {
  color: var(--text-secondary, #666);
}

.music-track-playing {
  color: var(--music-accent);
  opacity: 0;
}

.music-track.active .music-track-playing {
  opacity: 1;
}

.music-empty {
  color: var(--text-secondary, #666);
  padding: 38px 12px;
  text-align: center;
}

html.dark .music-page {
  --music-accent: #5eead4;
  --music-accent-strong: #99f6e4;
}

html.dark .music-hero,
html.dark .music-playlist {
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.36);
}

html.dark .music-qq-link {
  background: #14b8a6;
  color: #082f30;
}

@media (max-width: 960px) {
  .music-hero {
    grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
  }

  .music-meta-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 680px) {
  .music-page {
    padding-top: 8px;
  }

  .music-hero {
    border-radius: 14px;
    grid-template-columns: 1fr;
  }

  .music-cover {
    margin: 0 auto;
    max-width: 260px;
    width: 100%;
  }

  .music-now h1 {
    font-size: clamp(1.7rem, 10vw, 2.8rem);
  }

  .music-controls {
    justify-content: center;
  }

  .music-qq-link {
    flex: 1 1 100%;
  }

  .music-track {
    grid-template-columns: 32px 42px minmax(0, 1fr) 18px;
    padding: 8px;
  }
}
</style>
