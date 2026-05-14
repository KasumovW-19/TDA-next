import { createContext } from 'react'
import type { Product } from '../product/types'
import type { CartItem } from './types'

export interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const cartContext = createContext<CartContextValue | null>(null)
