"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AdminNav } from '@/components/AdminNav/AdminNav'
import { Button } from '@/components/Button/Button'
import styles from './AdminProductsPage.module.scss'

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  slug: string
  category: string
  category_id: string | null
  description: string | null
  size: string | null
  product_code: string | null
  price: number | null
  old_price: number | null
  in_stock: boolean
  is_popular: boolean
  is_new: boolean
  image_url: string | null
}

const formatMoney = (value: number | null | undefined) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))

const truncateText = (value: string | null | undefined, limit: number) => {
  const normalized = (value ?? '').trim()
  if (!normalized) {
    return 'Описание не добавлено'
  }
  return normalized.length > limit ? `${normalized.slice(0, limit).trimEnd()}...` : normalized
}

export const AdminProductsPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all')
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    size: '',
    productCode: '',
    imageUrl: '',
    price: '',
    oldPrice: '',
    inStock: true,
  })
  const [editForm, setEditForm] = useState({
    price: '',
    description: '',
    inStock: true,
    size: '',
    productCode: '',
  })

  const makeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9а-яё-]/gi, '')

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories],
  )

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/products'),
      ])

      if (!categoriesRes.ok || !productsRes.ok) {
        throw new Error('Не удалось загрузить товары')
      }

      const categoriesJson = (await categoriesRes.json()) as { categories: Category[] }
      const productsJson = (await productsRes.json()) as { products: Product[] }
      setCategories(categoriesJson.categories ?? [])
      setProducts(productsJson.products ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products.filter((product) => {
      const queryMatch =
        normalized.length === 0 ||
        [product.name, product.slug, product.category, product.product_code, product.size]
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      const categoryMatch = categoryFilter === 'all' || product.category_id === categoryFilter
      const stockMatch =
        stockFilter === 'all' ||
        (stockFilter === 'in' && product.in_stock) ||
        (stockFilter === 'out' && !product.in_stock)

      return queryMatch && categoryMatch && stockMatch
    })
  }, [products, query, categoryFilter, stockFilter])
  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) ?? null,
    [products, editingId],
  )
  const normalizedEditPrice = Number(editForm.price || 0)
  const isEditPriceInvalid = Number.isNaN(normalizedEditPrice) || normalizedEditPrice < 0
  const isEditUnchanged =
    !editingProduct ||
    (editingProduct.price ?? 0) === normalizedEditPrice &&
      (editingProduct.description ?? '').trim() === editForm.description.trim() &&
      (editingProduct.size ?? '').trim() === editForm.size.trim() &&
      (editingProduct.product_code ?? '').trim() === editForm.productCode.trim() &&
      editingProduct.in_stock === editForm.inStock

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const selectedCategory = categoryOptions.find((category) => category.id === productForm.categoryId)
    if (!selectedCategory) {
      setError('Выберите категорию из списка')
      setSaving(false)
      return
    }

    const payload = {
      ...productForm,
      category: selectedCategory.name,
      price: Number(productForm.price || 0),
      oldPrice: Number(productForm.oldPrice || 0),
      slug: makeSlug(productForm.name),
    }

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const result = (await response.json()) as { message?: string }
      setError(result.message || 'Не удалось создать товар')
      setSaving(false)
      return
    }

    setProductForm({
      name: '',
      categoryId: '',
      description: '',
      size: '',
      productCode: '',
      imageUrl: '',
      price: '',
      oldPrice: '',
      inStock: true,
    })
    await loadData()
    setSuccess('Товар успешно добавлен')
    setSaving(false)
  }

  const uploadCreateImage = async (file: File) => {
    setIsUploadingImage(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.set('file', file)
    formData.set('productName', productForm.name || 'product')

    const response = await fetch('/admin/upload-product-image', {
      method: 'POST',
      body: formData,
    })

    const result = (await response.json()) as { url?: string; message?: string }

    if (!response.ok || !result.url) {
      setError(result.message || 'Не удалось загрузить изображение')
      setIsUploadingImage(false)
      return
    }

    setProductForm((prev) => ({ ...prev, imageUrl: result.url ?? '' }))
    setSuccess('Изображение загружено')
    setIsUploadingImage(false)
  }

  const remove = async (id: string) => {
    if (!window.confirm('Удалить товар? Действие нельзя отменить.')) {
      return
    }

    setDeletingId(id)
    setError(null)
    setSuccess(null)
    const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await loadData()
      setSuccess('Товар удален')
    } else {
      setError('Не удалось удалить товар')
    }
    setDeletingId(null)
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({
      price: String(product.price ?? 0),
      description: product.description ?? '',
      inStock: product.in_stock,
      size: product.size ?? '',
      productCode: product.product_code ?? '',
    })
    setError(null)
    setSuccess(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ price: '', description: '', inStock: true, size: '', productCode: '' })
  }

  const saveEdit = async (id: string) => {
    setUpdatingId(id)
    setError(null)
    setSuccess(null)

    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: Number(editForm.price || 0),
        description: editForm.description,
        inStock: editForm.inStock,
        size: editForm.size,
        productCode: editForm.productCode,
      }),
    })

    if (!response.ok) {
      const result = (await response.json()) as { message?: string }
      setError(result.message || 'Не удалось обновить товар')
      setUpdatingId(null)
      return
    }

    await loadData()
    setSuccess('Товар обновлен')
    setUpdatingId(null)
    cancelEdit()
  }

  return (
    <div className={`container ${styles.page}`}>
      <AdminNav />

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Добавить товар</h2>
        <form className={styles.form} onSubmit={submit}>
          <input
            className={styles.formField}
            placeholder="Название товара"
            value={productForm.name}
            onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <select
            className={styles.formField}
            value={productForm.categoryId}
            onChange={(event) => setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            required
          >
            <option value="">Выберите категорию</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            className={styles.formField}
            placeholder="Цена"
            type="number"
            min={0}
            value={productForm.price}
            onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
          <input
            className={styles.formField}
            placeholder="Старая цена"
            type="number"
            min={0}
            value={productForm.oldPrice}
            onChange={(event) => setProductForm((prev) => ({ ...prev, oldPrice: event.target.value }))}
          />
          <input
            className={styles.formField}
            placeholder="Код товара"
            value={productForm.productCode}
            onChange={(event) => setProductForm((prev) => ({ ...prev, productCode: event.target.value }))}
          />
          <input
            className={styles.formField}
            placeholder="Размер"
            value={productForm.size}
            onChange={(event) => setProductForm((prev) => ({ ...prev, size: event.target.value }))}
          />
          <input
            className={styles.formField}
            placeholder="URL изображения"
            value={productForm.imageUrl}
            onChange={(event) => setProductForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          />
          <div className={styles.uploadRow}>
            <input
              className={styles.formField}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                void uploadCreateImage(file)
                event.target.value = ''
              }}
              disabled={isUploadingImage}
            />
            <span className={styles.uploadHint}>
              {isUploadingImage ? 'Загрузка изображения...' : 'Можно загрузить JPG, PNG, WEBP или AVIF'}
            </span>
          </div>
          {productForm.imageUrl ? (
            <img className={styles.uploadPreview} src={productForm.imageUrl} alt="Превью изображения товара" />
          ) : null}
          <select
            className={styles.formField}
            value={productForm.inStock ? 'in' : 'out'}
            onChange={(event) =>
              setProductForm((prev) => ({ ...prev, inStock: event.target.value === 'in' }))
            }
          >
            <option value="in">В наличии</option>
            <option value="out">Нет в наличии</option>
          </select>
          <textarea
            className={styles.formField}
            placeholder="Описание"
            value={productForm.description}
            onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <Button type="submit" disabled={isSaving || isUploadingImage}>
            {isSaving ? 'Сохраняем...' : 'Добавить товар'}
          </Button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Управление товарами</h2>
          <span className={styles.countBadge}>Найдено: {filteredProducts.length}</span>
        </div>
        <div className={styles.filters}>
          <input
            className={styles.searchField}
            placeholder="Поиск по названию, slug, категории, коду и размеру"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className={styles.filterField}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Все категории</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className={styles.filterField}
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as 'all' | 'in' | 'out')}
          >
            <option value="all">Все статусы наличия</option>
            <option value="in">Только в наличии</option>
            <option value="out">Только нет в наличии</option>
          </select>
        </div>
        <ul className={styles.manageList}>
          {filteredProducts.map((product) => (
            <li key={product.id} className={styles.manageItem}>
              <div className={styles.productLine}>
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.productThumb} src={product.image_url} alt={product.name} />
                ) : (
                  <span className={styles.productThumbFallback}>Нет фото</span>
                )}
                <div className={styles.productDetails}>
                  <div className={styles.titleRow}>
                    <p className={styles.manageTitle}>{product.name}</p>
                    <span
                      className={`${styles.stockBadge} ${product.in_stock ? styles.stockIn : styles.stockOut}`}
                    >
                      {product.in_stock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>
                  <p className={styles.manageSub}>
                    {product.category} · {formatMoney(product.price)}
                    {product.old_price ? ` (было ${formatMoney(product.old_price)})` : ''}
                  </p>
                  <p className={styles.manageMeta}>slug: {product.slug}</p>
                  <p className={styles.manageMeta}>
                    Код: {product.product_code || '—'} · Размер: {product.size || '—'}
                  </p>
                  <p className={styles.descriptionPreview}>{truncateText(product.description, 130)}</p>
                  {editingId === product.id ? (
                    <div className={styles.editFields}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Цена</label>
                        <input
                          className={styles.formField}
                          placeholder="Цена"
                          type="number"
                          min={0}
                          value={editForm.price}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, price: event.target.value }))
                          }
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Код товара</label>
                        <input
                          className={styles.formField}
                          placeholder="Код товара"
                          value={editForm.productCode}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, productCode: event.target.value }))
                          }
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Размер</label>
                        <input
                          className={styles.formField}
                          placeholder="Размер"
                          value={editForm.size}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, size: event.target.value }))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Наличие</label>
                        <select
                          className={styles.formField}
                          value={editForm.inStock ? 'in' : 'out'}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, inStock: event.target.value === 'in' }))
                          }
                        >
                          <option value="in">В наличии</option>
                          <option value="out">Нет в наличии</option>
                        </select>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Описание</label>
                        <textarea
                          className={styles.formField}
                          placeholder="Описание"
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, description: event.target.value }))
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={styles.actions}>
                {editingId === product.id ? (
                  <>
                    <Button
                      onClick={() => void saveEdit(product.id)}
                      disabled={updatingId === product.id || isEditPriceInvalid || isEditUnchanged}
                    >
                      {updatingId === product.id ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button variant="secondary" onClick={cancelEdit} disabled={updatingId === product.id}>
                      Отмена
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => startEdit(product)}>
                    Редактировать
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className={styles.deleteButton}
                  onClick={() => void remove(product.id)}
                  disabled={deletingId === product.id || updatingId === product.id}
                >
                  {deletingId === product.id ? 'Удаление...' : 'Удалить'}
                </Button>
              </div>
            </li>
          ))}
          {!isLoading && filteredProducts.length === 0 && (
            <li className={styles.manageItem}>Товары не найдены.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
