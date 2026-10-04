import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { statusInfo, formatDate, formatPrice, plural } from '../utils/format.js'
import { IconArrowRight, IconBag, IconChat, IconWallet } from '../components/Icons.jsx'

export default function AccountProfile() {
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/orders'), api.get('/api/my/reviews')])
      .then(([orderData, reviewData]) => {
        setOrders(orderData?.data || [])
        setReviews(reviewData?.data || [])
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const spent = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total_price), 0)

  return (
    <div className="stack">
      <div className="grid grid-3">
        <div className="stat-card">
          <span className="stat-icon">
            <IconBag />
          </span>
          <span className="stat-value">{orders.length}</span>
          <span className="stat-label">заказов всего</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <IconWallet />
          </span>
          <span className="stat-value">{formatPrice(spent)}</span>
          <span className="stat-label">сумма покупок</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <IconChat />
          </span>
          <span className="stat-value">{reviews.length}</span>
          <span className="stat-label">ваших отзывов</span>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Последние заказы</h2>
          <Link to="/account/orders" className="btn btn-soft btn-sm">
            Все заказы <IconArrowRight size={15} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="admin-panel-body">
            <EmptyState
              emoji="📦"
              title="Заказов пока нет"
              text="Самое время выбрать первую игрушку!"
              actionLabel="В каталог"
              actionTo="/catalog"
            />
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Дата</th>
                  <th>Товаров</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => {
                  const status = statusInfo(order.status)
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>{plural(order.items_count ?? order.items?.length ?? 0, 'шт', 'шт', 'шт')}</td>
                      <td>
                        <strong>{formatPrice(order.total_price)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${status.className}`}>{status.label}</span>
                      </td>
                      <td>
                        <Link to={`/account/orders/${order.id}`} className="btn btn-soft btn-xs">
                          Подробнее
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Ваши отзывы</h2>
          </div>
          <div className="admin-panel-body stack">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="row-between">
                  <Link to={`/product/${review.product?.slug}`} style={{ fontWeight: 700 }}>
                    {review.product?.name}
                  </Link>
                  <span className="muted small">{formatDate(review.created_at)}</span>
                </div>
                <div className="muted small">Оценка: {review.rating} / 5</div>
                <p>{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
