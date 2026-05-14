import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'm' | 'l'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'm',
  className,
  icon,
  children,
  ...rest
}: ButtonProps) => (
  <button
    className={[styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')}
    {...rest}
  >
    {icon}
    <span>{children}</span>
  </button>
)
