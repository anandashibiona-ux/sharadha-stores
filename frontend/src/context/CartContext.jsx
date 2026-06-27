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

const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 50
  return {
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

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

  const addToCart = async (productOrId, quantity = 1) => {
    const isObject = typeof productOrId === 'object' && productOrId !== null
    const productId = isObject ? productOrId.id : productOrId
    const product = isObject ? productOrId : null

    const previousCart = cart

    if (product) {
      // Optimistic update
      setCart((prevCart) => {
        const existingIndex = prevCart.items.findIndex(item => item.product.id === product.id)
        let newItems
        if (existingIndex > -1) {
          newItems = prevCart.items.map((item, idx) => {
            if (idx === existingIndex) {
              const newQty = item.quantity + quantity
              return {
                ...item,
                quantity: newQty,
                lineTotal: item.product.price * newQty,
              }
            }
            return item
          })
        } else {
          newItems = [
            ...prevCart.items,
            {
              id: `temp-${crypto.randomUUID()}`,
              quantity,
              product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                imageUrl: product.imageUrl || product.image_url || product.imageData || product.image_data,
                stockQuantity: product.stockQuantity,
                stockStatus: product.stockStatus || 'in_stock',
              },
              lineTotal: Number(product.price) * quantity,
            },
          ]
        }
        return calculateCartTotals(newItems)
      })
      setCartOpen(true)
    }

    setLoading(true)
    try {
      const data = await api.addToCart(sessionId, productId, quantity)
      setCart(data)
      if (!product) {
        setCartOpen(true)
      }
      return { success: true }
    } catch (err) {
      if (product) {
        setCart(previousCart)
      }
      const message = err.response?.data?.error || 'Failed to add item'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (itemId, quantity) => {
    const previousCart = cart
    // Optimistic update
    setCart((prevCart) => {
      const newItems = prevCart.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            lineTotal: item.product.price * quantity,
          }
        }
        return item
      })
      return calculateCartTotals(newItems)
    })

    setLoading(true)
    try {
      const data = await api.updateCartItem(sessionId, itemId, quantity)
      setCart(data)
    } catch (err) {
      console.error('Update cart error:', err)
      setCart(previousCart)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId) => {
    const previousCart = cart
    // Optimistic update
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(item => item.id !== itemId)
      return calculateCartTotals(newItems)
    })

    setLoading(true)
    try {
      const data = await api.removeCartItem(sessionId, itemId)
      setCart(data)
    } catch (err) {
      console.error('Remove cart error:', err)
      setCart(previousCart)
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
