import { NextResponse } from 'next/server'
import {
  adminSessionCookie,
  createAdminSessionToken,
  verifyAdminCredentials,
} from '@/shared/lib/adminAuth'

type LoginPayload = {
  login?: string
  password?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload
  const login = body.login?.trim() || ''
  const password = body.password || ''

  if (!verifyAdminCredentials(login, password)) {
    return NextResponse.json({ message: 'Неверный логин или пароль' }, { status: 401 })
  }

  const token = createAdminSessionToken(login)
  const response = NextResponse.json({ success: true })
  response.cookies.set(adminSessionCookie.name, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: adminSessionCookie.maxAge,
  })
  return response
}
