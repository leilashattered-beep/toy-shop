import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'softy.cart'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])

  const add = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const limit = product.stock ?? 99
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, limit), stock: limit }
            : item
        )
      }
      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          image: product.image,
          stock: limit,
          quantity: Math.min(quantity, limit)
        }
      ]
    })
  }, [])

  const remove = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const setQuantity = useCallback((id, quantity) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(Number(quantity) || 1, item.stock ?? 99)) }
          : item
      )
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const total = items.reduce((sum, item) => sum + item.quantity * Number(item.price), 0)
    return { items, add, remove, setQuantity, clear, count, total, isEmpty: items.length === 0 }
  }, [items, add, remove, setQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart должен вызываться внутри CartProvider')
  return context
}
