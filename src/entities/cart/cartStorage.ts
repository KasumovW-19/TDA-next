import type { CartItem } from './types'

const CART_STORAGE_KEY = 'forge-market-cart'

export const readCartFromStorage = (): CartItem[] => {
  try {
    const value = localStorage.getItem(CART_STORAGE_KEY)
    if (!value) {
      return []
    }
    const parsed = JSON.parse(value) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const writeCartToStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore possible storage quota errors in demo mode
  }
}
