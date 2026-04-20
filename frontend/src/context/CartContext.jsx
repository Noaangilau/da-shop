import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

// Two identical products differing only in color/size should sit on separate
// cart lines, so we key each line by a composite of product id + variant + size.
function lineKeyFor(item) {
  return `${item.id}|${item.variant?.color || ''}|${item.selectedSize || ''}`
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('da-shop-cart')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('da-shop-cart', JSON.stringify(cart))
  }, [cart])

  function addToCart(product) {
    const key = lineKeyFor(product)
    setCart((prev) => {
      const existing = prev.find((item) => lineKeyFor(item) === key)
      if (existing) {
        return prev.map((item) =>
          lineKeyFor(item) === key ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1, lineKey: key }]
    })
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((item) => (item.lineKey || lineKeyFor(item)) !== key))
  }

  function updateQty(key, qty) {
    if (qty < 1) {
      removeFromCart(key)
      return
    }
    setCart((prev) =>
      prev.map((item) => ((item.lineKey || lineKeyFor(item)) === key ? { ...item, qty } : item))
    )
  }

  function clearCart() {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
