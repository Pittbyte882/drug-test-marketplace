import { SiteHeader } from "@/components/site-header"
import { SearchResults } from "@/components/search-results"
import { CartProvider } from "@/lib/cart-context"

export default function SearchPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <SearchResults />
      </div>
    </CartProvider>
  )
}