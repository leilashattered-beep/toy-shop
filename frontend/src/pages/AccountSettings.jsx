import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function AccountSettings() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)

  const saveProfile = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})
    try {
      await updateProfile(profile)
      toast.success('Профиль обновлён')
    } catch (error) {
      if (error.errors) {
        setProfileErrors(
          Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value[0]]))
        )
      } else {
        toast.error(error.message)
      }
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setSavingPassword(true)
    setPasswordErrors({})
    try {
      await changePassword(passwords)
      toast.success('Пароль изменён')
      setPasswords({ current_password: '', password: '', password_confirmation: '' })
    } catch (error) {
      if (error.errors) {
        setPasswordErrors(
          Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value[0]]))
        )
      } else {
        toast.error(error.message)
      }
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="stack">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Профиль</h2>
        </div>
        <form className="admin-panel-body" onSubmit={saveProfile}>
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="p-name">
                Имя
              </label>
              <input
                id="p-name"
                className={`input ${profileErrors.name ? 'invalid' : ''}`}
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                required
              />
              {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
            </div>
            <div className="field">
              <label className="label" htmlFor="p-email">
                Email
              </label>
              <input
                id="p-email"
                type="email"
                className={`input ${profileErrors.email ? 'invalid' : ''}`}
                value={profile.email}
                onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                required
              />
              {profileErrors.email && <span className="error-text">{profileErrors.email}</span>}
            </div>
            <div className="field">
              <label className="label" htmlFor="p-phone">
                Телефон
              </label>
              <input
                id="p-phone"
                className="input"
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                placeholder="+7 (900) 000-00-00"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-address">
                Адрес доставки по умолчанию
              </label>
              <input
                id="p-address"
                className="input"
                value={profile.address}
                onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                placeholder="Город, улица, дом"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Сохраняем…' : 'Сохранить профиль'}
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Смена пароля</h2>
        </div>
        <form className="admin-panel-body" onSubmit={savePassword}>
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="c-pass">
                Текущий пароль
              </label>
              <input
                id="c-pass"
                type="password"
                className={`input ${passwordErrors.current_password ? 'invalid' : ''}`}
                value={passwords.current_password}
                onChange={(event) =>
                  setPasswords({ ...passwords, current_password: event.target.value })
                }
                required
              />
              {passwordErrors.current_password && (
                <span className="error-text">{passwordErrors.current_password}</span>
              )}
            </div>
            <div className="field">
              <label className="label" htmlFor="n-pass">
                Новый пароль
              </label>
              <input
                id="n-pass"
                type="password"
                className={`input ${passwordErrors.password ? 'invalid' : ''}`}
                value={passwords.password}
                onChange={(event) => setPasswords({ ...passwords, password: event.target.value })}
                required
              />
              {passwordErrors.password && (
                <span className="error-text">{passwordErrors.password}</span>
              )}
            </div>
            <div className="field">
              <label className="label" htmlFor="n-pass2">
                Повторите новый пароль
              </label>
              <input
                id="n-pass2"
                type="password"
                className="input"
                value={passwords.password_confirmation}
                onChange={(event) =>
                  setPasswords({ ...passwords, password_confirmation: event.target.value })
                }
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingPassword}>
            {savingPassword ? 'Меняем…' : 'Изменить пароль'}
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-body row-between">
          <div>
            <strong>Выход из аккаунта</strong>
            <p className="muted small mb-0">Токен доступа будет удалён с этого устройства.</p>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              await logout()
              navigate('/')
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}
