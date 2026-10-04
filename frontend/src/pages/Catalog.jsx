import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import Pagination from '../components/Pagination.jsx'
import Loader from '../components/Loader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { IconFilter, IconSearch, IconClose } from '../components/Icons.jsx'
import { plural } from '../utils/format.js'

const SORTS = [
  { value: 'popular', label: 'Популярные' },
  { value: 'new', label: 'Новинки' },
  { value: 'price_asc', label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'name', label: 'По названию' }
]

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ sizes: [], price: { min: 0, max: 10000 } })
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'popular'
  const size = searchParams.get('size') || ''
  const inStock = searchParams.get('in_stock') === '1'
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const page = Number(searchParams.get('page') || 1)
  const [searchInput, setSearchInput] = useState(search)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    api.get('/api/categories').then((data) => setCategories(data?.data || [])).catch(() => undefined)
    api.get('/api/products/filters').then((data) => setFilters(data || {})).catch(() => undefined)
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get('/api/products', {
        search,
        category,
        sort,
        size,
        in_stock: inStock ? 1 : '',
        min_price: minPrice,
        max_price: maxPrice,
        page,
        per_page: 12
      })
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
  }, [search, category, sort, size, inStock, minPrice, maxPrice, page])

  const update = useCallback(
    (changes, resetPage = true) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(changes).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined || value === false) next.delete(key)
        else next.set(key, value)
      })
      if (resetPage) next.delete('page')
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  const activeCategory = useMemo(
    () => categories.find((item) => item.slug === category),
    [categories, category]
  )

  const hasFilters = Boolean(search || category || size || inStock || minPrice || maxPrice)

  const submitSearch = (event) => {
    event.preventDefault()
    update({ search: searchInput.trim() })
  }

  const resetAll = () => setSearchParams(new URLSearchParams())

  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Каталог</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span>{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">Каталог</span>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>
              {activeCategory ? activeCategory.name : 'Все мягкие игрушки'}
            </h1>
            <p>
              {meta
                ? `${plural(meta.total, 'игрушка', 'игрушки', 'игрушек')} в наличии`
                : 'Подбираем игрушки…'}
            </p>
          </div>
          <div className="row wrap">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setFiltersOpen((open) => !open)}
              style={{ display: 'none' }}
              data-mobile-filters
            >
              <IconFilter /> Фильтры
            </button>
            <label className="row small">
              <span className="muted">Сортировка</span>
              <select
                className="select"
                style={{ width: 'auto', padding: '10px 40px 10px 14px' }}
                value={sort}
                onChange={(event) => update({ sort: event.target.value })}
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className="filters" style={filtersOpen ? { display: 'block' } : undefined}>
            <form className="search-inline" onSubmit={submitSearch} style={{ maxWidth: 'none' }}>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Поиск по каталогу"
                aria-label="Поиск по каталогу"
              />
              <button type="submit" aria-label="Искать">
                <IconSearch size={17} />
              </button>
            </form>

            <h3>Категории</h3>
            <div className="filter-list">
              <button
                type="button"
                className={!category ? 'active' : ''}
                onClick={() => update({ category: '' })}
              >
                Все игрушки
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={category === item.slug ? 'active' : ''}
                  onClick={() => update({ category: item.slug })}
                >
                  {item.name} <span>{item.products_count ?? 0}</span>
                </button>
              ))}
            </div>

            <h3>Цена, ₽</h3>
            <div className="row">
              <input
                className="input"
                type="number"
                min="0"
                placeholder={String(filters.price?.min ?? 0)}
                defaultValue={minPrice}
                onBlur={(event) => update({ min_price: event.target.value })}
                aria-label="Минимальная цена"
              />
              <span className="muted">—</span>
              <input
                className="input"
                type="number"
                min="0"
                placeholder={String(filters.price?.max ?? 0)}
                defaultValue={maxPrice}
                onBlur={(event) => update({ max_price: event.target.value })}
                aria-label="Максимальная цена"
              />
            </div>

            {filters.sizes?.length > 0 && (
              <>
                <h3>Размер</h3>
                <div className="chip-row">
                  {filters.sizes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`chip ${size === item ? 'active' : ''}`}
                      onClick={() => update({ size: size === item ? '' : item })}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}

            <h3>Наличие</h3>
            <label className="row small" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => update({ in_stock: event.target.checked ? 1 : '' })}
              />
              Только в наличии
            </label>

            {hasFilters && (
              <button type="button" className="btn btn-ghost btn-sm btn-block mt-2" onClick={resetAll}>
                <IconClose size={15} /> Сбросить фильтры
              </button>
            )}
          </aside>

          <div>
            {loading ? (
              <Loader text="Загружаем товары…" />
            ) : products.length === 0 ? (
              <EmptyState
                emoji="🔍"
                title="Ничего не нашлось"
                text="Попробуйте изменить фильтры или поисковый запрос."
                actionLabel="Сбросить фильтры"
                onAction={resetAll}
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
                  onChange={(next) => update({ page: next }, false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
