import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { readCartFromStorage, writeCartToStorage } from './cartStorage'
import type { Product } from '../product/types'
import type { CartItem } from './types'
import { cartContext } from './cartContextInstance'

interface CartState {
  items: CartItem[]
  isStorageHydrated: boolean
}

type CartAction =
  | { type: 'hydrate'; items: CartItem[] }
  | { type: 'add'; product: Product }
  | { type: 'remove'; productId: string }
  | { type: 'updateQuantity'; productId: string; quantity: number }
  | { type: 'clear' }

const initialCartState: CartState = {
  items: [],
  isStorageHydrated: false,
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'hydrate':
      return { items: action.items, isStorageHydrated: true }
    case 'add': {
      const existing = state.items.find((item) => item.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return { ...state, items: [...state.items, { product: action.product, quantity: 1 }] }
    }
    case 'remove':
      return { ...state, items: state.items.filter((item) => item.product.id !== action.productId) }
    case 'updateQuantity':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.product.id !== action.productId) }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId ? { ...item, quantity: action.quantity } : item,
        ),
      }
    case 'clear':
      return { ...state, items: [] }
    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState)

  useEffect(() => {
    dispatch({ type: 'hydrate', items: readCartFromStorage() })
  }, [])

  useEffect(() => {
    if (!state.isStorageHydrated) {
      return
    }
    writeCartToStorage(state.items)
  }, [state.items, state.isStorageHydrated])

  const addItem = (product: Product) => dispatch({ type: 'add', product })

  const removeItem = (productId: string) => dispatch({ type: 'remove', productId })

  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: 'updateQuantity', productId, quantity })

  const clearCart = () => dispatch({ type: 'clear' })

  const totalItems = useMemo(
    () => state.items.reduce((acc, item) => acc + item.quantity, 0),
    [state.items],
  )

  const totalPrice = useMemo(
    () => state.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
    [state.items],
  )

  const value = {
    items: state.items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <cartContext.Provider value={value}>{children}</cartContext.Provider>
}
