import { useEffect, useState } from 'react'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { IconEdit, IconPlus, IconTrash } from '../../components/Icons.jsx'

const EMPTY = { name: '', slug: '', description: '' }

export default function AdminCategories() {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/api/admin/categories')
      .then((data) => setCategories(data?.data || []))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      if (editingId) {
        await api.put(`/api/admin/categories/${editingId}`, form)
        toast.success('Категория обновлена')
      } else {
        await api.post('/api/admin/categories', form)
        toast.success('Категория создана')
      }
      setForm(EMPTY)
      setEditingId(null)
      load()
    } catch (error) {
      if (error.errors) {
        setErrors(
          Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value[0]]))
        )
      } else {
        toast.error(error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const edit = (category) => {
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (category) => {
    if (!window.confirm(`Удалить категорию «${category.name}»?`)) return
    try {
      await api.delete(`/api/admin/categories/${category.id}`)
      toast.success('Категория удалена')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Управление категориями</h1>
          <p className="muted small mb-0">
            Категории связывают игрушки между собой и используются в фильтрах каталога.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>{editingId ? 'Редактировать категорию' : 'Новая категория'}</h2>
          {editingId && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setEditingId(null)
                setForm(EMPTY)
              }}
            >
              Отменить редактирование
            </button>
          )}
        </div>
        <form className="admin-panel-body" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="c-name">
                Название *
              </label>
              <input
                id="c-name"
                className={`input ${errors.name ? 'invalid' : ''}`}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Плюшевые медведи"
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="field">
              <label className="label" htmlFor="c-slug">
                Slug
              </label>
              <input
                id="c-slug"
                className="input"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="bears"
              />
              {errors.slug && <span className="error-text">{errors.slug}</span>}
            </div>
            <div className="field span-2">
              <label className="label" htmlFor="c-desc">
                Описание
              </label>
              <input
                id="c-desc"
                className="input"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Классические мишки из мягкого плюша"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <IconPlus size={17} /> {editingId ? 'Сохранить' : 'Создать категорию'}
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Все категории</h2>
          <span className="muted small">Всего: {categories.length}</span>
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
                  <th>ID</th>
                  <th>Название</th>
                  <th>Slug</th>
                  <th>Товаров</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>
                      <strong>{category.name}</strong>
                      {category.description && (
                        <div className="muted small">{category.description}</div>
                      )}
                    </td>
                    <td>
                      <code>{category.slug}</code>
                    </td>
                    <td>{category.products_count ?? 0}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-soft btn-xs"
                          onClick={() => edit(category)}
                        >
                          <IconEdit size={14} /> Изменить
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-xs"
                          onClick={() => remove(category)}
                        >
                          <IconTrash size={14} /> Удалить
                        </button>
                      </div>
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
