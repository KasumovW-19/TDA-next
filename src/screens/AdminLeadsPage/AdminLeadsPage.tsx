"use client";

import { useEffect, useMemo, useState } from 'react'
import { AdminNav } from '@/components/AdminNav/AdminNav'
import styles from './AdminLeadsPage.module.scss'

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

export const AdminLeadsPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [query, setQuery] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  const loadLeads = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/leads')
      if (!response.ok) {
        throw new Error('Не удалось загрузить заявки')
      }
      const result = (await response.json()) as { leads: Lead[] }
      setLeads(result.leads ?? [])
      setLastUpdatedAt(formatDateTime(new Date()))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadLeads()
  }, [])

  const filteredLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return leads
    }
    return leads.filter((lead) =>
      [lead.customer_name, lead.phone, lead.email ?? '', lead.message ?? '', lead.id]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [leads, query])

  return (
    <div className={`container ${styles.page}`}>
      <AdminNav />

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Заявки</h2>
          <div className={styles.controls}>
            <input
              className={styles.searchField}
              placeholder="Поиск по имени, телефону, комментарию или ID"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" className={styles.refreshButton} onClick={() => void loadLeads()}>
              Обновить
            </button>
          </div>
        </div>
        <p className={styles.note}>
          {isLoading ? 'Загрузка данных...' : `Обновлено: ${lastUpdatedAt ?? 'только что'}`}
        </p>

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
    </div>
  )
}
