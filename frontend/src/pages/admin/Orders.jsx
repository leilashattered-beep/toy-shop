import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import Pagination from '../../components/Pagination.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { ORDER_STATUSES, formatDateTime, formatPrice, statusInfo } from '../../utils/format.js'

export default function AdminOrders() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/api/admin/orders', { status, search: query, page, per_page: 10 })
      .then((data) => {
        setOrders(data?.data || [])
        setMeta(data?.meta || null)
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, query, page])

  useEffect(load, [load])

  const changeStatus = async (order, nextStatus) => {
    try {
      await api.patch(`/api/admin/orders/${order.id}/status`, { status: nextStatus })
      toast.success(`Заказ #${order.id}: статус обновлён`)
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const remove = async (order) => {
    if (!window.confirm(`Удалить заказ #${order.id} вместе с позициями?`)) return
    try {
      await api.delete(`/api/admin/orders/${order.id}`)
      toast.success('Заказ удалён')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Управление заказами</h1>
          <p className="muted small mb-0">
            Меняйте статусы, смотрите состав заказа и данные доставки.
          </p>
        </div>
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${status === '' ? 'active' : ''}`}
            onClick={() => {
              setPage(1)
              setStatus('')
            }}
          >
            Все
          </button>
          {ORDER_STATUSES.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`chip ${status === item.value ? 'active' : ''}`}
              onClick={() => {
                setPage(1)
                setStatus(item.value)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <form
            className="search-inline"
            style={{ maxWidth: 340 }}
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
              setQuery(search.trim())
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Номер заказа, имя, телефон"
              aria-label="Поиск заказов"
            />
            <button type="submit" aria-label="Искать">
              Поиск
            </button>
          </form>
          <span className="muted small">Всего: {meta?.total ?? 0} заказов</span>
        </div>

        {loading ? (
          <div className="admin-panel-body">
            <Loader />
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Покупатель</th>
                  <th>Дата</th>
                  <th>Состав</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Изменить статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const info = statusInfo(order.status)
                  return (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} style={{ fontWeight: 800 }}>
                          #{order.id}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {order.user?.name || order.customer_name}
                        </div>
                        <div className="muted small">{order.phone}</div>
                      </td>
                      <td>{formatDateTime(order.created_at)}</td>
                      <td>{order.items_count ?? order.items?.length ?? 0} поз.</td>
                      <td>
                        <strong>{formatPrice(order.total_price)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${info.className}`}>{info.label}</span>
                      </td>
                      <td>
                        <select
                          className="select"
                          style={{ minWidth: 150 }}
                          value={order.status}
                          onChange={(event) => changeStatus(order, event.target.value)}
                        >
                          {ORDER_STATUSES.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/admin/orders/${order.id}`} className="btn btn-soft btn-xs">
                            Детали
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => remove(order)}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-panel-body" style={{ paddingTop: 0 }}>
          <Pagination
            page={meta?.current_page || 1}
            lastPage={meta?.last_page || 1}
            onChange={setPage}
          />
        </div>
      </div>
    </>
  )
}
