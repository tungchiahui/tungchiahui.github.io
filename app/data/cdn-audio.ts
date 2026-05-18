export const MUSIC_SERVER = 'tencent'
export const MUSIC_PLAYLIST_TYPE = 'playlist'
export const MUSIC_PLAYLIST_ID = '9619599108'
export const METING_API = 'https://music.3e0.cn/?server=:server&type=:type&id=:id'

export const CDN_AUDIO_BY_ID: Record<string, string> = {
  // Example:
  'tencent:000DNTXj0gJF8O': 'https://cdn.tungchiahui.cn/tungwebsite/assets/music/马也_Crabbit%20Cole先生%20-%20海屿你.mp3',
}

export const PLAYLIST_API = METING_API
  .replace(':server', encodeURIComponent(MUSIC_SERVER))
  .replace(':type', encodeURIComponent(MUSIC_PLAYLIST_TYPE))
  .replace(':id', encodeURIComponent(MUSIC_PLAYLIST_ID))
