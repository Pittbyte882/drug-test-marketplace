import { CartView } from "@/components/cart-view"
import { CartProvider } from "@/lib/cart-context"

export default function CartPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <CartView />
      </div>
    </CartProvider>
  )
}