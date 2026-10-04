import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { formatPrice, imageUrl } from '../../utils/format.js'

const EMPTY = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  price: '',
  old_price: '',
  size: '25 см',
  material: 'Плюш, холлофайбер',
  stock: 10,
  image: '',
  is_featured: false
}

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)

  useEffect(() => {
    api
      .get('/api/categories')
      .then((data) => {
        const list = data?.data || []
        setCategories(list)
        setForm((current) => ({
          ...current,
          category_id: current.category_id || list[0]?.id || ''
        }))
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!isEdit) {
      setForm((current) => ({ ...current, category_id: current.category_id || '' }))
      return
    }
    api
      .get(`/api/admin/products/${id}`)
      .then((data) => {
        const product = data?.data
        if (!product) return
        setForm({
          name: product.name || '',
          slug: product.slug || '',
          category_id: product.category_id || '',
          description: product.description || '',
          price: product.price ?? '',
          old_price: product.old_price ?? '',
          size: product.size || '',
          material: product.material || '',
          stock: product.stock ?? 0,
          image: product.image || '',
          is_featured: Boolean(product.is_featured)
        })
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  const preview = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return form.image ? imageUrl(form.image) : '/images/products/placeholder.svg'
  }, [file, form.image])

  const change = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
        old_price: form.old_price === '' ? null : Number(form.old_price),
        stock: Number(form.stock)
      }
      const response = isEdit
        ? await api.put(`/api/admin/products/${id}`, payload)
        : await api.post('/api/admin/products', payload)

      const product = response?.data
      if (file && product?.id) {
        const formData = new FormData()
        formData.append('image', file)
        await api.upload(`/api/admin/products/${product.id}/image`, formData)
      }

      toast.success(isEdit ? 'Товар обновлён' : 'Товар добавлен в каталог')
      navigate('/admin/products')
    } catch (error) {
      if (error.errors) {
        setErrors(
          Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value[0]]))
        )
        toast.error('Проверьте поля формы')
      } else {
        toast.error(error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>{isEdit ? 'Редактирование товара' : 'Новый товар'}</h1>
          <p className="muted small mb-0">
            Заполните карточку — изменения сразу появятся в каталоге.
          </p>
        </div>
        <Link to="/admin/products" className="btn btn-outline">
          ← К списку товаров
        </Link>
      </div>

      <form onSubmit={submit}>
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Основное</h2>
          </div>
          <div className="admin-panel-body">
            <div className="form-grid">
              <div className="field span-2">
                <label className="label" htmlFor="f-name">
                  Название *
                </label>
                <input
                  id="f-name"
                  className={`input ${errors.name ? 'invalid' : ''}`}
                  value={form.name}
                  onChange={change('name')}
                  placeholder="Плюшевый медведь Бублик"
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-slug">
                  Ссылка (slug)
                </label>
                <input
                  id="f-slug"
                  className="input"
                  value={form.slug}
                  onChange={change('slug')}
                  placeholder="заполнится автоматически"
                />
                {errors.slug && <span className="error-text">{errors.slug}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-cat">
                  Категория *
                </label>
                <select
                  id="f-cat"
                  className="select"
                  value={form.category_id}
                  onChange={change('category_id')}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <span className="error-text">{errors.category_id}</span>}
              </div>

              <div className="field span-2">
                <label className="label" htmlFor="f-desc">
                  Описание *
                </label>
                <textarea
                  id="f-desc"
                  className={`textarea ${errors.description ? 'invalid' : ''}`}
                  value={form.description}
                  onChange={change('description')}
                  placeholder="Расскажите о характере игрушки, кому подойдёт…"
                  required
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-price">
                  Цена, ₽ *
                </label>
                <input
                  id="f-price"
                  type="number"
                  min="0"
                  step="1"
                  className={`input ${errors.price ? 'invalid' : ''}`}
                  value={form.price}
                  onChange={change('price')}
                  required
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-old">
                  Старая цена, ₽
                </label>
                <input
                  id="f-old"
                  type="number"
                  min="0"
                  className="input"
                  value={form.old_price}
                  onChange={change('old_price')}
                  placeholder="для отображения скидки"
                />
                {errors.old_price && <span className="error-text">{errors.old_price}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-stock">
                  Количество на складе *
                </label>
                <input
                  id="f-stock"
                  type="number"
                  min="0"
                  className={`input ${errors.stock ? 'invalid' : ''}`}
                  value={form.stock}
                  onChange={change('stock')}
                  required
                />
                {errors.stock && <span className="error-text">{errors.stock}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="f-size">
                  Размер
                </label>
                <input
                  id="f-size"
                  className="input"
                  value={form.size}
                  onChange={change('size')}
                  placeholder="30 см"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="f-material">
                  Материал
                </label>
                <input
                  id="f-material"
                  className="input"
                  value={form.material}
                  onChange={change('material')}
                  placeholder="Плюш, холлофайбер"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="f-featured">
                  Популярный товар
                </label>
                <label className="row small" style={{ cursor: 'pointer' }}>
                  <input
                    id="f-featured"
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={change('is_featured')}
                  />
                  Показывать на главной в блоке «Популярные игрушки»
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Фотография</h2>
          </div>
          <div className="admin-panel-body">
            <div className="row wrap" style={{ alignItems: 'flex-start', gap: 24 }}>
              <img
                src={preview}
                alt="Превью"
                style={{
                  width: 200,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 22,
                  border: '1px solid var(--line)',
                  background: 'var(--pink-50)'
                }}
              />
              <div className="grow" style={{ minWidth: 260 }}>
                <div className="field">
                  <label className="label" htmlFor="f-image">
                    Путь к файлу или ссылка
                  </label>
                  <input
                    id="f-image"
                    className="input"
                    value={form.image}
                    onChange={change('image')}
                    placeholder="/images/products/bear.svg"
                  />
                  <span className="hint-text">
                    Можно указать готовый файл из backend/public/images/products или внешний URL.
                  </span>
                </div>

                <div className="field">
                  <label className="label" htmlFor="f-file">
                    Загрузить новый файл (jpg, png, webp, svg — до 4 МБ)
                  </label>
                  <input
                    id="f-file"
                    type="file"
                    accept="image/*"
                    className="input"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                  />
                  <span className="hint-text">
                    Файл сохранится в public/uploads/products и станет основным изображением.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Сохраняем…' : isEdit ? 'Сохранить изменения' : 'Добавить товар'}
          </button>
          <Link to="/admin/products" className="btn btn-ghost">
            Отмена
          </Link>
          {form.price ? (
            <span className="muted small">Цена в каталоге: {formatPrice(form.price)}</span>
          ) : null}
        </div>
      </form>
    </>
  )
}
