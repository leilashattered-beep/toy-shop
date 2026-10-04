import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import Rating from '../components/Rating.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import {
  IconArrowRight,
  IconGift,
  IconHeart,
  IconPaw,
  IconShield,
  IconSparkles,
  IconTruck
} from '../components/Icons.jsx'
import { formatDate, plural } from '../utils/format.js'

const FEATURES = [
  {
    icon: IconHeart,
    title: 'Ручная работа',
    text: 'Каждую игрушку шьём и набиваем вручную — мягкая, тёплая, долговечная.'
  },
  {
    icon: IconShield,
    title: 'Гипоаллергенно',
    text: 'Плюш, хлопок и холлофайбер. Безопасно для малышей и чувствительной кожи.'
  },
  {
    icon: IconTruck,
    title: 'Доставка по России',
    text: 'Отправляем в день заказа. По Кургану — курьером за 1 день.'
  },
  {
    icon: IconGift,
    title: 'Подарочная упаковка',
    text: 'Крафт-коробка, лента и открытка с вашим текстом — бесплатно.'
  }
]

const CATEGORY_EMOJI = {
  bears: '🧸',
  cats: '🐱',
  capybaras: '🦫',
  bunnies: '🐰',
  foxes: '🦊',
  dinosaurs: '🦕',
  axolotls: '🦎',
  pillows: '🛋️',
  minis: '✨'
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([
      api.get('/api/products', { featured: 1, per_page: 8 }),
      api.get('/api/categories'),
      api.get('/api/reviews/latest', { limit: 6 })
    ])
      .then(([productData, categoryData, reviewData]) => {
        if (!alive) return
        setProducts(productData?.data || [])
        setCategories(categoryData?.data || [])
        setReviews(reviewData?.data || [])
      })
      .catch(() => undefined)
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
      : 4.9

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="reveal">
            <span className="eyebrow">
              <IconSparkles size={15} /> Мастерская мягких игрушек
            </span>
            <h1>
              Подарки, которые <em>хочется обнять</em>
            </h1>
            <p className="hero-lead">
              Плюшевые медведи, капибары, лисы и аксолотли — сшиты вручную из мягкого плюша. Выберите
              того, кто станет лучшим другом.
            </p>
            <div className="hero-cta">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                Смотреть каталог <IconArrowRight />
              </Link>
              <Link to="/categories" className="btn btn-outline btn-lg">
                Категории игрушек
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <strong>{products.length > 0 ? '9+' : '9'}</strong>
                <span>видов игрушек</span>
              </div>
              <div>
                <strong>{averageRating.toFixed(1)}</strong>
                <span>средняя оценка</span>
              </div>
              <div>
                <strong>1–2 дня</strong>
                <span>доставка по России</span>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <img
              className="hero-mascot"
              src="/images/bunny-mascot.png"
              alt="Плюшевый зайчик с сердечком — талисман магазина Softy"
            />            <div className="hero-float-card a">
              <IconPaw size={20} style={{ color: '#e57d9d' }} />
              Мягкий плюш
            </div>
            <div className="hero-float-card b">
              <IconTruck size={20} style={{ color: '#6fa9c9' }} />
              Доставка от 1 дня
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Хиты продаж</span>
              <h2>Популярные игрушки</h2>
              <p>Самые обнимательные модели этого сезона — их выбирают чаще всего.</p>
            </div>
            <Link to="/catalog" className="btn btn-soft">
              Все товары <IconArrowRight />
            </Link>
          </div>

          {loading ? (
            <Loader text="Загружаем игрушки…" />
          ) : products.length === 0 ? (
            <EmptyState
              emoji="🧺"
              title="Товары пока не добавлены"
              text="Загляните позже или добавьте товары в админ-панели."
              actionLabel="В админ-панель"
              actionTo="/admin/products"
            />
          ) : (
            <div className="grid grid-products">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Категории</span>
              <h2>Кого будем обнимать?</h2>
            </div>
          </div>
          <div className="grid grid-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`} className="cat-card">
                <span className="cat-card-emoji">
                  {CATEGORY_EMOJI[category.slug] || '🧸'}
                </span>
                <h3>{category.name}</h3>
                <span className="muted small">
                  {plural(category.products_count ?? 0, 'игрушка', 'игрушки', 'игрушек')}
                </span>
                <span className="row small" style={{ color: 'var(--pink-500)', fontWeight: 700 }}>
                  Смотреть <IconArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Почему Softy</span>
              <h2>Забота в каждой детали</h2>
            </div>
          </div>
          <div className="grid grid-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="feature">
                  <span className="feature-icon">
                    <Icon />
                  </span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section-sm">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Отзывы</span>
                <h2>Покупатели о Softy</h2>
              </div>
              <div className="row">
                <Rating value={averageRating} showCount={false} />
                <span className="muted small">
                  {plural(reviews.length, 'отзыв', 'отзыва', 'отзывов')}
                </span>
              </div>
            </div>
            <div className="grid grid-3">
              {reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <Rating value={review.rating} showCount={false} />
                  <p>«{review.text}»</p>
                  <div className="review-card-head" style={{ marginTop: 'auto' }}>
                    <span className="avatar">
                      {(review.user?.name || 'П').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="review-author">{review.user?.name || 'Покупатель'}</div>
                      {review.product && (
                        <Link
                          to={`/product/${review.product.slug}`}
                          className="small muted"
                          style={{ display: 'block' }}
                        >
                          {review.product.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-sm">
        <div className="container">
          <div className="banner">
            <div>
              <h2>Не знаете, что подарить?</h2>
              <p>
                Напишите нам — подберём игрушку под возраст и повод, упакуем в крафт-коробку и
                отправим открытку с вашим текстом.
              </p>
            </div>
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Выбрать подарок <IconArrowRight />
            </Link>
          </div>
          {reviews[0]?.created_at && (
            <p className="muted small center mt-2">
              Последний отзыв оставлен {formatDate(reviews[0].created_at)}
            </p>
          )}
        </div>
      </section>
    </>
  )
}
