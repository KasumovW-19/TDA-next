import { AnimatePresence } from 'framer-motion'
import type { Product } from '../../entities/product/types'
import { ProductCard } from '../ProductCard/ProductCard'
import styles from './ProductGrid.module.scss'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onQuickView: (product: Product) => void
  loading?: boolean
}

export const ProductGrid = ({
  products,
  onAddToCart,
  onQuickView,
  loading = false,
}: ProductGridProps) => {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles.skeleton} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      <AnimatePresence>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
