import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '../_auth'

type CategoryPayload = {
  name?: string
  slug?: string
  description?: string
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug, description, is_active, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось получить категории' }, { status: 500 })
  }

  return NextResponse.json({ success: true, categories: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const body = (await request.json()) as CategoryPayload
  const name = body.name?.trim()
  const slug = body.slug?.trim().toLowerCase()

  if (!name || !slug) {
    return NextResponse.json({ message: 'Укажите название и slug категории' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name,
      slug,
      description: body.description?.trim() || null,
      is_active: true,
    })
    .select('id, name, slug, description, is_active, sort_order, created_at')
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось создать категорию' }, { status: 500 })
  }

  return NextResponse.json({ success: true, category: data })
}
