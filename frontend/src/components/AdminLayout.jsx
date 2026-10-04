import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  IconBag,
  IconBoxes,
  IconChart,
  IconChat,
  IconGrid,
  IconHome,
  IconLogout,
  IconUsers
} from './Icons.jsx'

const LINKS = [
  { to: '/admin', label: 'Статистика', icon: IconChart, end: true },
  { to: '/admin/products', label: 'Товары', icon: IconBoxes },
  { to: '/admin/categories', label: 'Категории', icon: IconGrid },
  { to: '/admin/orders', label: 'Заказы', icon: IconBag },
  { to: '/admin/reviews', label: 'Отзывы', icon: IconChat },
  { to: '/admin/users', label: 'Пользователи', icon: IconUsers }
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="logo">
          <span className="logo-mark">
            <img src="/images/bunny-logo.png" alt="" />
          </span>
          <span>
            Softy
            <small>админ-панель</small>
          </span>
        </Link>

        {LINKS.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{link.label}</span>
            </NavLink>
          )
        })}

        <div className="spacer" />

        <NavLink to="/" className="admin-nav-link">
          <IconHome />
          <span>На сайт</span>
        </NavLink>
        <button type="button" className="admin-nav-link" onClick={logout}>
          <IconLogout />
          <span>Выйти</span>
        </button>
        <div className="admin-panel-body" style={{ padding: '14px 12px 0' }}>
          <div className="small muted">
            Вы вошли как
            <br />
            <strong>{user?.name}</strong>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
