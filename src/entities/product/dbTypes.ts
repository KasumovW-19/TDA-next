export type ProductRow = {
    id: string
    category_id: string | null
    name: string
    slug: string
    category: string
    size: string | null
    product_code: string | null
    short_description: string | null
    description: string | null
    price: number | null
    old_price: number | null
    unit: string
    image_url: string | null
    gallery: string[]
    in_stock: boolean
    is_active: boolean
    is_popular: boolean
    is_new: boolean
    is_custom_order: boolean
    rating: number
    reviews_count: number
    sort_order: number
    created_at: string
    updated_at: string
  }