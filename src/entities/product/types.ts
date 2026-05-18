export const productCategories = [
  'Ворота',
  'Калитки',
  'Заборы',
  'Кованые изделия',
  'Элементы ковки',
  'Краски по металлу',
  'Грунтовки',
  'Фурнитура',
  'Перила и ограждения',
  'Декор для участка',
] as const

export type ProductCategory = string

export interface Product {
  id: string
  name: string
  category: ProductCategory
  size: string
  productCode: string
  createdAt?: string
  price: number
  oldPrice: number
  rating: number
  reviewsCount: number
  image: string
  description: string
  isNew: boolean
  isPopular: boolean
  inStock: boolean
}
