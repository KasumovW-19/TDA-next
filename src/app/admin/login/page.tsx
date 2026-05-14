import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminLoginPage } from '@/screens/AdminLoginPage/AdminLoginPage'
import { adminSessionCookie, verifyAdminSessionToken } from '@/shared/lib/adminAuth'

export default async function AdminLoginRoutePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(adminSessionCookie.name)?.value
  const session = verifyAdminSessionToken(token)

  if (session) {
    redirect('/admin')
  }

  return <AdminLoginPage />
}
