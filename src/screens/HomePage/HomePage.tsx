"use client";

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { CheckCircle2, PaintRoller, ShieldCheck, Star, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '../../components/Button/Button'
import { ProductGrid } from '../../components/ProductGrid/ProductGrid'
import { ProductQuickView } from '../../components/ProductQuickView/ProductQuickView'
import { SectionTitle } from '../../components/SectionTitle/SectionTitle'
import { mockProducts } from '../../data/mockProducts'
import { useCart } from '../../entities/cart/useCart'
import type { Product, ProductCategory } from '../../entities/product/types'
import { productCategories } from '../../entities/product/types'
import customSectionImage from '../../assets/custom-section-kovka.png'
import homeHeroImage from '../../assets/home-hero-kovka.png'
import styles from './HomePage.module.scss'

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
} as const

const whyUs = [
  'Собственное производство и контроль качества',
  'Помощь в подборе под архитектуру дома и участка',
  'Доставка по городу и в регионы',
  'Консультация мастера по покраске и монтажу',
]

const categoryDescriptions: Record<ProductCategory, string> = {
  Ворота: 'Распашные и откатные модели для частных домов и коммерческих объектов.',
  Калитки: 'Надежные входные калитки с декоративными элементами и антикоррозийной защитой.',
  Заборы: 'Металлические секции и решения для периметра с аккуратным современным видом.',
  'Кованые изделия': 'Готовые кованые конструкции для фасадов, входных групп и террас.',
  'Элементы ковки': 'Пики, розетки, завитки, вставки и другие детали для сборки изделий.',
  'Краски по металлу': 'Покрытия с защитой от влаги, УФ и механического износа.',
  Грунтовки: 'Антикоррозийные составы для подготовки металла перед финишной покраской.',
  Фурнитура: 'Петли, замки, ручки и комплекты для монтажа ворот и калиток.',
  'Перила и ограждения': 'Лестничные и балконные ограждения в едином стиле участка.',
  'Декор для участка': 'Садовые арки, лавки и декоративные металлические элементы.',
}

