import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client.js'
import Rating, { RatingInput } from '../components/Rating.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { IconCart, IconCheck, IconGift, IconShield, IconTruck } from '../components/Icons.jsx'
import { formatDate, formatPrice, imageUrl, plural } from '../utils/format.js'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { add } = useCart()
  const toast = useToast()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [canReview, setCanReview] = useState(false)
  const [reviewed, setReviewed] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get(`/api/products/${slug}`)
      .then((data) => {
        setProduct(data?.data || null)
        setRelated(data?.related || [])
        setCanReview(Boolean(data?.can_review))
        setReviewed(Boolean(data?.reviewed))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setQuantity(1)
    setNotFound(false)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (loading) {
    return (
      <div className="section container">
        <Loader text="Загружаем игрушку…" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="section container">
        <EmptyState
          emoji="🧸"
          title="Игрушка не найдена"
          text="Возможно, товар был удалён или ссылка устарела."
          actionLabel="В каталог"
          actionTo="/catalog"
        />
      </div>
    )
  }

  const outOfStock = Number(product.stock) <= 0
  const reviews = product.reviews || []

  const addToCart = () => {
    add(product, quantity)
    toast.success(`«${product.name}» — ${plural(quantity, 'штука', 'штуки', 'штук')} в корзине`)
  }

  const buyNow = () => {
    add(product, quantity)
    navigate('/checkout')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setReviewError('')
    if (text.trim().length < 5) {
      setReviewError('Напишите хотя бы пару слов об игрушке')
      return
    }
    setSending(true)
    try {
      await api.post(`/api/products/${product.id}/reviews`, { rating, text: text.trim() })
      toast.success('Спасибо за отзыв!')
      setText('')
      setRating(5)
      load()
    } catch (error) {
      setReviewError(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail">
          <div className="product-gallery">
            <img src={imageUrl(product.image)} alt={product.name} />
          </div>

          <div>
            <span className="eyebrow">{product.category?.name || 'Мягкая игрушка'}</span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)' }}>{product.name}</h1>
            <div className="row wrap">
              <Rating value={product.rating} count={reviews.length} showCount={false} />
              <span className="muted small">
                {reviews.length > 0
                  ? `${Number(product.rating).toFixed(1)} · ${plural(reviews.length, 'отзыв', 'отзыва', 'отзывов')}`
                  : 'Пока нет отзывов'}
              </span>
            </div>

            <div className="row mt-2" style={{ alignItems: 'baseline' }}>
              <span className="price" style={{ fontSize: '2rem' }}>
                {formatPrice(product.price)}
              </span>
              {product.old_price ? (
                <span className="price-old" style={{ fontSize: '1.1rem' }}>
                  {formatPrice(product.old_price)}
                </span>
              ) : null}
            </div>

            <p className="muted mt-2">{product.description}</p>

            <div className="spec-list">
              <div className="spec">
                <span>Размер</span>
                <strong>{product.size || '—'}</strong>
              </div>
              <div className="spec">
                <span>Материал</span>
                <strong>{product.material || '—'}</strong>
              </div>
              <div className="spec">
                <span>На складе</span>
                <strong>{outOfStock ? 'нет' : `${product.stock} шт.`}</strong>
              </div>
              <div className="spec">
                <span>Рейтинг</span>
                <strong>{Number(product.rating || 0).toFixed(1)}</strong>
              </div>
            </div>

            <div className="buy-row">
              <div className="qty">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                  aria-label="Меньше"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.max(product.stock, 1)}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(1, Math.min(Number(event.target.value) || 1, Math.max(product.stock, 1)))
                    )
                  }
                  aria-label="Количество"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(value + 1, Math.max(product.stock, 1)))
                  }
                  disabled={quantity >= product.stock}
                  aria-label="Больше"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={addToCart}
                disabled={outOfStock}
              >
                <IconCart /> {outOfStock ? 'Нет в наличии' : 'В корзину'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={buyNow}
                disabled={outOfStock}
              >
                Купить сразу
              </button>
            </div>

            <div className="chip-row mt-3">
              <span className="chip" style={{ cursor: 'default' }}>
                <IconTruck size={16} /> Доставка 1–3 дня
              </span>
              <span className="chip" style={{ cursor: 'default' }}>
                <IconShield size={16} /> Гипоаллергенно
              </span>
              <span className="chip" style={{ cursor: 'default' }}>
                <IconGift size={16} /> Подарочная упаковка
              </span>
            </div>
          </div>
        </div>

        <section className="section-sm">
          <div className="section-head">
            <div>
              <span className="eyebrow">Отзывы</span>
              <h2>Что говорят покупатели</h2>
            </div>
            {reviews.length > 0 && (
              <div className="row">
                <Rating value={product.rating} showCount={false} />
                <span className="muted small">{plural(reviews.length, 'отзыв', 'отзыва', 'отзывов')}</span>
              </div>
            )}
          </div>

          {user && canReview && !reviewed && (
            <form className="card mt-2" onSubmit={submitReview}>
              <h3>Оставить отзыв</h3>
              {reviewError && <div className="alert alert-error">{reviewError}</div>}
              <div className="field">
                <span className="label">Ваша оценка</span>
                <RatingInput value={rating} onChange={setRating} />
              </div>
              <div className="field">
                <label className="label" htmlFor="review-text">
                  Отзыв
                </label>
                <textarea
                  id="review-text"
                  className="textarea"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Расскажите, понравилась ли игрушка…"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Отправляем…' : 'Опубликовать отзыв'}
              </button>
            </form>
          )}

          {user && reviewed && (
            <div className="alert alert-success">
              <IconCheck size={16} /> Вы уже оставили отзыв об этой игрушке. Спасибо!
            </div>
          )}

          {user && !canReview && !reviewed && (
            <div className="notice mt-2">
              Отзыв можно оставить после покупки этой игрушки — оформите заказ, и форма появится
              здесь.
            </div>
          )}

          {!user && (
            <div className="notice mt-2">
              Чтобы оставить отзыв, <Link to="/login">войдите</Link> или{' '}
              <Link to="/register">зарегистрируйтесь</Link>.
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="notice mt-2">Отзывов пока нет — станьте первым!</div>
          ) : (
            <div className="grid grid-2 mt-2">
              {reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <Rating value={review.rating} showCount={false} />
                  <p>{review.text}</p>
                  <div className="review-card-head" style={{ marginTop: 'auto' }}>
                    <span className="avatar">
                      {(review.user?.name || 'П').charAt(0).toUpperCase()}
                    </span>
                    <span className="review-author">{review.user?.name || 'Покупатель'}</span>
                    <span className="review-date">{formatDate(review.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="section-sm">
            <div className="section-head">
              <div>
                <span className="eyebrow">Похожие</span>
                <h2>Ещё обнимательные варианты</h2>
              </div>
            </div>
            <div className="grid grid-products">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
