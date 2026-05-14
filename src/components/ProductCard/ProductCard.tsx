import { AnimatePresence, motion } from 'framer-motion'
import { Eye, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../Button/Button'
import type { Product } from '../../entities/product/types'
import { formatPrice } from '../../shared/lib/formatPrice'
import styles from './ProductCard.module.scss'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onQuickView: (product: Product) => void
}

const truncateText = (value: string, limit: number) =>
  value.length > limit ? `${value.slice(0, limit).trimEnd()}...` : value

export const ProductCard = ({ product, onAddToCart, onQuickView }: ProductCardProps) => {
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) {
      return
    }
    const timer = window.setTimeout(() => setJustAdded(false), 700)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  const discount = product.oldPrice > product.price ? product.oldPrice - product.price : 0

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.card}
    >
      <div className={styles.imageWrap}>
        <img className={styles.image} src={product.image} alt={product.name} loading="lazy" />
        <div className={styles.badges}>
          {product.isNew && <span className={`${styles.badge} ${styles.new}`}>Новинка</span>}
          {product.isPopular && <span className={`${styles.badge} ${styles.popular}`}>Популярное</span>}
          {discount > 0 && <span className={`${styles.badge} ${styles.discount}`}>Скидка</span>}
          {!product.inStock && <span className={`${styles.badge} ${styles.out}`}>Нет в наличии</span>}
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.category}>{product.category}</p>
        <h3 className={styles.name} title={product.name}>
          {truncateText(product.name, 48)}
        </h3>
        <p className={styles.desc} title={product.description}>
          {truncateText(product.description, 110)}
        </p>
        <div className={styles.rating}>
          <Star size={14} fill="currentColor" />
          <span>{product.rating}</span>
          <small className={styles.reviews}>({product.reviewsCount})</small>
        </div>
        <div className={styles.prices}>
          <strong className={styles.currentPrice}>{formatPrice(product.price)}</strong>
          <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
        </div>

        <div className={styles.actions}>
          <Button
            disabled={!product.inStock}
            onClick={() => {
              onAddToCart(product)
              setJustAdded(true)
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={justAdded ? 'added' : 'default'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {justAdded ? 'Добавлено' : 'В корзину'}
              </motion.span>
            </AnimatePresence>
          </Button>
          <Button variant="secondary" onClick={() => onQuickView(product)} icon={<Eye size={15} />}>
            Быстрый просмотр
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
