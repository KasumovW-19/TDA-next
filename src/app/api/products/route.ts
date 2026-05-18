import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'
import type { ProductRow } from '@/entities/product/dbTypes'
import { mapProductRowToProduct } from '@/entities/product/mapProduct'
import type { Product } from '@/entities/product/types'

export const dynamic = 'force-dynamic'

let cachedProducts: Product[] | null = null
let cachedAt = 0

const cacheTtl = 60 * 1000
const requestTimeout = 7000

const withTimeout = async <T>(promise: PromiseLike<T>, timeoutMs: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Products request timeout'))
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

    if (cachedProducts && now - cachedAt < cacheTtl) {
      return NextResponse.json({
        products: cachedProducts,
        cached: true,
      })
    }

    const result = await withTimeout(
        Promise.resolve(
          supabaseAdmin
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
        ),
        requestTimeout,
      )

    const { data, error } = result

    if (error) {
      throw error
    }

    const products = ((data ?? []) as ProductRow[]).map(mapProductRowToProduct)

    cachedProducts = products
    cachedAt = now

    return NextResponse.json({
      products,
      cached: false,
    })
  } catch (error) {
    console.error(error)

    if (cachedProducts) {
      return NextResponse.json({
        products: cachedProducts,
        cached: true,
        stale: true,
      })
    }

    return NextResponse.json(
      { message: 'Не удалось загрузить товары' },
      { status: 500 },
    )
  }
}