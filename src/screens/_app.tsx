import type { AppProps } from 'next/app'
import { CartProvider } from '../entities/cart/CartContext'
import '../styles/global.scss'

export default function PagesApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  )
}
