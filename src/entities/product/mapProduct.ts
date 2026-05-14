import type { Product } from './types'
import type { ProductRow } from './dbTypes'

export const mapProductRowToProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  category: row.category as Product['category'],
  price: Number(row.price ?? 0),
  oldPrice: Number(row.old_price ?? 0),
  rating: Number(row.rating ?? 5),
  reviewsCount: row.reviews_count ?? 0,
  image: row.image_url ?? '',
  description: row.description ?? row.short_description ?? '',
  isNew: row.is_new,
  isPopular: row.is_popular,
  inStock: row.in_stock,
})