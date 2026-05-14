"use client";

import { House, ShoppingBag, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../../entities/cart/useCart'
import styles from './MobileBottomNav.module.scss'

export const MobileBottomNav = () => {
  const { totalItems } = useCart()
  const pathname = usePathname()
  const currentPath = pathname ?? ''
  const isActiveLink = (href: string) =>
    href === '/' ? currentPath === href : currentPath === href || currentPath.startsWith(`${href}/`)

  return (
    <nav className={styles.nav}>
      <Link href="/" className={`${styles.item} ${isActiveLink('/') ? styles.active : ''}`}>
        <House size={18} />
        <span>Главная</span>
      </Link>
      <Link href="/products" className={`${styles.item} ${isActiveLink('/products') ? styles.active : ''}`}>
        <ShoppingBag size={18} />
        <span>Товары</span>
      </Link>
      <Link href="/cart" className={`${styles.item} ${isActiveLink('/cart') ? styles.active : ''}`}>
        <ShoppingCart size={18} />
        <span>Корзина</span>
        {totalItems > 0 && <b className={styles.count}>{totalItems}</b>}
      </Link>
    </nav>
  )
}
