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

export type ProductCategory = (typeof productCategories)[number]

export interface Product {
  id: number
  name: string
  category: ProductCategory
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
