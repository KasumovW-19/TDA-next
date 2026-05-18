import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '../../_auth'

type ProductPatchPayload = {
  price?: number
  description?: string
  inStock?: boolean
  size?: string
  productCode?: string
}

const parseBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return fallback
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await params

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось удалить товар' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await params
  const body = (await request.json()) as ProductPatchPayload

  const updates: {
    price?: number
    old_price?: number
    description?: string | null
    short_description?: string | null
    in_stock?: boolean
    size?: string
    product_code?: string
  } = {}

  if (body.price !== undefined) {
    const parsedPrice = Number(body.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ message: 'Цена должна быть неотрицательным числом' }, { status: 400 })
    }
    updates.price = parsedPrice
  }

  if (body.description !== undefined) {
    const normalizedDescription = body.description.trim()
    updates.description = normalizedDescription.length > 0 ? normalizedDescription : null
    updates.short_description = normalizedDescription.length > 0 ? normalizedDescription : null
  }

  if (body.inStock !== undefined) {
    updates.in_stock = parseBoolean(body.inStock, true)
  }

  if (body.size !== undefined) {
    updates.size = body.size.trim()
  }

  if (body.productCode !== undefined) {
    updates.product_code = body.productCode.trim()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: 'Нет данных для обновления' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select(
      'id, name, slug, category, category_id, description, size, product_code, price, old_price, in_stock, is_popular, is_new, image_url, is_active, created_at',
    )
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось обновить товар' }, { status: 500 })
  }

  return NextResponse.json({ success: true, product: data })
}
