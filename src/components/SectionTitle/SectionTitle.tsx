import type { ReactNode } from 'react'
import styles from './SectionTitle.module.scss'

interface SectionTitleProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export const SectionTitle = ({ title, subtitle, action }: SectionTitleProps) => (
  <div className={styles.wrap}>
    <div>
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
    {action}
  </div>
)
