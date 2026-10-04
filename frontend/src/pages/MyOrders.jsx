import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { ORDER_STATUSES, formatDateTime, formatPrice, plural, statusInfo } from '../utils/format.js'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get('/api/orders', status ? { status } : undefined)
      .then((data) => setOrders(data?.data || []))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="stack">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Мои заказы</h2>
          <div className="chip-row">
            <button
              type="button"
              className={`chip ${status === '' ? 'active' : ''}`}
              onClick={() => setStatus('')}
            >
              Все
            </button>
            {ORDER_STATUSES.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`chip ${status === item.value ? 'active' : ''}`}
                onClick={() => setStatus(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-panel-body">
            <Loader />
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-panel-body">
            <EmptyState
              emoji="📦"
              title="Здесь пока пусто"
              text={
                status
                  ? 'Нет заказов с таким статусом.'
                  : 'Оформите первый заказ — статус появится здесь.'
              }
              actionLabel="В каталог"
              actionTo="/catalog"
            />
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Заказ</th>
                  <th>Дата</th>
                  <th>Состав</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const info = statusInfo(order.status)
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>{formatDateTime(order.created_at)}</td>
                      <td>
                        {(order.items || [])
                          .slice(0, 2)
                          .map((item) => item.product?.name || 'товар')
                          .join(', ')}
                        {(order.items?.length || 0) > 2 && '…'}
                      </td>
                      <td>
                        <strong>{formatPrice(order.total_price)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${info.className}`}>{info.label}</span>
                      </td>
                      <td>
                        <Link to={`/account/orders/${order.id}`} className="btn btn-soft btn-xs">
                          Детали
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

      <div className="notice">
        Всего заказов: {plural(orders.length, 'заказ', 'заказа', 'заказов')}. Статус обновляет
        менеджер магазина — изменения видны здесь сразу.
      </div>
    </div>
  )
}
