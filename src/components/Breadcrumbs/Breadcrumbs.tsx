import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import styles from './Breadcrumbs.module.scss'

interface Crumb {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: Crumb[]
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
    {items.map((item, index) => {
      const isLast = index === items.length - 1
      return (
        <span key={item.label} className={styles.item}>
          {item.href && !isLast ? (
            <Link className={styles.link} href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {!isLast && <ChevronRight size={14} />}
        </span>
      )
    })}
  </nav>
)
