import { issueToken, json, verifyEditSecret } from '../../lib/personal-auth.js'

export async function onRequestPost({ request, env }) {
  if (!env.PERSONAL_EDIT_SECRET || !env.PERSONAL_TOKEN_SECRET) return json({ error: '云端编辑功能尚未配置。' }, 503)
  let body
  try { body = await request.json() } catch { return json({ error: '请求格式错误。' }, 400) }
  if (!await verifyEditSecret(body.secret, env.PERSONAL_EDIT_SECRET)) return json({ error: '编辑密钥不正确。' }, 401)
  return json({ token: await issueToken(env.PERSONAL_TOKEN_SECRET, Boolean(body.remember)), remember: Boolean(body.remember) })
}
