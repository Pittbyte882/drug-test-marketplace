"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { loadStripe } from "@stripe/stripe-js"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutForm() {
  const { items, total, clearCart } = useCart()
  const { customer } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<"individual" | "company">("individual")
  
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
  })

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: `${customer.first_name} ${customer.last_name}`,
        companyName: "",
        contactPerson: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone || "",
      })
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare customer data based on account type
      const customerData = accountType === 'individual' 
        ? {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          }
        : {
            name: `${formData.companyName} (${formData.contactPerson})`,
            email: formData.email,
            phone: formData.phone,
          }

      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: customerData,
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
      {customer ? (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-green-800">
            ✓ Logged in as <strong>{customer.email}</strong>
          </p>
        </Card>
      ) : (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            Already have an account?{" "}
            <Link href="/login" className="underline font-semibold">
              Sign in
            </Link>
            {" "}or{" "}
            <Link href="/register" className="underline font-semibold">
              Create account
            </Link>
          </p>
        </Card>
      )}

      {/* Account Type Selection */}
      {!customer && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Type</h2>
          <RadioGroup value={accountType} onValueChange={(value: any) => setAccountType(value)}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual" className="font-normal cursor-pointer flex-1">
                <div>
                  <p className="font-semibold">Individual</p>
                  <p className="text-xs text-muted-foreground">For personal testing</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="company" id="company" />
              <Label htmlFor="company" className="font-normal cursor-pointer flex-1">
                <div>
                  <p className="font-semibold">Company</p>
                  <p className="text-xs text-muted-foreground">For business or employee testing</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </Card>
      )}

      {/* Customer Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {accountType === 'individual' ? 'Your Information' : 'Company Information'}
        </h2>
        
        <div className="space-y-4">
          {/* Individual Fields */}
          {accountType === 'individual' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={!!customer}
              />
            </div>
          )}

          {/* Company Fields */}
          {accountType === 'company' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!customer}
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