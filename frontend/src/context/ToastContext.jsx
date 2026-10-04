import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let seq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'default', timeout = 3800) => {
      const id = ++seq
      setToasts((list) => [...list, { id, message, type }])
      window.setTimeout(() => remove(id), timeout)
      return id
    },
    [remove]
  )

  const value = useMemo(
    () => ({
      toast: push,
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      dismiss: remove
    }),
    [push, remove]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-layer" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`} onClick={() => remove(toast.id)}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast должен вызываться внутри ToastProvider')
  return context
}
