import { createHmac, timingSafeEqual } from 'crypto'

const ADMIN_SESSION_COOKIE = 'tda_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 12

type SessionPayload = {
  sub: string
  exp: number
}

const toBase64Url = (value: string) => Buffer.from(value, 'utf8').toString('base64url')
const fromBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

const getAuthSecret = () => process.env.ADMIN_AUTH_SECRET || 'tda-admin-secret'
const getAdminLogin = () => process.env.ADMIN_LOGIN || 'admin'
const getAdminPassword = () => process.env.ADMIN_PASSWORD || 'admin123'

const sign = (payload: string) =>
  createHmac('sha256', getAuthSecret()).update(payload).digest('base64url')

export const verifyAdminCredentials = (login: string, password: string) =>
  login === getAdminLogin() && password === getAdminPassword()

export const createAdminSessionToken = (login: string) => {
  const payload: SessionPayload = {
    sub: login,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export const verifyAdminSessionToken = (token: string | undefined | null): SessionPayload | null => {
  if (!token) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = sign(encodedPayload)
  const provided = Buffer.from(signature, 'utf8')
  const expected = Buffer.from(expectedSignature, 'utf8')

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export const adminSessionCookie = {
  name: ADMIN_SESSION_COOKIE,
  maxAge: SESSION_TTL_SECONDS,
}
