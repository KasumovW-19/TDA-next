import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '../../_auth'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await params

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось удалить категорию' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
