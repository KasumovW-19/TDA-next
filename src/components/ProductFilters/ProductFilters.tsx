import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ProductCategory } from '../../entities/product/types'
import styles from './ProductFilters.module.scss'

export type ProductSort = 'price-asc' | 'price-desc' | 'date-desc'

export interface ProductFiltersState {
  query: string
  categories: ProductCategory[]
  maxPrice: number
  inStockOnly: boolean
  sort: ProductSort
}

interface ProductFiltersProps {
  categories: ProductCategory[]
  maxAvailablePrice: number
  value: ProductFiltersState
  onChange: (next: ProductFiltersState) => void
}

export const ProductFilters = ({
  categories,
  maxAvailablePrice,
  value,
  onChange,
}: ProductFiltersProps) => {
  const minPrice = 500
  const activeFiltersCount =
    (value.query.trim() ? 1 : 0) +
    value.categories.length +
    (value.maxPrice < maxAvailablePrice ? 1 : 0) +
    (value.inStockOnly ? 1 : 0)

  const resetFilters = () =>
    onChange({
      query: '',
      categories: [],
      maxPrice: maxAvailablePrice,
      inStockOnly: false,
      sort: value.sort,
    })

  const progress = ((value.maxPrice - minPrice) / (maxAvailablePrice - minPrice)) * 100
  const quickPriceValues = [10000, 30000, 70000, maxAvailablePrice]

  return (
    <aside className={styles.filters}>
      <div className={styles.top}>
        <div className={styles.titleWrap}>
          <SlidersHorizontal size={16} />
          <p className={styles.title}>Фильтры</p>
          {activeFiltersCount > 0 && <span className={styles.activeBadge}>{activeFiltersCount}</span>}
        </div>
        <button
          type="button"
          className={styles.reset}
          onClick={resetFilters}
          disabled={activeFiltersCount === 0}
        >
          <RotateCcw size={14} />
          Сбросить
        </button>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="search">
          Поиск
        </label>
        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} size={16} />
          <input
            className={styles.searchInput}
            id="search"
            value={value.query}
            onChange={(event) => onChange({ ...value, query: event.target.value })}
            placeholder="Название или описание"
          />
        </div>
      </div>

      <div className={styles.group}>
        <p className={styles.label}>Категории</p>
        <div className={styles.categoryChips}>
          {categories.map((category) => {
            const checked = value.categories.includes(category)
            return (
              <button
                key={category}
                type="button"
                className={`${styles.categoryChip} ${checked ? styles.categoryChipActive : ''}`}
                onClick={() => {
                  const next = checked
                    ? value.categories.filter((item) => item !== category)
                    : [...value.categories, category]
                  onChange({ ...value, categories: next })
                }}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="price">
          Цена до {Math.round(value.maxPrice).toLocaleString('ru-RU')} ₽
        </label>
        <input
          id="price"
          className={styles.range}
          style={{ '--range-progress': `${progress}%` } as CSSProperties}
          type="range"
          min={minPrice}
          max={maxAvailablePrice}
          step={100}
          value={value.maxPrice}
          onChange={(event) => onChange({ ...value, maxPrice: Number(event.target.value) })}
        />
        <div className={styles.priceHints}>
          {quickPriceValues.map((price) => (
            <button
              key={price}
              type="button"
              className={styles.pricePreset}
              onClick={() => onChange({ ...value, maxPrice: price })}
            >
              до {Math.round(price).toLocaleString('ru-RU')}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.stockToggle}>
        <input
          className={styles.stockInput}
          type="checkbox"
          checked={value.inStockOnly}
          onChange={(event) => onChange({ ...value, inStockOnly: event.target.checked })}
        />
        <span className={styles.switch} />
        <span>Только в наличии</span>
      </label>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="sort">
          Сортировка
        </label>
        <select
          className={styles.select}
          id="sort"
          value={value.sort}
          onChange={(event) =>
            onChange({ ...value, sort: event.target.value as ProductFiltersState['sort'] })
          }
        >
          <option value="price-asc">Цена по возрастанию</option>
          <option value="price-desc">Цена по убыванию</option>
          <option value="date-desc">Сначала новые</option>
        </select>
      </div>
    </aside>
  )
}
