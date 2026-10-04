import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')
    try {
      const user = await register(form)
      toast.success(`Добро пожаловать в Softy, ${user.name}!`)
      navigate('/account', { replace: true })
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

  const change = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Регистрация</span>
        <h1 style={{ fontSize: '1.7rem' }}>Создайте аккаунт Softy</h1>
        <p className="muted small">
          Личный кабинет хранит историю заказов, адреса и ваши отзывы.
        </p>

        {message && <div className="alert alert-error">{message}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label className="label" htmlFor="name">
              Имя
            </label>
            <input
              id="name"
              className={`input ${errors.name ? 'invalid' : ''}`}
              value={form.name}
              onChange={change('name')}
              placeholder="Анна"
              autoComplete="name"
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? 'invalid' : ''}`}
              value={form.email}
              onChange={change('email')}
              placeholder="mail@example.com"
              autoComplete="email"
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="phone">
              Телефон (необязательно)
            </label>
            <input
              id="phone"
              className={`input ${errors.phone ? 'invalid' : ''}`}
              value={form.phone}
              onChange={change('phone')}
              placeholder="+7 (900) 000-00-00"
              autoComplete="tel"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              className={`input ${errors.password ? 'invalid' : ''}`}
              value={form.password}
              onChange={change('password')}
              placeholder="минимум 6 символов"
              autoComplete="new-password"
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="password_confirmation">
              Повторите пароль
            </label>
            <input
              id="password_confirmation"
              type="password"
              className="input"
              value={form.password_confirmation}
              onChange={change('password_confirmation')}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="center mt-2 small muted">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
