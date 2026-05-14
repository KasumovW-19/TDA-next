"use client";

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, ShoppingCart, Trash2, Truck, X } from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { Button } from '../../components/Button/Button'
import { SectionTitle } from '../../components/SectionTitle/SectionTitle'
import { useCart } from '../../entities/cart/useCart'
import { formatPrice } from '../../shared/lib/formatPrice'
import styles from './CartPage.module.scss'

export const CartPage = () => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart()

  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    comment: '',
  })

  const oldTotalPrice = items.reduce((sum, item) => sum + item.product.oldPrice * item.quantity, 0)
  const discount = Math.max(0, oldTotalPrice - totalPrice)
  const deliveryPrice = totalPrice >= 15000 ? 0 : 1200
  const finalPrice = totalPrice + deliveryPrice

  const handleOpenCheckout = () => {
    setIsSubmitted(false)
    setSubmitSuccessMessage(null)
    setSubmitError(null)
    setCheckoutOpen(true)
  }

  const handleCloseCheckout = () => {
    if (isSubmitting) {
      return
    }
    setCheckoutOpen(false)
  }

  const handleSubmitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (items.length === 0) return

    setSubmitting(true)
    setSubmitSuccessMessage(null)
    setSubmitError(null)

    try {
      const message = [
        orderForm.address.trim() ? `Адрес: ${orderForm.address.trim()}` : '',
        orderForm.comment.trim() ? `Комментарий: ${orderForm.comment.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: orderForm.fullName,
          phone: orderForm.phone,
          contactPreference: 'whatsapp',
          message,
          source: 'cart',
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      })

      const result = (await response.json()) as {
        success?: boolean
        message?: string
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Не удалось отправить заявку')
      }

      setSubmitSuccessMessage(result.message || 'Заказ успешно сформирован, менеджер скоро свяжется с вами')
      setIsSubmitted(true)
      clearCart()
      setOrderForm({
        fullName: '',
        phone: '',
        address: '',
        comment: '',
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить заявку')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !isCheckoutOpen) {
    return (
      <div className={`container ${styles.emptyPage}`}>
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]} />
        <SectionTitle title="Корзина" />
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <ShoppingCart size={24} />
          </span>
          <h3 className={styles.emptyTitle}>Корзина пока пустая</h3>
          <p className={styles.emptyText}>Добавьте товары из каталога, чтобы перейти к оформлению заказа.</p>
          <Link className={styles.emptyLink} href="/products">
            Перейти в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`container ${styles.page}`}>
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]} />
        <SectionTitle title="Корзина" subtitle={`Товаров: ${totalItems}`} />
        <div className={styles.toolbar}>
          <p className={styles.toolbarText}>Проверьте позиции и подготовьте заказ к оформлению.</p>
          <button className={styles.toolbarButton} type="button" onClick={clearCart}>
            Очистить корзину
          </button>
        </div>

        <div className={styles.layout}>
          <div className={styles.items}>
            <AnimatePresence>
              {items.map(({ product, quantity }) => (
                <motion.article
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={styles.item}
                >
                  <img className={styles.itemImage} src={product.image} alt={product.name} />

                  <div>
                    <h3 className={styles.itemTitle}>{product.name}</h3>
                    <p className={styles.itemCategory}>{product.category}</p>
                    <div className={styles.itemPrices}>
                      <strong>{formatPrice(product.price)}</strong>
                      <span className={styles.itemOldPrice}>{formatPrice(product.oldPrice)}</span>
                    </div>
                    <small className={styles.itemSubtotal}>
                      Сумма: {formatPrice(product.price * quantity)}
                    </small>
                  </div>

                  <div className={styles.controls}>
                    <p className={styles.controlsLabel}>Количество</p>
                    <div className={styles.counter}>
                      <button
                        className={styles.counterButton}
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                        aria-label="Уменьшить количество"
                      >
                        -
                      </button>
                      <span className={styles.counterValue}>{quantity}</span>
                      <button
                        className={styles.counterButton}
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeItem(product.id)}
                      aria-label="Удалить товар из корзины"
                    >
                      <Trash2 size={16} />
                      <span className={styles.removeText}>Удалить</span>
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <aside className={styles.summary}>
            <h3 className={styles.summaryTitle}>Ваш заказ</h3>
            <p className={styles.summaryRow}>
              <span className={styles.summaryRowText}>Количество товаров</span>
              <strong className={styles.summaryValue}>{totalItems}</strong>
            </p>
            <p className={styles.summaryRow}>
              <span className={styles.summaryRowText}>Сумма товаров</span>
              <strong className={styles.summaryValue}>{formatPrice(totalPrice)}</strong>
            </p>
            <p className={styles.summaryRow}>
              <span className={styles.summaryRowText}>Скидка</span>
              <strong className={`${styles.summaryValue} ${styles.discount}`}>
                - {formatPrice(discount)}
              </strong>
            </p>
            <p className={styles.summaryRow}>
              <span className={styles.summaryRowText}>Доставка</span>
              <strong className={styles.summaryValue}>
                {deliveryPrice === 0 ? 'Бесплатно' : formatPrice(deliveryPrice)}
              </strong>
            </p>
            <p className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.summaryRowText}>К оплате</span>
              <strong className={styles.summaryValue}>{formatPrice(finalPrice)}</strong>
            </p>
            <Button size="l" onClick={handleOpenCheckout}>
              Оформить заказ
            </Button>
            <Link href="/products" className={styles.continueShopping}>
              Продолжить покупки
            </Link>
            <ul className={styles.summaryMeta}>
              <li className={styles.summaryMetaItem}>
                <Truck size={14} /> Доставка 1-3 дня
              </li>
              <li className={styles.summaryMetaItem}>
                <ShieldCheck size={14} /> Гарантия качества материалов
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (isSubmitting) {
                return
              }
              handleCloseCheckout()
            }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleCloseCheckout}
                disabled={isSubmitting}
                aria-label="Закрыть модальное окно"
              >
                <X size={18} />
              </button>
              {!isSubmitted ? (
                <>
                  <h3 className={styles.modalTitle}>Оформление заказа</h3>
                  <p className={styles.modalText}>
                    Заполните контактные данные, и мы свяжемся с вами для подтверждения.
                  </p>
                  {isSubmitting && (
                    <p className={styles.modalNotice}>
                      <Loader2 size={16} className={styles.spin} />
                      Отправляем заявку, пожалуйста подождите...
                    </p>
                  )}
                  <form className={styles.orderForm} onSubmit={handleSubmitOrder}>
                    <label className={styles.orderLabel}>
                      ФИО
                      <input
                        className={styles.orderInput}
                        required
                        value={orderForm.fullName}
                        onChange={(event) =>
                          setOrderForm((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                        placeholder="Иванов Иван Иванович"
                      />
                    </label>
                    <label className={styles.orderLabel}>
                      Номер телефона
                      <input
                        className={styles.orderInput}
                        required
                        type="tel"
                        value={orderForm.phone}
                        onChange={(event) =>
                          setOrderForm((prev) => ({ ...prev, phone: event.target.value }))
                        }
                        placeholder="+7 (900) 123-45-67"
                      />
                    </label>
                    <label className={styles.orderLabel}>
                      Адрес доставки
                      <input
                        className={styles.orderInput}
                        required
                        value={orderForm.address}
                        onChange={(event) =>
                          setOrderForm((prev) => ({ ...prev, address: event.target.value }))
                        }
                        placeholder="Город, улица, дом, квартира"
                      />
                    </label>
                    <label className={styles.orderLabel}>
                      Комментарий (если есть)
                      <textarea
                        className={styles.orderTextarea}
                        rows={3}
                        value={orderForm.comment}
                        onChange={(event) =>
                          setOrderForm((prev) => ({ ...prev, comment: event.target.value }))
                        }
                        placeholder="Удобное время звонка, детали доставки"
                      />
                    </label>
                    {submitError && (
                      <p className={`${styles.modalNotice} ${styles.modalNoticeError}`}>
                        <AlertCircle size={16} />
                        {submitError}
                      </p>
                    )}
                    <Button size="l" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Отправка...' : 'Подтвердить заказ'}
                    </Button>
                  </form>
                </>
              ) : (
                <div className={styles.successState}>
                  <span className={styles.successIcon} aria-hidden>
                    <CheckCircle2 size={26} />
                  </span>
                  <h3 className={styles.modalTitle}>Заявка отправлена</h3>
                  <p className={styles.modalText}>
                    {submitSuccessMessage ||
                      'Заказ успешно сформирован, менеджер скоро свяжется с вами.'}
                  </p>
                  <div className={styles.successActions}>
                    <Button onClick={handleCloseCheckout}>Понятно</Button>
                    <Link className={styles.successLink} href="/products" onClick={handleCloseCheckout}>
                      Вернуться в каталог
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CartPage
