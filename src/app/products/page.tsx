import { Suspense } from 'react'
import { ProductsPage } from '../../screens/ProductsPage/ProductsPage'

export default function ProductsRoutePage() {
  return (
    <Suspense fallback={null}>
      <ProductsPage />
    </Suspense>
  )
}
