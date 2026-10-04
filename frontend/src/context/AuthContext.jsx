import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { getStoredUser, getToken, setStoredUser, setToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [booting, setBooting] = useState(Boolean(getToken()))

  const persist = useCallback((nextUser, nextToken) => {
    setUser(nextUser)
    setStoredUser(nextUser)
    if (nextToken !== undefined) setToken(nextToken)
  }, [])

  // Проверяем токен при старте приложения.
  useEffect(() => {
    let alive = true
    if (!getToken()) {
      setBooting(false)
      return () => {
        alive = false
      }
    }
    api
      .get('/api/auth/me')
      .then((response) => {
        if (alive) persist(response.user)
      })
      .catch(() => {
        if (alive) persist(null, null)
      })
      .finally(() => {
        if (alive) setBooting(false)
      })
    return () => {
      alive = false
    }
  }, [persist])

  useEffect(() => {
    const handler = () => {
      setUser(null)
      setStoredUser(null)
    }
    window.addEventListener('softy:unauthorized', handler)
    return () => window.removeEventListener('softy:unauthorized', handler)
  }, [])

  const login = useCallback(
    async (credentials) => {
      const response = await api.post('/api/auth/login', credentials)
      persist(response.user, response.token)
      return response.user
    },
    [persist]
  )

  const register = useCallback(
    async (payload) => {
      const response = await api.post('/api/auth/register', payload)
      persist(response.user, response.token)
      return response.user
    },
    [persist]
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      /* токен мог уже истечь */
    }
    persist(null, null)
  }, [persist])

  const updateProfile = useCallback(
    async (payload) => {
      const response = await api.put('/api/auth/profile', payload)
      persist(response.user)
      return response.user
    },
    [persist]
  )

  const changePassword = useCallback(async (payload) => {
    return api.put('/api/auth/password', payload)
  }, [])

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
      changePassword
    }),
    [user, booting, login, register, logout, updateProfile, changePassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth должен вызываться внутри AuthProvider')
  return context
}
