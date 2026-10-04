import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import Pagination from '../components/Pagination.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setPage(1)
    api
      .get(`/api/categories/${slug}`)
      .then((data) => setCategory(data?.data || null))
      .catch(() => setNotFound(true))
  }, [slug])

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get('/api/products', { category: slug, page, per_page: 12 })
      .then((data) => {
        if (!alive) return
        setProducts(data?.data || [])
        setMeta(data?.meta || null)
      })
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [slug, page])

  if (notFound) {
    return (
      <div className="section container">
        <EmptyState
          emoji="🧭"
          title="Категория не найдена"
          text="Возможно, она была удалена."
          actionLabel="В каталог"
          actionTo="/catalog"
        />
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          <span>/</span>
          <span>{category?.name || slug}</span>
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">Категория</span>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>
              {category?.name || 'Загрузка…'}
            </h1>
            <p>{category?.description || 'Мягкие игрушки этой категории.'}</p>
          </div>
          <Link to="/catalog" className="btn btn-outline">
            Весь каталог
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <EmptyState
            emoji="🧺"
            title="В этой категории пока пусто"
            text="Скоро добавим новые игрушки."
            actionLabel="Смотреть все игрушки"
            actionTo="/catalog"
          />
        ) : (
          <>
            <div className="grid grid-products">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination
              page={meta?.current_page || 1}
              lastPage={meta?.last_page || 1}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
