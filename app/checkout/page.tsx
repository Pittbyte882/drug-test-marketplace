import { SiteHeader } from "@/components/site-header"
import { CheckoutForm } from "@/components/checkout-form"
import { CartProvider } from "@/lib/cart-context"

export default function CheckoutPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <CheckoutForm />
      </div>
    </CartProvider>
  )
}