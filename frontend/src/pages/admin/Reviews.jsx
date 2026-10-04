import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client.js'
import Loader from '../../components/Loader.jsx'
import Pagination from '../../components/Pagination.jsx'
import Rating from '../../components/Rating.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { IconTrash } from '../../components/Icons.jsx'
import { formatDateTime } from '../../utils/format.js'

export default function AdminReviews() {
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [rating, setRating] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/api/admin/reviews', { page, per_page: 12, rating })
      .then((data) => {
        setReviews(data?.data || [])
        setMeta(data?.meta || null)
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rating])

  useEffect(load, [load])

  const remove = async (review) => {
    if (!window.confirm('Удалить этот отзыв?')) return
    try {
      await api.delete(`/api/admin/reviews/${review.id}`)
      toast.success('Отзыв удалён')
      load()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
      : 0

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Отзывы покупателей</h1>
          <p className="muted small mb-0">
            Всего отзывов: {meta?.total ?? 0}
            {reviews.length > 0 && ` · средняя оценка на странице ${average.toFixed(1)}`}
          </p>
        </div>
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${rating === '' ? 'active' : ''}`}
            onClick={() => {
              setPage(1)
              setRating('')
            }}
          >
            Все оценки
          </button>
          {[5, 4, 3, 2, 1].map((value) => (
            <button
              key={value}
              type="button"
              className={`chip ${Number(rating) === value ? 'active' : ''}`}
              onClick={() => {
                setPage(1)
                setRating(value)
              }}
            >
              {value} ★
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-panel">
          <div className="admin-panel-body">
            <Loader />
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-panel">
          <div className="admin-panel-body">
            <p className="muted mb-0">Отзывов пока нет.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-panel">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Автор</th>
                    <th>Товар</th>
                    <th>Оценка</th>
                    <th>Отзыв</th>
                    <th>Дата</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{review.user?.name || 'Покупатель'}</div>
                        <div className="muted small">{review.user?.email}</div>
                      </td>
                      <td>
                        {review.product?.slug ? (
                          <Link to={`/product/${review.product.slug}`}>
                            {review.product.name}
                          </Link>
                        ) : (
                          <span className="muted">товар удалён</span>
                        )}
                      </td>
                      <td>
                        <Rating value={review.rating} showCount={false} />
                      </td>
                      <td style={{ maxWidth: 340 }}>{review.text}</td>
                      <td className="muted small">{formatDateTime(review.created_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-xs"
                          onClick={() => remove(review)}
                        >
                          <IconTrash size={14} /> Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={meta?.current_page || 1}
            lastPage={meta?.last_page || 1}
            onChange={setPage}
          />
        </>
      )}
    </>
  )
}
