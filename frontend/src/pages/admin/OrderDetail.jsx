import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import {
  ORDER_STATUSES,
  formatDateTime,
  formatPrice,
  imageUrl,
  statusInfo
} from '../../utils/format.js'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get(`/api/admin/orders/${id}`)
      .then((data) => {
        setOrder(data?.data || null)
        setStatus(data?.data?.status || 'new')
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status })
      toast.success('Статус заказа обновлён')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <Loader />
  if (!order) return <div className="alert alert-error">Заказ не найден</div>

  const info = statusInfo(order.status)

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Заказ #{order.id}</h1>
          <p className="muted small mb-0">Оформлен {formatDateTime(order.created_at)}</p>
        </div>
        <div className="row">
          <span className={`status-pill ${info.className}`}>{info.label}</span>
          <Link to="/admin/orders" className="btn btn-outline">
            ← Все заказы
          </Link>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Смена статуса</h2>
        </div>
        <div className="admin-panel-body row wrap">
          <select
            className="select"
            style={{ maxWidth: 260 }}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {ORDER_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={save}>
            Сохранить статус
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Покупатель</h2>
          </div>
          <div className="admin-panel-body">
            <p className="mb-0">
              <strong>{order.user?.name || order.customer_name}</strong>
              <br />
              <span className="muted small">{order.user?.email || 'гость'}</span>
              <br />
              <span className="muted small">{order.phone}</span>
            </p>
            <div className="divider" />
            <p className="muted small mb-0">
              <strong>Адрес доставки:</strong>
              <br />
              {order.address}
            </p>
            {order.comment && (
              <p className="muted small">Комментарий: {order.comment}</p>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Оплата</h2>
          </div>
          <div className="admin-panel-body">
            <div className="summary-row">
              <span>Позиций</span>
              <span>{order.items?.length || 0}</span>
            </div>
            <div className="summary-row">
              <span>Сумма заказа</span>
              <span>{formatPrice(order.total_price)}</span>
            </div>
            <div className="summary-total">
              <span>Итого</span>
              <span>{formatPrice(order.total_price)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Состав заказа</h2>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Игрушка</th>
                <th>Цена в заказе</th>
                <th>Кол-во</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="row">
                      <img className="thumb" src={imageUrl(item.product?.image)} alt="" />
                      <div>
                        {item.product?.slug ? (
                          <Link to={`/product/${item.product.slug}`} style={{ fontWeight: 700 }}>
                            {item.product.name}
                          </Link>
                        ) : (
                          <span>Товар удалён</span>
                        )}
                        <div className="muted small">
                          Остаток сейчас: {item.product?.stock ?? '—'} шт.
                        </div>
                      </div>
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
      </div>
    </>
  )
}
