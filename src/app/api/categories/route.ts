import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

let cachedCategories: CategoryRow[] | null = null
let cachedAt = 0

const cacheTtl = 60 * 1000
const requestTimeout = 7000

const withTimeout = async <T>(promise: PromiseLike<T>, timeoutMs: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Categories request timeout'))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

export async function GET() {
  try {
    const now = Date.now()

    if (cachedCategories && now - cachedAt < cacheTtl) {
      return NextResponse.json({
        categories: cachedCategories,
        cached: true,
      })
    }

    const result = await withTimeout(
        Promise.resolve(
          supabaseAdmin
            .from('categories')
            .select('id, name, slug, description, image_url, sort_order, is_active, created_at')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
        ),
        requestTimeout,
      )

    const { data, error } = result

    if (error) {
      throw error
    }

    const categories = (data ?? []) as CategoryRow[]

    cachedCategories = categories
    cachedAt = now

    return NextResponse.json({
      categories,
      cached: false,
    })
  } catch (error) {
    console.error(error)

    if (cachedCategories) {
      return NextResponse.json({
        categories: cachedCategories,
        cached: true,
        stale: true,
      })
    }

    return NextResponse.json(
      { message: 'Не удалось загрузить категории' },
      { status: 500 },
    )
  }
}