"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

function PaymentForm({ customer, total }: { customer: any; total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      // Confirm payment first
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (error) {
        throw new Error(error.message)
      }

      // Create order after successful payment
      const orderResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items,
          total,
          stripePaymentIntentId: paymentIntent?.id,
        }),
      })

      const orderData = await orderResponse.json()
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order")
      }

      // Clear cart and redirect
      clearCart()
      router.push(`/confirmation?orderNumber=${orderData.orderNumber}`)
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/cart")}
          className="flex-1 border-border/50"
        >
          Back to Cart
        </Button>
        <Button type="submit" disabled={!stripe || loading} className="flex-1 bg-primary hover:bg-primary/90">
          {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

export function CheckoutForm() {
  const { items, total, isLoading } = useCart() // NEW: Get isLoading
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [clientSecret, setClientSecret] = useState("")
  const [formComplete, setFormComplete] = useState(false)

  // Check cart after it's loaded
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      router.push("/cart")
    }
  }, [isLoading, items.length, router, toast])

  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormComplete(true)

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          customer: formData,
        }),
      })

      const data = await response.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        throw new Error(data.error || "Failed to initialize payment")
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      })
      setFormComplete(false)
    }
  }

  // Show loading while cart is loading
  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Don't render if cart is empty (will redirect via useEffect)
  if (items.length === 0) {
    return null
  }

  return (
    <div className="container py-12">
      <h1 className="mb-8 text-3xl font-bold text-primary">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border/50 p-6 shadow-sm">
            {!formComplete ? (
              <>
                <h2 className="mb-6 text-xl font-semibold text-primary">Customer Information</h2>
                <form onSubmit={handleCustomerInfoSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/cart")}
                      className="flex-1 border-border/50"
                    >
                      Back to Cart
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-primary">Payment Information</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete your payment to receive your test confirmation
                  </p>
                </div>

                {clientSecret && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                      },
                    }}
                  >
                    <PaymentForm customer={formData} total={total} />
                  </Elements>
                ) : (
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                        ? "Stripe is not configured. Please add your Stripe API keys to enable payments."
                        : "Initializing payment..."}
                    </p>
                    <Button onClick={() => setFormComplete(false)} variant="outline" className="mt-4">
                      Go Back
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        <div>
          <Card className="sticky top-20 border-border/50 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-primary">Order Summary</h3>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.location.id}-${item.test.id}`} className="border-b pb-4 last:border-0">
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium">{item.test.name}</span>
                    <span className="font-bold">${(item.test.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium">{item.company.name}</div>
                    <div className="text-xs">{item.location.name}</div>
                    <div className="mt-1 flex items-start gap-1">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        {item.location.address}, {item.location.city}, {item.location.state} {item.location.zip_code}
                      </span>
                    </div>
                    {item.location.phone && (
                      <div className="mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{item.location.phone}</span>
                      </div>
                    )}
                    {item.quantity > 1 && <div className="mt-1">Quantity: {item.quantity}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}