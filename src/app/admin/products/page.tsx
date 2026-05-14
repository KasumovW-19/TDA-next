import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminProductsPage } from '@/screens/AdminProductsPage/AdminProductsPage'
import { adminSessionCookie, verifyAdminSessionToken } from '@/shared/lib/adminAuth'

export default async function AdminProductsRoutePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(adminSessionCookie.name)?.value
  const session = verifyAdminSessionToken(token)

  if (!session) {
    redirect('/admin/login')
  }

  return <AdminProductsPage />
}