export const HomePage = () => {
  const { addItem } = useCart()
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [isConsultationOpen, setConsultationOpen] = useState(false)
  const [consultForm, setConsultForm] = useState({
    fullName: '',
    phone: '',
    comment: '',
  })

  const popularProducts = useMemo(
    () => mockProducts.filter((item) => item.isPopular).slice(0, 6),
    [],
  )
  const hasPopularProducts = popularProducts.length > 0
  const categoryCountMap = useMemo(
    () =>
      mockProducts.reduce<Record<ProductCategory, number>>((acc, product) => {
        acc[product.category] = (acc[product.category] ?? 0) + 1
        return acc
      }, {} as Record<ProductCategory, number>),
    [],
  )
  const whatsappPhone = '79001234567'

  const handleConsultationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = [
      'Нужна консультация',
      `ФИО: ${consultForm.fullName}`,
      `Телефон: ${consultForm.phone}`,
      `Комментарий: ${consultForm.comment.trim() || 'не указан'}`,
    ].join('\n')
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setConsultationOpen(false)
    setConsultForm({ fullName: '', phone: '', comment: '' })
  }

  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <motion.div {...reveal} className={styles.heroContent}>
          <p className={styles.eyebrow}>Премиальные решения из металла</p>
          <h1 className={styles.heroTitle}>Кованые ворота, ограждения и товары для надежного дома</h1>
          <p className={styles.heroDescription}>
            Современный каталог металлических изделий, покрытий и фурнитуры: от ворот и калиток до
            декоративных элементов для участка.
          </p>
          <div className={styles.heroActions}>
            <Link href="/products" className={styles.primaryAction}>
              Перейти в каталог
            </Link>
            <Link href="/products" className={styles.secondaryAction}>
              Подобрать решение
            </Link>
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>
              <Star size={14} /> 4.9 рейтинг сервиса
            </span>
            <span className={styles.heroMetaItem}>
              <ShieldCheck size={14} /> Гарантия на изделия до 5 лет
            </span>
          </div>
        </motion.div>

        <motion.div {...reveal} className={styles.heroVisual}>
          <Image
            className={styles.heroImage}
            src={homeHeroImage}
            alt="Кованые ворота возле частного дома"
            priority
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroCardTop}>
            <p className={styles.heroCardTopLabel}>Индивидуальный проект</p>
            <strong className={styles.heroCardTopValue}>
              Подберем стиль, размер и отделку под ваш дом
            </strong>
          </div>
          <div className={styles.heroCardBottom}>
            <span className={styles.heroCardBottomLabel}>Срок производства</span>
            <strong className={styles.heroCardBottomValue}>от 7 до 18 дней</strong>
          </div>
        </motion.div>
      </section>

      <motion.section className={`container ${styles.section}`} {...reveal}>
        <SectionTitle
          title="Категории товаров"
          subtitle="Основные направления для дома, участка, забора и ворот."
        />
        <div className={styles.categories}>
          {productCategories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className={styles.categoryCard}
            >
              <h3 className={styles.categoryTitle}>{category}</h3>
              <p className={styles.categoryText}>{categoryDescriptions[category]}</p>
              <p className={styles.categoryMeta}>
                {categoryCountMap[category] ?? 0} позиций в каталоге
              </p>
              <span className={styles.categoryAction}>Смотреть товары</span>
            </Link>
          ))}
        </div>
      </motion.section>

      <section className={`container ${styles.section}`}>
        <SectionTitle
          title="Популярные товары"
          subtitle="Проверенные позиции с высоким рейтингом покупателей."
          action={<Link href="/products">Смотреть весь каталог</Link>}
        />
        {hasPopularProducts ? (
          <ProductGrid
            products={popularProducts}
            onAddToCart={addItem}
            onQuickView={setQuickView}
            loading={false}
          />
        ) : (
          <div className={styles.productsFallback}>
            Популярные товары временно недоступны. Перейдите в каталог, чтобы посмотреть весь
            ассортимент.
          </div>
        )}
      </section>

      <motion.section className={`container ${styles.advantages}`} {...reveal}>
        <article className={styles.advantageCard}>
          <Truck size={20} />
          <h4 className={styles.advantageTitle}>Доставка</h4>
          <p className={styles.advantageText}>Бережная логистика по городу и отправка в регионы.</p>
        </article>
        <article className={styles.advantageCard}>
          <ShieldCheck size={20} />
          <h4 className={styles.advantageTitle}>Гарантия</h4>
          <p className={styles.advantageText}>Гарантийные обязательства на продукцию и покрытие.</p>
        </article>
        <article className={styles.advantageCard}>
          <CheckCircle2 size={20} />
          <h4 className={styles.advantageTitle}>Консультация специалиста</h4>
          <p className={styles.advantageText}>Подбор изделий по размерам, стилю и бюджету.</p>
        </article>
        <article className={styles.advantageCard}>
          <PaintRoller size={20} />
          <h4 className={styles.advantageTitle}>Подбор краски и фурнитуры</h4>
          <p className={styles.advantageText}>Решения под долговечную эксплуатацию на улице.</p>
        </article>
      </motion.section>

      <motion.section className={`container ${styles.promo}`} {...reveal}>
        <div>
          <p className={styles.eyebrow}>Спецпредложение</p>
          <h2 className={styles.promoTitle}>Скидка до 20% на комплекты ворот + фурнитура</h2>
          <p className={styles.promoText}>
            Действует до конца месяца при заказе полного комплекта для участка.
          </p>
        </div>
        <Link href="/products" className={styles.primaryAction}>
          Получить предложение
        </Link>
      </motion.section>

      <motion.section className={`container ${styles.section} ${styles.why}`} {...reveal}>
        <SectionTitle title="Почему выбирают нас" />
        <div>
          {whyUs.map((item) => (
            <p key={item} className={styles.whyItem}>
              {item}
            </p>
          ))}
        </div>
      </motion.section>

      <motion.section className={`container ${styles.custom}`} {...reveal}>
        <div>
          <h2 className={styles.customTitle}>Индивидуальное изготовление</h2>
          <p className={styles.customText}>
            Подбираем изделия под размеры проема, архитектуру дома и стиль участка. Вы можете
            выбрать покрытие, декоративные элементы и уровень защиты металла.
          </p>
        </div>
        <Image
          className={styles.customImage}
          src={customSectionImage}
          alt="Индивидуальные кованые изделия"
        />
      </motion.section>

      <motion.section className={`container ${styles.consultation}`} {...reveal}>
        <h3 className={styles.consultationTitle}>Нужна консультация?</h3>
        <p className={styles.consultationText}>
          Оставьте заявку, и специалист подберет оптимальное решение под ваш объект.
        </p>
        <button
          className={styles.consultationButton}
          type="button"
          onClick={() => setConsultationOpen(true)}
        >
          Оставить заявку
        </button>
      </motion.section>

      <AnimatePresence>
        {isConsultationOpen && (
          <motion.div
            className={styles.consultModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConsultationOpen(false)}
          >
            <motion.div
              className={styles.consultModal}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.consultModalClose}
                onClick={() => setConsultationOpen(false)}
                aria-label="Закрыть форму консультации"
              >
                <X size={18} />
              </button>
              <h3 className={styles.consultModalTitle}>Оставить заявку на консультацию</h3>
              <p className={styles.consultModalText}>
                Укажите ваши контакты, и мы напишем вам в WhatsApp для уточнения деталей.
              </p>
              <form className={styles.consultForm} onSubmit={handleConsultationSubmit}>
                <label className={styles.consultLabel}>
                  ФИО
                  <input
                    className={styles.consultInput}
                    required
                    value={consultForm.fullName}
                    onChange={(event) =>
                      setConsultForm((prev) => ({ ...prev, fullName: event.target.value }))
                    }
                    placeholder="Иванов Иван Иванович"
                  />
                </label>
                <label className={styles.consultLabel}>
                  Номер телефона
                  <input
                    className={styles.consultInput}
                    required
                    type="tel"
                    value={consultForm.phone}
                    onChange={(event) =>
                      setConsultForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    placeholder="+7 (900) 123-45-67"
                  />
                </label>
                <label className={styles.consultLabel}>
                  Комментарий (необязательно)
                  <textarea
                    className={styles.consultTextarea}
                    rows={3}
                    value={consultForm.comment}
                    onChange={(event) =>
                      setConsultForm((prev) => ({ ...prev, comment: event.target.value }))
                    }
                    placeholder="Например: нужна помощь с подбором ворот"
                  />
                </label>
                <Button type="submit" size="l">
                  Отправить в WhatsApp
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductQuickView product={quickView} onClose={() => setQuickView(null)} onAddToCart={addItem} />
    </div>
  )
}

export default HomePage
