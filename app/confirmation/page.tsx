import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { CartProvider } from "@/lib/cart-context"
import ConfirmationContent from "@/components/confirmation-content"

export default function ConfirmationPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <Suspense fallback={
          <div className="container flex min-h-[60vh] items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground">Loading your order...</p>
            </div>
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </div>
    </CartProvider>
  )
}