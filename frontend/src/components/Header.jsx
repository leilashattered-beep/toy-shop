import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { initials } from '../utils/format.js'
import {
  IconBag,
  IconCart,
  IconChart,
  IconClose,
  IconLogout,
  IconMenu,
  IconSearch,
  IconUser,
  IconBoxes
} from './Icons.jsx'

const NAV = [
  { to: '/', label: 'Главная', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/categories', label: 'Категории' },
  { to: '/about', label: 'О магазине' }
]

export default function Header() {
  const { user, isAdmin, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setQuery(params.get('search') || '')
    setMenuOpen(false)
    setUserOpen(false)
  }, [location])

  useEffect(() => {
    const onClick = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submitSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/catalog?search=${encodeURIComponent(value)}` : '/catalog')
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="Softy — на главную">
          <span className="logo-mark">
            <img src="/images/bunny-logo.png" alt="" />
          </span>
          <span>
            Softy
            <small>мягкие игрушки</small>
          </span>
        </Link>

        <nav className="nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form className="search-inline" onSubmit={submitSearch} role="search">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти игрушку: медведь, лиса…"
            aria-label="Поиск товаров"
          />
          <button type="submit" aria-label="Искать">
            <IconSearch size={17} />
          </button>
        </form>

        <div className="header-actions">
          <Link to="/cart" className="btn btn-outline btn-icon cart-btn" aria-label="Корзина">
            <IconCart />
            {count > 0 && <span className="badge-count">{count}</span>}
          </Link>

          {user ? (
            <div className="dropdown" ref={userRef}>
              <button
                type="button"
                className="user-chip"
                onClick={() => setUserOpen((open) => !open)}
              >
                <span className="avatar">{initials(user.name)}</span>
                <span>{user.name.split(' ')[0]}</span>
              </button>
              {userOpen && (
                <div className="dropdown-menu">
                  <Link to="/account">
                    <IconUser size={17} /> Личный кабинет
                  </Link>
                  <Link to="/account/orders">
                    <IconBag size={17} /> Мои заказы
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="divider" />
                      <Link to="/admin">
                        <IconChart size={17} /> Админ-панель
                      </Link>
                      <Link to="/admin/products">
                        <IconBoxes size={17} /> Управление товарами
                      </Link>
                    </>
                  )}
                  <div className="divider" />
                  <button type="button" onClick={logout}>
                    <IconLogout size={17} /> Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Войти
            </Link>
          )}

          <button
            type="button"
            className="burger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Меню"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <div className="container">
          <form className="search-inline" onSubmit={submitSearch} role="search">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск игрушек…"
              aria-label="Поиск товаров"
            />
            <button type="submit" aria-label="Искать">
              <IconSearch size={17} />
            </button>
          </form>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/cart" className="nav-link">
            Корзина {count > 0 ? `(${count})` : ''}
          </NavLink>
          {!user && (
            <>
              <NavLink to="/login" className="nav-link">
                Вход
              </NavLink>
              <NavLink to="/register" className="nav-link">
                Регистрация
              </NavLink>
            </>
          )}
          {user && (
            <NavLink to="/account" className="nav-link">
              Личный кабинет
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
