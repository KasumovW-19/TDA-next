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