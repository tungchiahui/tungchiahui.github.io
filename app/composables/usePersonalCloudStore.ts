import { computed, onMounted, ref } from 'vue'

type DataType = 'tech-footprint' | 'weight-loss'
type SyncState = 'local' | 'loading' | 'syncing' | 'synced' | 'error' | 'conflict'
const SESSION_TOKEN = 'personal_edit_token_session'
const REMEMBERED_TOKEN = 'personal_edit_token_remembered'

export function usePersonalCloudStore(type: DataType) {
  const token = ref('')
  const remembered = ref(false)
  const syncState = ref<SyncState>('local')
  const syncError = ref('')
  const isEditor = computed(() => Boolean(token.value))

  onMounted(() => {
    const persistent = localStorage.getItem(REMEMBERED_TOKEN) || ''
    token.value = persistent || sessionStorage.getItem(SESSION_TOKEN) || ''
    remembered.value = Boolean(persistent)
  })

  async function unlock(secret: string, remember: boolean) {
    const response = await fetch('/api/personal-data/unlock', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret, remember }) })
    const body = await response.json()
    if (!response.ok) throw new Error(body.error || '无法进入编辑模式。')
    token.value = body.token
    remembered.value = remember
    if (remember) { localStorage.setItem(REMEMBERED_TOKEN, body.token); sessionStorage.removeItem(SESSION_TOKEN) }
    else { sessionStorage.setItem(SESSION_TOKEN, body.token); localStorage.removeItem(REMEMBERED_TOKEN) }
  }

  function lock() {
    token.value = ''; remembered.value = false
    localStorage.removeItem(REMEMBERED_TOKEN); sessionStorage.removeItem(SESSION_TOKEN)
  }

  async function load<T>() {
    syncState.value = 'loading'; syncError.value = ''
    try {
      const response = await fetch(`/api/personal-data/${type}`, { cache: 'no-store' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || '云端读取失败。')
      syncState.value = body.data ? 'synced' : 'local'
      return (body.data || null) as T | null
    } catch (error) { syncState.value = 'error'; syncError.value = error instanceof Error ? error.message : '云端读取失败。'; return null }
  }

  async function save<T>(payload: T) {
    if (!token.value) throw new Error('请先进入编辑模式。')
    syncState.value = 'syncing'; syncError.value = ''
    const response = await fetch(`/api/personal-data/${type}`, { method: 'PUT', headers: { 'content-type': 'application/json', authorization: `Bearer ${token.value}` }, body: JSON.stringify(payload) })
    const body = await response.json()
    if (!response.ok) {
      if (response.status === 401) lock()
      syncState.value = response.status === 409 ? 'conflict' : 'error'
      syncError.value = body.error || '云端写入失败。'
      const error = new Error(syncError.value) as Error & { data?: unknown }
      error.data = body.data
      throw error
    }
    syncState.value = 'synced'
    return body.data as T
  }

  return { isEditor, remembered, syncState, syncError, unlock, lock, load, save }
}
