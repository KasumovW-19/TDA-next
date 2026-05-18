"use client";

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import {
  ProductFilters,
  type ProductFiltersState,
} from '../../components/ProductFilters/ProductFilters'
import { ProductGrid } from '../../components/ProductGrid/ProductGrid'
import { ProductQuickView } from '../../components/ProductQuickView/ProductQuickView'
import { SectionTitle } from '../../components/SectionTitle/SectionTitle'
import { useCart } from '../../entities/cart/useCart'
import { getCategories } from '../../entities/category/api'
import { getProducts } from '../../entities/product/api'
import type { Product, ProductCategory } from '../../entities/product/types'
import styles from './ProductsPage.module.scss'

const initialFilters: ProductFiltersState = {
  query: '',
  categories: [],
  maxPrice: 500,
  inStockOnly: false,
  sort: 'price-asc',
}

export const ProductsPage = () => {
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableCategories, setAvailableCategories] = useState<ProductCategory[]>([])
  const preselectedCategories = useMemo(() => {
    const params = searchParams ?? new URLSearchParams()
    const directCategory = params.get('category')
    const legacyCategories = params.get('categories')
    const values = [
      ...(directCategory ? [directCategory] : []),
      ...(legacyCategories ? legacyCategories.split(',') : []),
      ...params.getAll('categories'),
    ]
    return [...new Set(values)].filter(Boolean) as ProductCategory[]
  }, [searchParams])
  const maxAvailablePrice = useMemo(() => {
    if (products.length === 0) {
      return 500
    }
    return Math.max(500, ...products.map((item) => item.price))
  }, [products])

  const [filters, setFilters] = useState<ProductFiltersState>(() => ({
    ...initialFilters,
    categories: preselectedCategories,
  }))
  const [quickView, setQuickView] = useState<Product | null>(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([getProducts(), getCategories()])
      .then(([items, categories]) => {
        if (!isMounted) return
        setProducts(items)
        setAvailableCategories(
          categories.length > 0
            ? categories.map((category) => category.name as ProductCategory)
            : Array.from(new Set(items.map((item) => item.category))).sort((a, b) =>
                a.localeCompare(b),
              ),
        )
        const loadedMaxPrice = Math.max(500, ...items.map((item) => item.price))
        setFilters((prev) => ({ ...prev, maxPrice: loadedMaxPrice }))
      })
      .catch(() => {
        if (!isMounted) return
        setError('Не удалось загрузить товары')
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const search = filters.query.trim().toLowerCase()

    const prepared = products.filter((product) => {
      const matchesSearch =
        search.length === 0 ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      const matchesCategories =
        filters.categories.length === 0 || filters.categories.includes(product.category)
      const matchesPrice = product.price <= filters.maxPrice
      const matchesStock = !filters.inStockOnly || product.inStock

      return matchesSearch && matchesCategories && matchesPrice && matchesStock
    })

    return [...prepared].sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        default:
          return a.price - b.price
      }
    })
  }, [filters, products])

  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог товаров' }]} />
      <SectionTitle
        title="Каталог товаров"
        subtitle="Кованые изделия, материалы и комплектующие для дома и участка."
      />

      <div className={styles.layout}>
        <ProductFilters
          categories={availableCategories}
          maxAvailablePrice={maxAvailablePrice}
          value={filters}
          onChange={setFilters}
        />

        <section>
          {error ? (
            <div className={styles.empty}>
              <h3>Ошибка загрузки</h3>
              <p>{error}</p>
            </div>
          ) : !isLoading && filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить фильтры, диапазон цены или текст поиска.</p>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onQuickView={setQuickView}
              loading={isLoading}
            />
          )}
        </section>
      </div>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} onAddToCart={addItem} />
    </div>
  )
}

export default ProductsPage
