import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { IconLock, IconMail } from '../components/Icons.jsx'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const redirectTo = location.state?.from || '/account'

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')
    try {
      const user = await login(form)
      toast.success(`С возвращением, ${user.name}!`)
      navigate(user.role === 'admin' && redirectTo === '/account' ? '/admin' : redirectTo, {
        replace: true
      })
    } catch (error) {
      if (error.errors && Object.keys(error.errors).length > 0) {
        setErrors(
          Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value[0]]))
        )
      } else {
        setMessage(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    setForm(
      role === 'admin'
        ? { email: 'admin@softy.local', password: 'password' }
        : { email: 'buyer@softy.local', password: 'password' }
    )
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Вход</span>
        <h1 style={{ fontSize: '1.7rem' }}>Рады видеть снова!</h1>
        <p className="muted small">Войдите, чтобы оформлять заказы и оставлять отзывы.</p>

        {message && <div className="alert alert-error">{message}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label className="label" htmlFor="email">
              <IconMail size={14} /> Email
            </label>
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? 'invalid' : ''}`}
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="mail@example.com"
              autoComplete="email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              <IconLock size={14} /> Пароль
            </label>
            <input
              id="password"
              type="password"
              className={`input ${errors.password ? 'invalid' : ''}`}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className="center mt-2 small muted">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>

        <div className="auth-demo">
          <strong>Демо-доступы</strong>
          <div className="row wrap mt-1">
            <button type="button" className="btn btn-soft btn-xs" onClick={() => fillDemo('admin')}>
              Администратор
            </button>
            <button type="button" className="btn btn-blue btn-xs" onClick={() => fillDemo('buyer')}>
              Покупатель
            </button>
          </div>
          <div className="mt-1">
            admin@softy.local / password — админ-панель
            <br />
            buyer@softy.local / password — покупатель
          </div>
        </div>
      </div>
    </div>
  )
}
