/**
 * Тонкий клиент для Laravel API.
 * Токен (Laravel Sanctum personal access token) хранится в localStorage.
 */

const RAW_BASE = import.meta.env.VITE_API_URL || ''
const BASE = RAW_BASE.replace(/\/+$/, '')
const TOKEN_KEY = 'softy.token'
const USER_KEY = 'softy.user'

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* приватный режим браузера */
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

function buildUrl(path, params) {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`
  if (!params) return url
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return
    if (Array.isArray(value)) value.forEach((v) => search.append(`${key}[]`, v))
    else search.append(key, value)
  })
  const qs = search.toString()
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url
}

async function request(path, { method = 'GET', body, params, isForm = false } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (body instanceof FormData) {
    payload = body
    isForm = true
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: isForm ? body : payload
    })
  } catch (error) {
    throw new ApiError('Нет связи с сервером. Проверьте, запущен ли Laravel.', 0)
  }

  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null)
      setStoredUser(null)
      window.dispatchEvent(new CustomEvent('softy:unauthorized'))
    }
    const message =
      data?.message ||
      (response.status === 422 ? 'Проверьте правильность заполнения полей' : 'Ошибка запроса')
    throw new ApiError(message, response.status, data?.errors || {})
  }

  return data
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData })
}

export default api
