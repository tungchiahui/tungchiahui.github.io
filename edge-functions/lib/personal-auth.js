const encoder = new TextEncoder()

const toBase64Url = bytes => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

const fromBase64Url = value => {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)
  const binary = atob(base64)
  return Uint8Array.from(binary, character => character.charCodeAt(0))
}

const sign = async (value, secret) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
}

const safeEqual = async (left, right) => {
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right))
  ])
  const aa = new Uint8Array(a)
  const bb = new Uint8Array(b)
  let difference = 0
  for (let index = 0; index < aa.length; index += 1) difference |= aa[index] ^ bb[index]
  return difference === 0
}

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
})

export const issueToken = async (secret, remember) => {
  const payload = {
    scope: 'personal-data:write',
    exp: Date.now() + (remember ? 30 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000),
    nonce: crypto.randomUUID()
  }
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)))
  return `${encoded}.${await sign(encoded, secret)}`
}

export const verifyToken = async (request, secret) => {
  const value = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
  const [encoded, signature] = value.split('.')
  if (!encoded || !signature) return false
  try {
    if (!await safeEqual(signature, await sign(encoded, secret))) return false
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded)))
    return payload.scope === 'personal-data:write' && Number(payload.exp) > Date.now()
  } catch { return false }
}

export const verifyEditSecret = (provided, expected) => safeEqual(String(provided || ''), String(expected || ''))
