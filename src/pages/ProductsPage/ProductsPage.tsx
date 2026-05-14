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
import { mockProducts } from '../../data/mockProducts'
import { useCart } from '../../entities/cart/useCart'
import type { Product, ProductCategory } from '../../entities/product/types'
import { productCategories } from '../../entities/product/types'
import styles from './ProductsPage.module.scss'

const maxAvailablePrice = Math.max(...mockProducts.map((item) => item.price))

const baseFilters: ProductFiltersState = {
  query: '',
  categories: [],
  maxPrice: maxAvailablePrice,
  inStockOnly: false,
  sort: 'popular',
}

export const ProductsPage = () => {
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const preselectedCategories = useMemo(() => {
    const directCategory = searchParams.get('category')
    const legacyCategories = searchParams.get('categories')
    const values = [
      ...(directCategory ? [directCategory] : []),
      ...(legacyCategories ? legacyCategories.split(',') : []),
      ...searchParams.getAll('categories'),
    ]
    return [...new Set(values)].filter((value): value is ProductCategory =>
      productCategories.includes(value as ProductCategory),
    )
  }, [searchParams])

  const [filters, setFilters] = useState<ProductFiltersState>(() => ({
    ...baseFilters,
    categories: preselectedCategories,
  }))
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 750)
    return () => window.clearTimeout(timer)
  }, [])

  const filteredProducts = useMemo(() => {
    const search = filters.query.trim().toLowerCase()

    const prepared = mockProducts.filter((product) => {
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
        case 'rating':
          return b.rating - a.rating
        case 'new':
          return Number(b.isNew) - Number(a.isNew)
        default:
          return Number(b.isPopular) - Number(a.isPopular)
      }
    })
  }, [filters])

  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог товаров' }]} />
      <SectionTitle
        title="Каталог товаров"
        subtitle="Кованые изделия, материалы и комплектующие для дома и участка."
      />

      <div className={styles.layout}>
        <ProductFilters
          categories={[...productCategories]}
          maxAvailablePrice={maxAvailablePrice}
          value={filters}
          onChange={setFilters}
        />

        <section>
          {!loading && filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить фильтры, диапазон цены или текст поиска.</p>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onAddToCart={addItem}
              onQuickView={setQuickView}
              loading={loading}
            />
          )}
        </section>
      </div>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} onAddToCart={addItem} />
    </div>
  )
}
