import { motion } from 'framer-motion'
import { Eye, Minus, Plus } from 'lucide-react'
import { Button } from '../Button/Button'
import type { Product } from '../../entities/product/types'
import { formatPrice } from '../../shared/lib/formatPrice'
import { useCart } from '../../entities/cart/useCart'
import styles from './ProductCard.module.scss'

interface ProductCardProps {
  product: Product
  onQuickView: (product: Product) => void
}

const truncateText = (value: string, limit: number) =>
  value.length > limit ? `${value.slice(0, limit).trimEnd()}...` : value

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { items, addItem, updateQuantity } = useCart()
  const currentQuantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.card}
    >
      <div className={styles.imageWrap}>
        <img className={styles.image} src={product.image} alt={product.name} loading="lazy" />
      </div>

      <div className={styles.content}>
        <p className={styles.category}>{product.category}</p>
        <h3 className={styles.name} title={product.name}>
          {truncateText(product.name, 48)}
        </h3>
        <p className={styles.desc} title={product.description}>
          {truncateText(product.description, 110)}
        </p>
        <div className={styles.prices}>
          <strong className={styles.currentPrice}>{formatPrice(product.price)}</strong>
          <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
        </div>

        <div className={styles.actions}>
          {product.inStock ? (
            currentQuantity > 0 ? (
              <div className={styles.quantityControls}>
                <button
                  type="button"
                  className={styles.qtyButton}
                  onClick={() => updateQuantity(product.id, currentQuantity - 1)}
                  aria-label="Уменьшить количество"
                >
                  <Minus size={16} />
                </button>
                <span className={styles.qtyValue}>{currentQuantity} в корзине</span>
                <button
                  type="button"
                  className={styles.qtyButton}
                  onClick={() => addItem(product)}
                  aria-label="Увеличить количество"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <Button onClick={() => addItem(product)}>В корзину</Button>
            )
          ) : (
            <Button disabled>Нет в наличии</Button>
          )}
          <Button variant="secondary" onClick={() => onQuickView(product)} icon={<Eye size={15} />}>
            Быстрый просмотр
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
