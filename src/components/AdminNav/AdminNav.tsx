"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/Button/Button'
import styles from './AdminNav.module.scss'

const links = [
  { href: '/admin', label: 'Заявки' },
  { href: '/admin/categories', label: 'Категории' },
  { href: '/admin/products', label: 'Товары' },
]

export const AdminNav = () => {
  const pathname = usePathname() ?? ''

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Админка</h1>
        <p className={styles.subtitle}>Управление магазином</p>
      </div>
      <div className={styles.actions}>
        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.linkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button variant="secondary" onClick={logout}>
          Выйти
        </Button>
      </div>
    </header>
  )
}
