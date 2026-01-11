import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { AdminDashboard } from "@/components/admin-dashboard"
import { CartProvider } from "@/lib/cart-context"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <AdminDashboard />
      </div>
    </CartProvider>
  )
}
