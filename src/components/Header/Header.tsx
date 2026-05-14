"use client";

import { Hammer, LogIn, Menu, PhoneCall, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '../../entities/cart/useCart'
import styles from './Header.module.scss'

const links = [
  { href: '/', label: 'Главная' },
  { href: '/products', label: 'Товары' },
  { href: '/cart', label: 'Корзина' },
]

const phoneNumber = '+7 967 877-77-78'
const phoneHref = 'tel:+79678777778'
const whatsappHref =
  'https://wa.me/79678777778?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%9D%D1%83%D0%B6%D0%BD%D0%B0%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8F%20%D0%BF%D0%BE%20%D0%B2%D0%BE%D1%80%D0%BE%D1%82%D0%B0%D0%BC%20%D0%B8%20%D0%BA%D0%BE%D0%B2%D0%BA%D0%B5.'

export const Header = () => {
  const { totalItems } = useCart()
  const pathname = usePathname()
  const currentPath = pathname ?? ''
  const [menuOpen, setMenuOpen] = useState(false)
  const isActiveLink = (href: string) =>
    href === '/' ? currentPath === href : currentPath === href || currentPath.startsWith(`${href}/`)

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.logo} href="/">
          <span className={styles.logoMark}>
            <Hammer size={14} />
          </span>
          <span className={styles.logoText}>
            <strong className={styles.logoTitle}>ТДА</strong>
            <small className={styles.logoSubtitle}>торговый дом Адам</small>
          </span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`${styles.link} ${isActiveLink(link.href) ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.quickInfo}>
          <a href={phoneHref} className={styles.phone}>
            <PhoneCall size={13} />
            <span>{phoneNumber}</span>
          </a>
          <small className={styles.quickInfoSchedule}>Ежедневно: 09:00 - 20:00</small>
        </div>

        <div className={styles.actions}>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={styles.consultButton}
            aria-label="Открыть консультацию в WhatsApp"
          >
            <PhoneCall size={15} />
            Консультация в WhatsApp
          </a>

          <Link href="/admin/login" className={styles.adminButton}>
            <LogIn size={15} />
            <span>Войти</span>
          </Link>

          <Link href="/cart" className={styles.cartButton} aria-label="Открыть корзину">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className={styles.count}>{totalItems}</span>}
          </Link>

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Открыть меню"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
