import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDate, initials, plural } from '../../utils/format.js'

export default function AdminUsers() {
  const toast = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('/api/admin/users', query ? { search: query } : undefined)
      .then((data) => setUsers(data?.data || []))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  const changeRole = async (user, role) => {
    try {
      await api.patch(`/api/admin/users/${user.id}/role`, { role })
      toast.success(`Роль пользователя ${user.name} обновлена`)
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const remove = async (user) => {
    if (!window.confirm(`Удалить пользователя ${user.name}? Его заказы и отзывы тоже будут удалены.`))
      return
    try {
      await api.delete(`/api/admin/users/${user.id}`)
      toast.success('Пользователь удалён')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Пользователи</h1>
          <p className="muted small mb-0">
            Покупатели и администраторы магазина. Всего: {users.length}
          </p>
        </div>
        <form
          className="search-inline"
          style={{ maxWidth: 320 }}
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(search.trim())
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Имя или email"
            aria-label="Поиск пользователей"
          />
          <button type="submit" aria-label="Искать">
            Найти
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Список пользователей</h2>
          <span className="muted small">
            {plural(users.length, 'человек', 'человека', 'человек')} найдено
          </span>
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
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Регистрация</th>
                  <th>Заказы</th>
                  <th>Роль</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="row">
                        <span className="avatar">{initials(user.name)}</span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{user.name}</div>
                          {user.id === currentUser?.id && (
                            <div className="muted small">это вы</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>{user.orders_count ?? 0}</td>
                    <td>
                      <select
                        className="select"
                        style={{ minWidth: 140 }}
                        value={user.role}
                        onChange={(event) => changeRole(user, event.target.value)}
                        disabled={user.id === currentUser?.id}
                      >
                        <option value="user">Покупатель</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-xs"
                        onClick={() => remove(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
