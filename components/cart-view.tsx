"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, MapPin, Phone } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

export function CartView() {
  const { items, removeItem, updateQuantity, total } = useCart()

  const handleQuantityChange = (locationId: string, testId: string, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      updateQuantity(locationId, testId, newQuantity)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-12">
          <Card className="p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-primary">Your cart is empty</h2>
            <p className="mb-6 text-muted-foreground">
              Add some tests to your cart to get started.
            </p>
            <Link href="/search">
              <Button>Find Testing Locations</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container py-12">
        <h1 className="mb-8 text-3xl font-bold text-primary">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.location.id}-${item.test.id}`} className="p-6">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary">{item.test.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.test.description}</p>

                    <div className="mt-4 space-y-2">
                      <div className="font-semibold text-primary">{item.company.name}</div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {item.location.address}, {item.location.city}, {item.location.state}{" "}
                          {item.location.zip_code}
                        </span>
                      </div>
                      {item.location.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{item.location.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.location.id, item.test.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Qty:</label>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.location.id, item.test.id, parseInt(e.target.value) || 1)}
                        className="w-20 text-center"
                      />
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        ${item.test.price.toFixed(2)} each
                      </div>
                      <div className="text-xl font-bold text-primary">
                        ${(item.test.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20 p-6">
              <h2 className="mb-4 text-xl font-semibold text-primary">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold text-primary">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout" className="mt-6 block">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/search" className="mt-3 block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}