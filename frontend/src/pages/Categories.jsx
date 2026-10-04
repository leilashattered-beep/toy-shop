import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import Loader from '../components/Loader.jsx'
import { IconArrowRight } from '../components/Icons.jsx'
import { plural } from '../utils/format.js'

const EMOJI = {
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

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/api/categories')
      .then((data) => setCategories(data?.data || []))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Категории</span>
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">Категории</span>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>Кого будем обнимать?</h1>
            <p>Выберите категорию, чтобы увидеть все игрушки внутри.</p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-3">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`} className="cat-card">
                <span className="cat-card-emoji">{EMOJI[category.slug] || '🧸'}</span>
                <h3>{category.name}</h3>
                <p className="muted small mb-0">
                  {category.description ||
                    `${plural(category.products_count ?? 0, 'игрушка', 'игрушки', 'игрушек')} в наличии`}
                </p>
                <span
                  className="row small mt-1"
                  style={{ color: 'var(--pink-500)', fontWeight: 700 }}
                >
                  Смотреть игрушки <IconArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
