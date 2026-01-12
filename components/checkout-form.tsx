"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { loadStripe } from "@stripe/stripe-js"
import { getCurrentUser, signUp } from "@/lib/auth"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutForm() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [createAccount, setCreateAccount] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If creating account, sign up first
      if (createAccount && !currentUser) {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match")
          setLoading(false)
          return
        }

        if (formData.password.length < 6) {
          alert("Password must be at least 6 characters")
          setLoading(false)
          return
        }

        const result = await signUp({
          email: formData.email,
          password: formData.password,
          accountType: 'individual',
          fullName: formData.name,
          phone: formData.phone,
        })

        if (!result.success) {
          alert("Failed to create account: " + result.error)
          setLoading(false)
          return
        }
      }

      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      alert("An error occurred: " + error.message)
    }

    setLoading(false)
  }

  if (items.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => router.push("/search")}>
            Find Testing Locations
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Show logged in status */}
      {currentUser ? (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-green-800">
            ✓ Logged in as <strong>{currentUser.email}</strong>
          </p>
        </Card>
      ) : (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            Already have an account?{" "}
            <Link href="/login" className="underline font-semibold">
              Sign in
            </Link>
          </p>
        </Card>
      )}

      {/* Customer Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Create Account Option */}
        {!currentUser && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="createAccount"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="createAccount" className="font-normal cursor-pointer">
                Create an account for faster checkout next time
              </Label>
            </div>

            {createAccount && (
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Set a password to create your account
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password (min. 6 characters)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={createAccount}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={createAccount}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Order Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={`${item.test.id}-${item.location.id}`} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.test.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.location.name} - {item.location.city}, {item.location.state}
                </p>
              </div>
              <span className="font-medium">${(item.test.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Processing..." : `Proceed to Payment - $${total.toFixed(2)}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By placing your order, you agree to our terms and conditions
      </p>
    </form>
  )
}