import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { IconCheck, IconWallet } from '../components/Icons.jsx'
import { formatPrice, imageUrl, plural } from '../utils/format.js'

export default function Checkout() {
  const { items, total, count, clear } = useCart()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    comment: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        name: current.name || user.name || '',
        phone: current.phone || user.phone || '',
        address: current.address || user.address || ''
      }))
    }
  }, [user])

  const delivery = total >= 5000 || total === 0 ? 0 : 350

  const change = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const response = await api.post('/api/orders', {
        ...form,
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity }))
      })
      clear()
      setDone(response.order)
      toast.success('Заказ оформлен! Мы уже собираем посылку 🧸')
    } catch (error) {
      if (error.errors && Object.keys(error.errors).length > 0) {
        setErrors(
          Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value[0]]))
        )
        toast.error('Проверьте поля формы')
      } else {
        toast.error(error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="section container-narrow">
        <div className="card center reveal">
          <div className="empty-emoji">🎉</div>
          <h1 style={{ fontSize: '1.8rem' }}>Заказ №{done.id} оформлен!</h1>
          <p className="muted">
            Мы отправили детали на {user?.email || 'вашу почту'}. Статус заказа всегда доступен в
            личном кабинете.
          </p>
          <div className="summary-row">
            <span>Сумма заказа</span>
            <span>{formatPrice(done.total_price)}</span>
          </div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link to="/account/orders" className="btn btn-primary">
              Мои заказы
            </Link>
            <Link to="/catalog" className="btn btn-outline">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="section container">
        <EmptyState
          emoji="🧺"
          title="Нечего оформлять"
          text="Сначала добавьте игрушки в корзину."
          actionLabel="В каталог"
          actionTo="/catalog"
        />
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/cart">Корзина</Link>
          <span>/</span>
          <span>Оформление заказа</span>
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">Оформление</span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>Куда отправить игрушки?</h1>
            <p>Заполните данные — заказ сохранится в базе и появится в личном кабинете.</p>
          </div>
        </div>

        {!user && (
          <div className="alert alert-info">
            Вы оформляете заказ как гость. <Link to="/login">Войдите</Link>, чтобы видеть статус
            заказа в личном кабинете.
          </div>
        )}

        <form className="cart-layout" onSubmit={submit}>
          <div className="card">
            <h3>Данные получателя</h3>

            <div className="field">
              <label className="label" htmlFor="name">
                Имя и фамилия *
              </label>
              <input
                id="name"
                className={`input ${errors.name ? 'invalid' : ''}`}
                value={form.name}
                onChange={change('name')}
                placeholder="Анна Иванова"
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="field">
              <label className="label" htmlFor="phone">
                Телефон *
              </label>
              <input
                id="phone"
                className={`input ${errors.phone ? 'invalid' : ''}`}
                value={form.phone}
                onChange={change('phone')}
                placeholder="+7 (900) 000-00-00"
                required
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="field">
              <label className="label" htmlFor="address">
                Адрес доставки *
              </label>
              <textarea
                id="address"
                className={`textarea ${errors.address ? 'invalid' : ''}`}
                value={form.address}
                onChange={change('address')}
                placeholder="Город, улица, дом, квартира, индекс"
                required
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="field">
              <label className="label" htmlFor="comment">
                Комментарий к заказу
              </label>
              <textarea
                id="comment"
                className="textarea"
                value={form.comment}
                onChange={change('comment')}
                placeholder="Например: подарочная упаковка и открытка"
              />
            </div>
          </div>

          <aside className="summary">
            <h3>Ваш заказ</h3>
            {items.map((item) => (
              <div key={item.id} className="row" style={{ alignItems: 'center', gap: 12 }}>
                <img
                  src={imageUrl(item.image)}
                  alt={item.name}
                  style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover' }}
                />
                <div className="grow">
                  <div style={{ fontWeight: 700, fontSize: '0.93rem' }}>{item.name}</div>
                  <div className="muted small">
                    {plural(item.quantity, 'шт', 'шт', 'шт')} × {formatPrice(item.price)}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}

            <div className="divider" />

            <div className="summary-row">
              <span>Товары ({count})</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Доставка</span>
              <span>{delivery === 0 ? 'бесплатно' : formatPrice(delivery)}</span>
            </div>
            <div className="summary-total">
              <span>К оплате</span>
              <span>{formatPrice(total + delivery)}</span>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={submitting}>
              {submitting ? 'Оформляем…' : 'Подтвердить заказ'}
            </button>
            <p className="hint-text mt-2 center">
              <IconWallet size={14} /> Оплата при получении или онлайн — уточнит менеджер
            </p>
            <p className="hint-text center">
              <IconCheck size={14} /> Нажимая кнопку, вы соглашаетесь с условиями магазина
            </p>
          </aside>
        </form>
      </div>
    </div>
  )
}
