import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SearchResults } from "@/components/search-results"
import { CartProvider } from "@/lib/cart-context"

export default function SearchPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <Suspense fallback={
          <div className="container py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground">Loading search results...</p>
            </div>
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>
    </CartProvider>
  )
}