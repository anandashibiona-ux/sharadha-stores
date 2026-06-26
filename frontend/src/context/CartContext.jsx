import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'

// Generate or retrieve a persistent session ID for guest cart
const getSessionId = () => {
  let id = localStorage.getItem('sharadha_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sharadha_session', id)
  }
  return id
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [sessionId] = useState(getSessionId)
  const [cart, setCart] = useState({ items: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 })
  const [loading, setLoading] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      const data = await api.getCart(sessionId)
      setCart(data)
    } catch {
      // Cart might be empty on first load — that's fine
    }
  }, [sessionId])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true)
    try {
      const data = await api.addToCart(sessionId, productId, quantity)
      setCart(data)
      setCartOpen(true)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to add item'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (itemId, quantity) => {
    setLoading(true)
    try {
      const data = await api.updateCartItem(sessionId, itemId, quantity)
      setCart(data)
    } catch (err) {
      console.error('Update cart error:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId) => {
    setLoading(true)
    try {
      const data = await api.removeCartItem(sessionId, itemId)
      setCart(data)
    } catch (err) {
      console.error('Remove cart error:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      await api.clearCart(sessionId)
      setCart({ items: [], subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 })
    } catch (err) {
      console.error('Clear cart error:', err)
    }
  }

  return (
    <CartContext.Provider value={{
      cart, sessionId, loading, cartOpen, setCartOpen,
      addToCart, updateItem, removeItem, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
