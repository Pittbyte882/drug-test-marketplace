"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, MapPin, Phone } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function CartView() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <Card className="border-border/50 p-12 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-primary">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">Add tests to your cart to continue</p>
          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
            Start Shopping
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="mb-8 text-3xl font-bold text-primary">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={`${item.company.id}-${item.test.id}`} className="border-border/50 p-6 shadow-sm">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">{item.test.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.test.description}</p>

                    <div className="mt-4 space-y-1 text-sm">
                      <div className="font-medium">{item.company.name}</div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {item.company.address}, {item.company.city}, {item.company.state} {item.company.zip_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{item.company.phone_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.company.id, item.test.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="text-right">
                      <div className="mb-2 flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Qty:</label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = Number.parseInt(e.target.value) || 1
                            updateQuantity(item.company.id, item.test.id, qty)
                          }}
                          className="w-20 text-center"
                        />
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
        </div>

        <div>
          <Card className="sticky top-20 border-border/50 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-primary">Order Summary</h3>

            <div className="space-y-2 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span>$0.00</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold text-primary">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Button onClick={handleCheckout} className="mt-6 w-full bg-primary hover:bg-primary/90">
              Proceed to Checkout
            </Button>

            <Button variant="outline" onClick={() => router.push("/")} className="mt-2 w-full border-border/50">
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
