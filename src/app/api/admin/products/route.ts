import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '../_auth'

type ProductPayload = {
  name?: string
  slug?: string
  category?: string
  categoryId?: string
  description?: string
  size?: string
  productCode?: string
  imageUrl?: string
  price?: number
  oldPrice?: number
  inStock?: boolean
  isPopular?: boolean
  isNew?: boolean
}

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/gi, '')

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

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(
      'id, name, slug, category, category_id, description, size, product_code, price, old_price, in_stock, is_popular, is_new, image_url, is_active, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось получить товары' }, { status: 500 })
  }

  return NextResponse.json({ success: true, products: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const body = (await request.json()) as ProductPayload
  const name = body.name?.trim()
  const slugFromBody = body.slug?.trim().toLowerCase()
  const slug = slugFromBody || makeSlug(name ?? '')
  const categoryId = body.categoryId?.trim()

  if (!name || !slug || !categoryId) {
    return NextResponse.json(
      { message: 'Укажите название и выберите категорию товара' },
      { status: 400 },
    )
  }

  const { data: categoryRow, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .eq('id', categoryId)
    .single()

  if (categoryError || !categoryRow) {
    return NextResponse.json({ message: 'Выбранная категория не найдена' }, { status: 400 })
  }

  const price = Number(body.price ?? 0)
  const oldPrice = Number(body.oldPrice ?? 0)

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name,
      slug,
      category: categoryRow.name,
      category_id: categoryRow.id,
      description: body.description?.trim() || null,
      short_description: body.description?.trim() || null,
      size: body.size?.trim() || '',
      product_code: body.productCode?.trim() || '',
      image_url: body.imageUrl?.trim() || null,
      price,
      old_price: oldPrice > 0 ? oldPrice : price,
      in_stock: parseBoolean(body.inStock, true),
      is_popular: Boolean(body.isPopular ?? false),
      is_new: Boolean(body.isNew ?? false),
      is_active: true,
      rating: 5,
      reviews_count: 0,
    })
    .select(
      'id, name, slug, category, category_id, description, size, product_code, price, old_price, in_stock, is_popular, is_new, image_url, is_active, created_at',
    )
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось создать товар' }, { status: 500 })
  }

  return NextResponse.json({ success: true, product: data })
}
