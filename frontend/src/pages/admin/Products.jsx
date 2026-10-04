import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import Pagination from '../../components/Pagination.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '../../components/Icons.jsx'
import { formatPrice, imageUrl } from '../../utils/format.js'

export default function AdminProducts() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/api/admin/products', { search: query, category, page, per_page: 10 })
      .then((data) => {
        setProducts(data?.data || [])
        setMeta(data?.meta || null)
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, page])

  useEffect(load, [load])

  useEffect(() => {
    api
      .get('/api/categories')
      .then((data) => setCategories(data?.data || []))
      .catch(() => undefined)
  }, [])

  const remove = async (product) => {
    if (!window.confirm(`Удалить товар «${product.name}»? Действие необратимо.`)) return
    try {
      await api.delete(`/api/admin/products/${product.id}`)
      toast.success('Товар удалён')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const saveQuick = async (event) => {
    event.preventDefault()
    try {
      await api.put(`/api/admin/products/${editing.id}`, {
        name: editing.name,
        category_id: editing.category_id,
        price: editing.price,
        stock: editing.stock
      })
      toast.success('Изменения сохранены')
      setEditing(null)
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Управление товарами</h1>
          <p className="muted small mb-0">
            Добавляйте игрушки, меняйте цены, описания и остатки на складе.
          </p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <IconPlus size={17} /> Добавить товар
        </Link>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <form
            className="row wrap"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
              setQuery(search.trim())
            }}
          >
            <div className="search-inline" style={{ maxWidth: 320 }}>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по названию"
                aria-label="Поиск товаров"
              />
              <button type="submit" aria-label="Искать">
                <IconSearch size={17} />
              </button>
            </div>
            <select
              className="select"
              style={{ width: 'auto' }}
              value={category}
              onChange={(event) => {
                setPage(1)
                setCategory(event.target.value)
              }}
            >
              <option value="">Все категории</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </form>
          <span className="muted small">
            Всего: {meta?.total ?? 0} товаров
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
                  <th>Товар</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Склад</th>
                  <th>Рейтинг</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="row">
                        <img className="thumb" src={imageUrl(product.image)} alt="" />
                        <div>
                          <div style={{ fontWeight: 700 }}>{product.name}</div>
                          <div className="muted small">
                            {product.size || '—'} · {product.material || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name || '—'}</td>
                    <td>
                      <strong>{formatPrice(product.price)}</strong>
                      {product.old_price ? (
                        <div className="muted small">
                          <s>{formatPrice(product.old_price)}</s>
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          Number(product.stock) > 3
                            ? 'status-completed'
                            : Number(product.stock) > 0
                              ? 'status-processing'
                              : 'status-cancelled'
                        }`}
                      >
                        {product.stock} шт.
                      </span>
                    </td>
                    <td>{Number(product.rating || 0).toFixed(1)}</td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/product/${product.slug}`}
                          className="btn btn-outline btn-xs"
                          target="_blank"
                        >
                          Открыть
                        </Link>
                        <button
                          type="button"
                          className="btn btn-soft btn-xs"
                          onClick={() => setEditing({ ...product })}
                        >
                          <IconEdit size={14} /> Цена/склад
                        </button>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="btn btn-blue btn-xs"
                        >
                          Изменить
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-xs"
                          onClick={() => remove(product)}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={saveQuick}>
            <h3>Быстрое редактирование</h3>
            <p className="muted small">{editing.name}</p>

            <div className="field">
              <label className="label" htmlFor="q-name">
                Название
              </label>
              <input
                id="q-name"
                className="input"
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="q-cat">
                Категория
              </label>
              <select
                id="q-cat"
                className="select"
                value={editing.category_id || ''}
                onChange={(event) =>
                  setEditing({ ...editing, category_id: Number(event.target.value) })
                }
                required
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="field grow">
                <label className="label" htmlFor="q-price">
                  Цена, ₽
                </label>
                <input
                  id="q-price"
                  type="number"
                  min="0"
                  className="input"
                  value={editing.price}
                  onChange={(event) => setEditing({ ...editing, price: event.target.value })}
                  required
                />
              </div>
              <div className="field grow">
                <label className="label" htmlFor="q-stock">
                  На складе, шт.
                </label>
                <input
                  id="q-stock"
                  type="number"
                  min="0"
                  className="input"
                  value={editing.stock}
                  onChange={(event) => setEditing({ ...editing, stock: event.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row">
              <button type="submit" className="btn btn-primary">
                Сохранить
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
