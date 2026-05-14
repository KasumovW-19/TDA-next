"use client";

import { useState } from 'react'
import { Button } from '@/components/Button/Button'
import styles from './AdminLoginPage.module.scss'

export const AdminLoginPage = () => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      })

      if (!response.ok) {
        const result = (await response.json()) as { message?: string }
        throw new Error(result.message || 'Ошибка авторизации')
      }

      window.location.href = '/admin'
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ошибка авторизации')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={submit}>
        <h1 className={styles.title}>Вход в админку</h1>
        <p className={styles.subtitle}>Введите логин и пароль администратора</p>
        <input
          className={styles.input}
          placeholder="Логин"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          required
        />
        <input
          className={styles.input}
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Проверка...' : 'Войти'}
        </Button>
      </form>
    </div>
  )
}
