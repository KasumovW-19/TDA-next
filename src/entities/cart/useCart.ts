import { useContext } from 'react'
import { cartContext } from './cartContextInstance'

export const useCart = () => {
  const context = useContext(cartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
