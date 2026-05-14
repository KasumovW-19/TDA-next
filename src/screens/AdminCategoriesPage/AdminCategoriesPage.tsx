"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AdminNav } from '@/components/AdminNav/AdminNav'
import { Button } from '@/components/Button/Button'
import styles from './AdminCategoriesPage.module.scss'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
}

export const AdminCategoriesPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', slug: '', description: '' })

  const makeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9а-яё-]/gi, '')

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Не удалось загрузить категории')
      }
      const result = (await response.json()) as { categories: Category[] }
      setCategories(result.categories ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return categories
    }
    return categories.filter((category) =>
      [category.name, category.slug, category.description ?? ''].join(' ').toLowerCase().includes(normalized),
    )
  }, [categories, query])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const result = (await response.json()) as { message?: string }
        throw new Error(result.message || 'Не удалось создать категорию')
      }

      setForm({ name: '', slug: '', description: '' })
      await loadCategories()
      setSuccess('Категория успешно добавлена')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Удалить категорию? Действие нельзя отменить.')) {
      return
    }

    setDeletingId(id)
    setError(null)
    setSuccess(null)
    const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (response.ok) {
      await loadCategories()
      setSuccess('Категория удалена')
    } else {
      setError('Не удалось удалить категорию')
    }
    setDeletingId(null)
  }

  return (
    <div className={`container ${styles.page}`}>
      <AdminNav />

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Добавить категорию</h2>
        <form className={styles.form} onSubmit={submit}>
          <input
            className={styles.formField}
            placeholder="Название категории"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => {
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
            placeholder="Slug"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: makeSlug(event.target.value) }))}
            required
          />
          <input
            className={styles.formField}
            placeholder="Описание"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Сохраняем...' : 'Добавить категорию'}
          </Button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Отображение и удаление категорий</h2>
          <input
            className={styles.searchField}
            placeholder="Поиск категорий"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <ul className={styles.manageList}>
          {filteredCategories.map((category) => (
            <li key={category.id} className={styles.manageItem}>
              <div>
                <p className={styles.manageTitle}>{category.name}</p>
                <p className={styles.manageSub}>/{category.slug}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => void remove(category.id)}
                disabled={deletingId === category.id}
              >
                {deletingId === category.id ? 'Удаление...' : 'Удалить'}
              </Button>
            </li>
          ))}
          {!isLoading && filteredCategories.length === 0 && (
            <li className={styles.manageItem}>Категории не найдены.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
