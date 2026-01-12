import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { CartProvider } from "@/lib/cart-context"

export default function HomePage() {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <SiteHeader />
        <HeroSection />

        <section className="container py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-3xl font-bold text-foreground">A Testing Marketplace Built for Convenience, Compliance & Choice</h2>
            <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
              Talcada is a modern testing marketplace that gives users access to multiple test types, providers, and collection options in one place. Whether you’re ordering a drug test for employment, a DNA test, or a clinical lab test, Talcada helps you compare options and order with confidence.
            </p>
            <p className="font-semibold text-foreground">The Talcada Marketplace</p>
          </div>
        </section>

        <section className="bg-muted/30 py-16">
          <div className="container ">
            <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <h3 className="mb-2 text-lg font-semibold">Drug Testing</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive drug screening services at locations nationwide
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <h3 className="mb-2 text-lg font-semibold">DNA Testing</h3>
                <p className="text-sm text-muted-foreground">Accurate paternity and relationship testing services</p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <h3 className="mb-2 text-lg font-semibold">Alcohol Testing</h3>
                <p className="text-sm text-muted-foreground">Professional alcohol screening and monitoring services</p>
              </div>
              
            </div>
          </div>
        </section>
      </div>
    </CartProvider>
  )
}
