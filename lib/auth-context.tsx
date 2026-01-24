"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
}

interface AuthContextType {
  customer: Customer | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  refreshCustomer: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()
      
      if (data.success && data.customer) {
        setCustomer(data.customer)
      } else {
        setCustomer(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.customer) {
        setCustomer(data.customer)
        return { success: true }
      }

      return { success: false, error: data.error || "Login failed" }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (data.success && data.customer) {
        setCustomer(data.customer)
        return { success: true }
      }

      return { success: false, error: data.error || "Registration failed" }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setCustomer(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const refreshCustomer = async () => {
    await checkAuth()
  }

  return (
    <AuthContext.Provider value={{ customer, loading, login, logout, register, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}