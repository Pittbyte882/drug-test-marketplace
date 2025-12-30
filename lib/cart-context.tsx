"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Updated CartItem type to match database structure
export interface CartItem {
  company: {
    id: string
    name: string
    logo_url?: string
    phone?: string
    email?: string
    website?: string
  }
  location: {
    id: string
    name: string
    address: string
    city: string
    state: string
    zip_code: string
    phone?: string
  }
  test: {
    id: string
    name: string
    description?: string
    price: number
    test_type: string
    turnaround_time?: string
  }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (locationId: string, testId: string) => void
  updateQuantity: (locationId: string, testId: string, quantity: number) => void
  clearCart: () => void
  total: number
  isLoading: boolean // NEW: Track if cart is still loading
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true) // NEW: Start as loading

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setItems(parsed)
      } catch (e) {
        console.error("Failed to parse cart from localStorage")
      }
    }
    setIsLoading(false) // NEW: Mark as loaded
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isLoading])

  const addItem = (newItem: CartItem) => {
    setItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.location.id === newItem.location.id && item.test.id === newItem.test.id
      )

      if (existingIndex > -1) {
        const updated = [...current]
        updated[existingIndex].quantity += newItem.quantity
        return updated
      }

      return [...current, newItem]
    })
  }

  const removeItem = (locationId: string, testId: string) => {
    setItems((current) =>
      current.filter((item) => !(item.location.id === locationId && item.test.id === testId))
    )
  }

  const updateQuantity = (locationId: string, testId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(locationId, testId)
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.location.id === locationId && item.test.id === testId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  const total = items.reduce((sum, item) => sum + item.test.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, isLoading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}