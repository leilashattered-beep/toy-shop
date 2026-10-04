import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client.js'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { ORDER_STATUSES, formatDateTime, formatPrice, imageUrl, statusInfo } from '../utils/format.js'

export default function OrderDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get(`/api/orders/${id}`)
      .then((data) => setOrder(data?.data || null))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const cancel = async () => {
    try {
      await api.post(`/api/orders/${id}/cancel`)
      toast.success('Заказ отменён')
      load()
    } catch (requestError) {
      toast.error(requestError.message)
    }
  }

  if (loading) return <Loader />
  if (error || !order) {
    return (
      <EmptyState
        emoji="🔍"
        title="Заказ не найден"
        text={error || 'Проверьте номер заказа.'}
        actionLabel="Мои заказы"
        actionTo="/account/orders"
      />
    )
  }

  const info = statusInfo(order.status)
  const currentIndex = ORDER_STATUSES.findIndex((item) => item.value === order.status)

  return (
    <div className="stack">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Заказ #{order.id}</h2>
            <span className="muted small">от {formatDateTime(order.created_at)}</span>
          </div>
          <div className="row">
            <span className={`status-pill ${info.className}`}>{info.label}</span>
            {['new', 'processing'].includes(order.status) && (
              <button type="button" className="btn btn-danger btn-sm" onClick={cancel}>
                Отменить заказ
              </button>
            )}
          </div>
        </div>

        {order.status !== 'cancelled' && (
          <div className="admin-panel-body">
            <div className="grid grid-4">
              {ORDER_STATUSES.filter((item) => item.value !== 'cancelled').map((item, index) => (
                <div
                  key={item.value}
                  className="spec"
                  style={
                    index <= currentIndex
                      ? { background: 'var(--pink-50)', border: '1px solid var(--pink-200)' }
                      : undefined
                  }
                >
                  <span>Шаг {index + 1}</span>
                  <strong>{item.label}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Игрушка</th>
                <th>Цена</th>
                <th>Кол-во</th>
                <th>Итого</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="row">
                      <img className="thumb" src={imageUrl(item.product?.image)} alt="" />
                      {item.product?.slug ? (
                        <Link to={`/product/${item.product.slug}`} style={{ fontWeight: 700 }}>
                          {item.product.name}
                        </Link>
                      ) : (
                        <span>Товар удалён</span>
                      )}
                    </div>
                  </td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-panel-body">
          <div className="grid grid-2">
            <div>
              <h3 style={{ fontSize: '1rem' }}>Доставка</h3>
              <p className="muted small mb-0">
                {order.address}
                <br />
                {order.phone}
                <br />
                {order.customer_name}
              </p>
              {order.comment && <p className="muted small">Комментарий: {order.comment}</p>}
            </div>
            <div>
              <div className="summary-row">
                <span>Товары</span>
                <span>{formatPrice(order.total_price)}</span>
              </div>
              <div className="summary-total">
                <span>Итого</span>
                <span>{formatPrice(order.total_price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link to="/account/orders" className="btn btn-outline btn-sm">
        ← Ко всем заказам
      </Link>
    </div>
  )
}
