import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const CONFIG_FILE = 'app/data/cdn-audio.ts'
const DEFAULT_LOCAL_DIR = '/home/tungchiahui/Desktop/music'
const DEFAULT_CDN_BASE_URL = 'https://cdn.tungchiahui.cn/tungwebsite/assets/music'
const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.m4a', '.aac', '.ogg', '.wav'])

const args = parseArgs(process.argv.slice(2))
const localDir = args.dir || DEFAULT_LOCAL_DIR
const cdnBaseUrl = trimEndSlash(args.cdnBaseUrl || DEFAULT_CDN_BASE_URL)
const config = await readMusicConfig(CONFIG_FILE)
const playlistApi = buildPlaylistApi(config)
const songs = await fetchPlaylist(playlistApi)
const files = await readAudioFiles(localDir)
const matchedEntries = []
const unmatchedSongs = []
const usedFileNames = new Set()

for (const song of songs) {
  const songId = getSongId(song)
  const match = findBestFileMatch(song, files)

  if (!songId || !match) {
    unmatchedSongs.push({
      id: songId || '(no id)',
      name: song.name || '',
      artist: song.artist || '',
      reason: songId ? 'no local file match' : 'no song id'
    })
    continue
  }

  const key = `${config.MUSIC_SERVER}:${songId}`
  const url = `${cdnBaseUrl}/${encodePathSegment(match.name)}`
  matchedEntries.push({ key, url, song, file: match.name })
  usedFileNames.add(match.name)
}

const unmatchedFiles = files
  .filter((file) => !usedFileNames.has(file.name))
  .map((file) => file.name)

printResult({
  localDir,
  playlistApi,
  matchedEntries,
  unmatchedSongs,
  unmatchedFiles,
  totalSongs: songs.length,
  totalFiles: files.length
})

function parseArgs(argv) {
  const result = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dir') {
      result.dir = argv[index + 1]
      index += 1
    } else if (arg === '--cdn-base-url') {
      result.cdnBaseUrl = argv[index + 1]
      index += 1
    }
  }

  return result
}

async function readMusicConfig(filePath) {
  const text = await readFile(filePath, 'utf8')

  return {
    MUSIC_SERVER: readExportedString(text, 'MUSIC_SERVER'),
    MUSIC_PLAYLIST_TYPE: readExportedString(text, 'MUSIC_PLAYLIST_TYPE'),
    MUSIC_PLAYLIST_ID: readExportedString(text, 'MUSIC_PLAYLIST_ID'),
    METING_API: readExportedString(text, 'METING_API')
  }
}

function readExportedString(text, name) {
  const match = text.match(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*(['"])(.*?)\\1`))

  if (!match) {
    throw new Error(`Cannot find ${name} in ${CONFIG_FILE}`)
  }

  return match[2]
}

function buildPlaylistApi(config) {
  return config.METING_API
    .replace(':server', encodeURIComponent(config.MUSIC_SERVER))
    .replace(':type', encodeURIComponent(config.MUSIC_PLAYLIST_TYPE))
    .replace(':id', encodeURIComponent(config.MUSIC_PLAYLIST_ID))
}

async function fetchPlaylist(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`)
  }

  const songs = await response.json()

  if (!Array.isArray(songs)) {
    throw new Error('Playlist API did not return an array')
  }

  return songs
}

async function readAudioFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => AUDIO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .map((name) => ({
      name,
      stem: path.basename(name, path.extname(name)),
      normalized: normalizeName(path.basename(name, path.extname(name)))
    }))
}

function findBestFileMatch(song, files) {
  const name = String(song.name || '')
  const artist = String(song.artist || '')
  const artists = artist.split(/[\/⁄、,，&]| feat\.? | ft\.? /i).map((item) => item.trim()).filter(Boolean)
  const candidates = new Set([
    `${name}-${artist}`,
    `${artist}-${name}`,
    `${name} - ${artist}`,
    `${artist} - ${name}`
  ])

  for (const singleArtist of artists) {
    candidates.add(`${name}-${singleArtist}`)
    candidates.add(`${singleArtist}-${name}`)
  }

  for (const candidate of candidates) {
    const normalized = normalizeName(candidate)
    const exactMatch = files.find((file) => file.normalized === normalized)

    if (exactMatch) {
      return exactMatch
    }
  }

  const normalizedName = normalizeName(name)

  return files.find((file) => {
    if (!file.normalized.includes(normalizedName)) {
      return false
    }

    return artists.some((singleArtist) => file.normalized.includes(normalizeName(singleArtist)))
  })
}

function getSongId(song) {
  const songId = song.id ?? song.mid ?? song.songmid ?? song.song_song_id ?? song.songId

  if (songId !== undefined && songId !== null) {
    return String(songId)
  }

  return getSongIdFromUrl(song.url) || getSongIdFromUrl(song.lrc)
}

function getSongIdFromUrl(value) {
  if (typeof value !== 'string' || !value) {
    return ''
  }

  try {
    return new URL(value, 'https://example.com').searchParams.get('id') || ''
  } catch {
    return ''
  }
}

function normalizeName(value) {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[＿_]/g, '-')
    .replace(/[⁄/、,，&.·]/g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
}

function encodePathSegment(value) {
  return value
    .split('/')
    .map((segment) => segment
      .replace(/%/g, '%25')
      .replace(/ /g, '%20')
      .replace(/#/g, '%23')
      .replace(/\?/g, '%3F'))
    .join('/')
}

function trimEndSlash(value) {
  return value.replace(/\/+$/, '')
}

function printResult({ localDir, playlistApi, matchedEntries, unmatchedSongs, unmatchedFiles, totalSongs, totalFiles }) {
  console.log(`Local dir: ${localDir}`)
  console.log(`Playlist API: ${playlistApi}`)
  console.log(`Matched: ${matchedEntries.length}/${totalSongs} songs, files: ${totalFiles}`)
  console.log(`Unmatched local files: ${unmatchedFiles.length}`)
  console.log('')
  console.log('Paste these entries into CDN_AUDIO_BY_ID:')
  console.log('')

  for (const entry of matchedEntries) {
    console.log(`  '${entry.key}': '${entry.url}',`)
  }

  if (!unmatchedSongs.length) {
    return
  }

  console.log('')
  console.log('Unmatched songs:')

  for (const song of unmatchedSongs) {
    console.log(`  ${song.id} | ${song.name} - ${song.artist} (${song.reason})`)
  }

  if (!unmatchedFiles.length) {
    return
  }

  console.log('')
  console.log('Unmatched local files:')

  for (const fileName of unmatchedFiles) {
    console.log(`  ${fileName}`)
  }
}
