import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import {
  IconBag,
  IconBoxes,
  IconChat,
  IconUsers,
  IconWallet,
  IconArrowRight
} from '../../components/Icons.jsx'
import { formatDateTime, formatPrice, statusInfo } from '../../utils/format.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/admin/stats')
      .then((data) => setStats(data))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Считаем статистику…" />
  if (!stats) return <div className="alert alert-error">Не удалось загрузить статистику</div>

  const cards = [
    { icon: IconBoxes, label: 'Товаров в каталоге', value: stats.products },
    { icon: IconBag, label: 'Заказов всего', value: stats.orders },
    { icon: IconUsers, label: 'Пользователей', value: stats.users },
    { icon: IconChat, label: 'Отзывов', value: stats.reviews },
    { icon: IconWallet, label: 'Сумма заказов', value: formatPrice(stats.revenue) }
  ]

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Статистика магазина</h1>
          <p className="muted small mb-0">Сводка по товарам, заказам и покупателям Softy.</p>
        </div>
        <div className="row">
          <Link to="/admin/products/new" className="btn btn-primary">
            Добавить товар
          </Link>
          <Link to="/admin/orders" className="btn btn-outline">
            Заказы
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="stat-card">
              <span className="stat-icon">
                <Icon />
              </span>
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          )
        })}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Новые заказы (ожидают обработки)</span>
          <span className="stat-value">{stats.orders_new}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Выполненные заказы</span>
          <span className="stat-value">{stats.orders_completed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Средний чек</span>
          <span className="stat-value">{formatPrice(stats.average_check)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Товары на исходе (≤ 3 шт.)</span>
          <span className="stat-value">{stats.low_stock_count}</span>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Последние заказы</h2>
          <Link to="/admin/orders" className="btn btn-soft btn-sm">
            Все заказы <IconArrowRight size={15} />
          </Link>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>№</th>
                <th>Покупатель</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map((order) => {
                const info = statusInfo(order.status)
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>{order.user?.name || order.customer_name}</td>
                    <td>{formatDateTime(order.created_at)}</td>
                    <td>{formatPrice(order.total_price)}</td>
                    <td>
                      <span className={`status-pill ${info.className}`}>{info.label}</span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="btn btn-soft btn-xs">
                        Открыть
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Популярные товары</h2>
            <span className="muted small">по количеству продаж</span>
          </div>
          <div className="admin-panel-body stack">
            {stats.top_products.length === 0 ? (
              <p className="muted small mb-0">Продаж пока нет.</p>
            ) : (
              stats.top_products.map((product) => (
                <div key={product.id} className="row-between">
                  <Link to={`/product/${product.slug}`} style={{ fontWeight: 700 }}>
                    {product.name}
                  </Link>
                  <span className="muted small">
                    {product.sold_count ?? 0} шт. · {formatPrice(product.price)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Заканчиваются на складе</h2>
            <span className="muted small">3 шт. и меньше</span>
          </div>
          <div className="admin-panel-body stack">
            {stats.low_stock.length === 0 ? (
              <p className="muted small mb-0">Все товары в достатке 🎉</p>
            ) : (
              stats.low_stock.map((product) => (
                <div key={product.id} className="row-between">
                  <Link to={`/admin/products/${product.id}/edit`} style={{ fontWeight: 700 }}>
                    {product.name}
                  </Link>
                  <span className="status-pill status-processing">{product.stock} шт.</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Последние отзывы</h2>
          <Link to="/admin/reviews" className="btn btn-soft btn-sm">
            Все отзывы <IconArrowRight size={15} />
          </Link>
        </div>
        <div className="admin-panel-body stack">
          {stats.recent_reviews.length === 0 ? (
            <p className="muted small mb-0">Отзывов пока нет.</p>
          ) : (
            stats.recent_reviews.map((review) => (
              <div key={review.id} className="card-flat">
                <div className="row-between">
                  <strong>{review.user?.name || 'Покупатель'}</strong>
                  <span className="muted small">{formatDateTime(review.created_at)}</span>
                </div>
                <div className="muted small">
                  {review.product?.name} · оценка {review.rating}/5
                </div>
                <p className="mb-0">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
