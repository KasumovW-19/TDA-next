import { config } from 'dotenv'

config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { mockProducts } from '../src/data/mockProducts'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const categoryDescriptions: Record<string, string> = {
  Ворота: 'Распашные и откатные ворота для частных домов, участков и коммерческих объектов.',
  Калитки: 'Металлические и кованые калитки для входных групп, заборов и частных участков.',
  Заборы: 'Секции металлических заборов и ограждений для надежного периметра.',
  'Кованые изделия': 'Готовые кованые конструкции для фасадов, входных групп и декоративной отделки.',
  'Элементы ковки': 'Пики, розетки, завитки, вставки и другие детали для сборки металлических изделий.',
  'Краски по металлу': 'Защитные и декоративные покрытия для ворот, заборов, решеток и металлоконструкций.',
  Грунтовки: 'Антикоррозийные грунтовки для подготовки металлических поверхностей перед окраской.',
  Фурнитура: 'Петли, замки, ручки и комплекты для монтажа ворот, калиток и ограждений.',
  'Перила и ограждения': 'Лестничные, балконные и фасадные ограждения из металла.',
  'Декор для участка': 'Металлический декор для сада, входной зоны, террас и участка.',
}

const customOrderCategories = new Set([
  'Ворота',
  'Калитки',
  'Заборы',
  'Кованые изделия',
  'Перила и ограждения',
  'Декор для участка',
])

const translitMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const run = async () => {
  const uniqueCategories = Array.from(new Set(mockProducts.map((product) => product.category)))

  const categoriesPayload = uniqueCategories.map((category, index) => ({
    name: category,
    slug: createSlug(category),
    description: categoryDescriptions[category] ?? null,
    image_url: null,
    sort_order: index + 1,
    is_active: true,
  }))

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .upsert(categoriesPayload, { onConflict: 'slug' })
    .select('id, slug, name')

  if (categoriesError) {
    throw categoriesError
  }

  const categoryIdByName = new Map(categories?.map((category) => [category.name, category.id]))

  const productsPayload = mockProducts.map((product, index) => ({
    category_id: categoryIdByName.get(product.category) ?? null,
    name: product.name,
    slug: createSlug(product.name),
    category: product.category,
    short_description: product.description,
    description: product.description,
    price: product.price,
    old_price: product.oldPrice,
    unit: 'шт',
    image_url: product.image,
    gallery: [product.image],
    in_stock: product.inStock,
    is_active: true,
    is_popular: product.isPopular,
    is_new: product.isNew,
    is_custom_order: customOrderCategories.has(product.category),
    rating: product.rating,
    reviews_count: product.reviewsCount,
    sort_order: index + 1,
  }))

  const { error: productsError } = await supabase
    .from('products')
    .upsert(productsPayload, { onConflict: 'slug' })

  if (productsError) {
    throw productsError
  }

  console.log(`Seed completed: ${categoriesPayload.length} categories, ${productsPayload.length} products`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})