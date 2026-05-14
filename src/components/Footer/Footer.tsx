import Link from 'next/link'
import styles from './Footer.module.scss'

export const Footer = () => (
  <footer className={styles.footer}>
    <div className={`container ${styles.inner}`}>
      <div>
        <h3 className={styles.heading}>ТДА - торговый дом Адам</h3>
        <p className={styles.text}>
          Магазин кованых изделий, ворот, металлических конструкций и материалов для надежной
          отделки.
        </p>
      </div>

      <div>
        <h4 className={styles.heading}>Навигация</h4>
        <div className={styles.links}>
          <Link className={styles.link} href="/">
            Главная
          </Link>
          <Link className={styles.link} href="/products">
            Товары
          </Link>
          <Link className={styles.link} href="/cart">
            Корзина
          </Link>
        </div>
      </div>

      <div>
        <h4 className={styles.heading}>Контакты</h4>
        <p className={styles.text}>+7 (123) 123-45-67</p>
        <p className={styles.text}>pochta@mail.ru</p>
        <p className={styles.text}>г. Ойсхара, ул. улица, 111</p>
      </div>
    </div>
  </footer>
)
