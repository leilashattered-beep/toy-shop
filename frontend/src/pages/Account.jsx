import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, initials } from '../utils/format.js'
import { IconBag, IconChart, IconLogout, IconSettings, IconUser } from '../components/Icons.jsx'

export default function Account() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Личный кабинет</span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>Привет, {user?.name}!</h1>
            <p className="muted small">
              В аккаунте с {formatDate(user?.created_at)} · {user?.email}
            </p>
          </div>
          <div className="row">
            {isAdmin && (
              <button type="button" className="btn btn-blue" onClick={() => navigate('/admin')}>
                <IconChart size={17} /> Админ-панель
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={logout}>
              <IconLogout size={17} /> Выйти
            </button>
          </div>
        </div>

        <div className="account-layout">
          <aside className="account-nav">
            <div className="row" style={{ padding: '6px 10px 12px' }}>
              <span className="avatar" style={{ width: 42, height: 42, fontSize: '1rem' }}>
                {initials(user?.name)}
              </span>
              <div>
                <div style={{ fontWeight: 800 }}>{user?.name}</div>
                <div className="muted small">{user?.role === 'admin' ? 'Администратор' : 'Покупатель'}</div>
              </div>
            </div>
            <NavLink to="/account" end className={({ isActive }) => (isActive ? 'active' : '')}>
              <IconUser size={17} /> Профиль
            </NavLink>
            <NavLink to="/account/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
              <IconBag size={17} /> Мои заказы
            </NavLink>
            <NavLink to="/account/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              <IconSettings size={17} /> Настройки
            </NavLink>
          </aside>

          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
