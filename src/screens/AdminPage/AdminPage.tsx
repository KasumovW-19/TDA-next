"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/Button/Button'
import styles from './AdminPage.module.scss'

type LeadItem = {
  id: string
  product_name: string
  quantity: number
  price: number | null
}

type Lead = {
  id: string
  customer_name: string
  phone: string
  email: string | null
  message: string | null
  status: string
  total_amount: number | null
  source: string
  created_at: string
  lead_items: LeadItem[]
}

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
}

type Product = {
  id: string
  name: string
  slug: string
  category: string
  category_id: string | null
  price: number | null
  old_price: number | null
  in_stock: boolean
  is_popular: boolean
  is_new: boolean
  image_url: string | null
}

export const AdminPage = () => {
  const formatDateTime = (value: string | Date) => {
    const date = new Date(value)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year}, ${hours}:${minutes}`
  }
  const formatMoney = (value: number | null | undefined) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0))

  const [activeTab, setActiveTab] = useState<'leads' | 'catalog'>('leads')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [leadQuery, setLeadQuery] = useState('')
  const [categoryQuery, setCategoryQuery] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [isSavingCategory, setSavingCategory] = useState(false)
  const [isSavingProduct, setSavingProduct] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' })
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    price: '',
    oldPrice: '',
  })

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [leadsRes, categoriesRes, productsRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/products'),
      ])

      if (!leadsRes.ok || !categoriesRes.ok || !productsRes.ok) {
        throw new Error('Не удалось загрузить данные админки')
      }

      const leadsJson = (await leadsRes.json()) as { leads: Lead[] }
      const categoriesJson = (await categoriesRes.json()) as { categories: Category[] }
      const productsJson = (await productsRes.json()) as { products: Product[] }

      setLeads(leadsJson.leads ?? [])
      setCategories(categoriesJson.categories ?? [])
      setProducts(productsJson.products ?? [])
      setLastUpdatedAt(formatDateTime(new Date()))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

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

  const filteredLeads = useMemo(() => {
    const query = leadQuery.trim().toLowerCase()
    if (!query) {
      return leads
    }

    return leads.filter((lead) =>
      [lead.customer_name, lead.phone, lead.email ?? '', lead.message ?? '', lead.id]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [leadQuery, leads])

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase()
    if (!query) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.slug, product.category].join(' ').toLowerCase().includes(query),
    )
  }, [productQuery, products])

  const filteredCategories = useMemo(() => {
    const query = categoryQuery.trim().toLowerCase()
    if (!query) {
      return categories
    }

    return categories.filter((category) =>
      [category.name, category.slug, category.description ?? ''].join(' ').toLowerCase().includes(query),
    )
  }, [categories, categoryQuery])

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingCategory(true)
    setError(null)
    setSuccess(null)

    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryForm),
    })

    if (!response.ok) {
      const result = (await response.json()) as { message?: string }
      setError(result.message || 'Не удалось создать категорию')
      setSavingCategory(false)
      return
    }

    setCategoryForm({ name: '', slug: '', description: '' })
    await loadData()
    setSuccess('Категория успешно добавлена')
    setSavingCategory(false)
  }

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingProduct(true)
    setError(null)
    setSuccess(null)
    const selectedCategory = categoryOptions.find((category) => category.id === productForm.categoryId)

    if (!selectedCategory) {
      setError('Выберите категорию из списка')
      setSavingProduct(false)
      return
    }

    const payload = {
      ...productForm,
      category: selectedCategory.name,
      price: Number(productForm.price || 0),
      oldPrice: Number(productForm.oldPrice || 0),
    }

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const result = (await response.json()) as { message?: string }
      setError(result.message || 'Не удалось создать товар')
      setSavingProduct(false)
      return
    }

    setProductForm({
      name: '',
      slug: '',
      categoryId: '',
      description: '',
      imageUrl: '',
      price: '',
      oldPrice: '',
    })
    await loadData()
    setSuccess('Товар успешно добавлен')
    setSavingProduct(false)
  }

  const removeCategory = async (id: string) => {
    if (!window.confirm('Удалить категорию? Действие нельзя отменить.')) {
      return
    }
    setDeletingCategoryId(id)
    setError(null)
    setSuccess(null)
    const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await loadData()
      setSuccess('Категория удалена')
    } else {
      setError('Не удалось удалить категорию')
    }
    setDeletingCategoryId(null)
  }

  const removeProduct = async (id: string) => {
    if (!window.confirm('Удалить товар? Действие нельзя отменить.')) {
      return
    }
    setDeletingProductId(id)
    setError(null)
    setSuccess(null)
    const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await loadData()
      setSuccess('Товар удален')
    } else {
      setError('Не удалось удалить товар')
    }
    setDeletingProductId(null)
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Админка</h1>
          <p className={styles.subtitle}>
            Управление заявками, категориями и товарами в одном месте
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => void loadData()}>
            Обновить
          </Button>
          <Button variant="secondary" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Заявки</span>
          <strong className={styles.statValue}>{leads.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Категории</span>
          <strong className={styles.statValue}>{categories.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Товары</span>
          <strong className={styles.statValue}>{products.length}</strong>
        </div>
      </div>
      <p className={styles.note}>
        {isLoading ? 'Загрузка данных...' : `Обновлено: ${lastUpdatedAt ?? 'только что'}`}
      </p>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'leads' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          Заявки
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'catalog' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          Каталог
        </button>
      </div>

      {activeTab === 'leads' ? (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Заявки</h2>
            <input
              className={styles.searchField}
              placeholder="Поиск по имени, телефону, комментарию или ID"
              value={leadQuery}
              onChange={(event) => setLeadQuery(event.target.value)}
            />
          </div>
          <div className={styles.cardList}>
            {filteredLeads.map((lead) => (
              <article key={lead.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardMainInfo}>
                    <p className={styles.cardTitle}>{lead.customer_name}</p>
                    <p className={styles.cardSubInfo}>
                      <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                      {lead.email ? <> · {lead.email}</> : null}
                    </p>
                  </div>
                  <span className={styles.badge}>{formatDateTime(lead.created_at)}</span>
                </div>

                <div className={styles.metaRow}>
                  <span className={`${styles.metaBadge} ${styles.statusBadge}`}>Статус: {lead.status}</span>
                  <span className={styles.metaBadge}>Источник: {lead.source}</span>
                  <span className={styles.metaBadge}>Позиций: {lead.lead_items?.length ?? 0}</span>
                </div>

                <p className={styles.cardText}>
                  <strong>Сумма:</strong> {formatMoney(lead.total_amount)}
                </p>
                <p className={styles.cardText}>
                  <strong>ID:</strong> <code className={styles.code}>{lead.id}</code>
                </p>
                {lead.message && <p className={styles.cardText}>Комментарий: {lead.message}</p>}

                <details className={styles.details}>
                  <summary>Состав заявки</summary>
                  <ul className={styles.list}>
                    {lead.lead_items?.map((item) => (
                      <li key={item.id} className={styles.listItem}>
                        <span>{item.product_name}</span>
                        <span>
                          {item.quantity} шт. × {formatMoney(item.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
            {!isLoading && filteredLeads.length === 0 && (
              <p className={styles.note}>По текущему фильтру заявок нет.</p>
            )}
          </div>
        </section>
      ) : (
        <div className={styles.catalogGrid}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Категории</h2>
              <input
                className={styles.searchField}
                placeholder="Поиск категорий"
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
              />
            </div>
            <form className={styles.form} onSubmit={submitCategory}>
              <input
                className={styles.formField}
                placeholder="Название категории"
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((prev) => {
                    const name = event.target.value
                    return {
                      ...prev,
                      name,
                      slug: prev.slug ? prev.slug : makeSlug(name),
                    }
                  })
                }
                required
              />
              <input
                className={styles.formField}
                placeholder="Slug (kovanye-izdeliya)"
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, slug: makeSlug(event.target.value) }))
                }
                required
              />
              <input
                className={styles.formField}
                placeholder="Описание"
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
              <Button type="submit" disabled={isSavingCategory}>
                {isSavingCategory ? 'Сохраняем...' : 'Добавить категорию'}
              </Button>
            </form>

            <ul className={styles.manageList}>
              {filteredCategories.map((category) => (
                <li key={category.id} className={styles.manageItem}>
                  <div>
                    <p className={styles.manageTitle}>{category.name}</p>
                    <p className={styles.manageSub}>/{category.slug}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => void removeCategory(category.id)}
                    disabled={deletingCategoryId === category.id}
                  >
                    {deletingCategoryId === category.id ? 'Удаление...' : 'Удалить'}
                  </Button>
                </li>
              ))}
              {!isLoading && filteredCategories.length === 0 && (
                <li className={styles.manageItem}>Категории не найдены.</li>
              )}
            </ul>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Товары</h2>
              <input
                className={styles.searchField}
                placeholder="Поиск товаров по названию, slug и категории"
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
              />
            </div>
            <form className={styles.form} onSubmit={submitProduct}>
              <input
                className={styles.formField}
                placeholder="Название товара"
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                    slug: prev.slug ? prev.slug : makeSlug(event.target.value),
                  }))
                }
                required
              />
              <input
                className={styles.formField}
                placeholder="Slug"
                value={productForm.slug}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, slug: makeSlug(event.target.value) }))
                }
                required
              />
              <select
                className={styles.formField}
                value={productForm.categoryId}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))
                }
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
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, price: event.target.value }))
                }
                required
              />
              <input
                className={styles.formField}
                placeholder="Старая цена"
                type="number"
                min={0}
                value={productForm.oldPrice}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, oldPrice: event.target.value }))
                }
              />
              <input
                className={styles.formField}
                placeholder="URL изображения"
                value={productForm.imageUrl}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                }
              />
              <textarea
                className={styles.formField}
                placeholder="Описание"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
              <Button type="submit" disabled={isSavingProduct}>
                {isSavingProduct ? 'Сохраняем...' : 'Добавить товар'}
              </Button>
            </form>
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
                    <div>
                      <p className={styles.manageTitle}>{product.name}</p>
                      <p className={styles.manageSub}>
                        {product.category} · {formatMoney(product.price)}
                        {product.old_price ? ` (было ${formatMoney(product.old_price)})` : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => void removeProduct(product.id)}
                    disabled={deletingProductId === product.id}
                  >
                    {deletingProductId === product.id ? 'Удаление...' : 'Удалить'}
                  </Button>
                </li>
              ))}
              {!isLoading && filteredProducts.length === 0 && (
                <li className={styles.manageItem}>Товары не найдены.</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
