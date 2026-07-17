import { getStore } from '@edgeone/pages-blob'
import { json, verifyToken } from '../../lib/personal-auth.js'

const allowed = new Set(['tech-footprint', 'weight-loss'])
const keyFor = type => `public/${type}.json`
const validPayload = (type, value) => value && typeof value === 'object'
  && Number.isInteger(value.revision) && value.revision >= 0
  && (type === 'tech-footprint' ? value.records && typeof value.records === 'object' : Array.isArray(value.records))

export async function onRequestGet({ params }) {
  const type = String(params.type || '')
  if (!allowed.has(type)) return json({ error: 'Not found' }, 404)
  const store = getStore({ name: 'personal-data', consistency: 'strong' })
  const data = await store.get(keyFor(type), { type: 'json', consistency: 'strong' })
  if (!data) return json({ data: null })
  return json({ data })
}

export async function onRequestPut({ request, params, env }) {
  const type = String(params.type || '')
  if (!allowed.has(type)) return json({ error: 'Not found' }, 404)
  if (!env.PERSONAL_TOKEN_SECRET || !await verifyToken(request, env.PERSONAL_TOKEN_SECRET)) return json({ error: '编辑授权无效或已经过期。' }, 401)
  const length = Number(request.headers.get('content-length') || 0)
  if (length > 512 * 1024) return json({ error: '数据超过 512KB 限制。' }, 413)
  let incoming
  try { incoming = await request.json() } catch { return json({ error: 'JSON 格式错误。' }, 400) }
  if (!validPayload(type, incoming)) return json({ error: '数据结构不正确。' }, 422)

  const store = getStore({ name: 'personal-data', consistency: 'strong' })
  const current = await store.get(keyFor(type), { type: 'json', consistency: 'strong' })
  if (current && Number(current.revision) !== Number(incoming.revision)) {
    return json({ error: '云端数据已经更新，请先刷新或合并。', code: 'REVISION_CONFLICT', data: current }, 409)
  }
  if (current) {
    const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
    await store.setJSON(`backups/${type}/${stamp}.json`, current)
  }
  const next = { ...incoming, version: 2, revision: Number(incoming.revision) + 1, updatedAt: new Date().toISOString() }
  await store.setJSON(keyFor(type), next)
  return json({ data: next })
}
