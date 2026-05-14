import { supabaseClient } from '@/shared/lib/supabase/client'
import type { Product } from './types'
import type { ProductRow } from './dbTypes'
import { mapProductRowToProduct } from './mapProduct'

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return (data as ProductRow[]).map(mapProductRowToProduct)
}

export const getProductCategories = async (): Promise<string[]> => {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => row.name).filter(Boolean)
}