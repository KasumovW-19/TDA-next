import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { adminSessionCookie, verifyAdminSessionToken } from '@/shared/lib/adminAuth'

export const getAdminSession = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get(adminSessionCookie.name)?.value
  return verifyAdminSessionToken(token)
}

export const requireAdmin = async () => {
  const session = await getAdminSession()
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true as const, session }
}
