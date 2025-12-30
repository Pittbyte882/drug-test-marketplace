import { SiteHeader } from "@/components/site-header"
import { AdminDashboard } from "@/components/admin-dashboard"
import { CartProvider } from "@/lib/cart-context"

export default function AdminPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <AdminDashboard />
      </div>
    </CartProvider>
  )
}
