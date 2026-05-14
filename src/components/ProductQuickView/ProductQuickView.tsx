import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../Button/Button'
import type { Product } from '../../entities/product/types'
import { formatPrice } from '../../shared/lib/formatPrice'
import styles from './ProductQuickView.module.scss'

interface ProductQuickViewProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product) => void
}

export const ProductQuickView = ({ product, onClose, onAddToCart }: ProductQuickViewProps) => (
  <AnimatePresence>
    {product && (
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          onClick={(event) => event.stopPropagation()}
        >
          <button className={styles.close} type="button" onClick={onClose}>
            <X size={18} />
          </button>
          <div className={styles.content}>
            <img className={styles.image} src={product.image} alt={product.name} />
            <div>
              <p className={styles.category}>{product.category}</p>
              <h3 className={styles.name}>{product.name}</h3>
              <p className={styles.description}>{product.description}</p>
              <p className={styles.availability}>
                {product.inStock ? 'В наличии' : 'Временно отсутствует'}
              </p>
              <p className={styles.rating}>
                Рейтинг: {product.rating} ({product.reviewsCount} отзывов)
              </p>
              <div className={styles.prices}>
                <strong className={styles.currentPrice}>{formatPrice(product.price)}</strong>
                <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
              </div>
              <Button disabled={!product.inStock} onClick={() => onAddToCart(product)}>
                Добавить в корзину
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
