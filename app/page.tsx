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
            <h2 className="mb-6 text-3xl font-bold text-foreground">Take the First Step Toward Recovery</h2>
            <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
              If you or someone close to you is facing addiction, you don't have to navigate it alone. Speak with
              someone who can help guide you toward recovery.
            </p>
            <p className="font-semibold text-foreground">Days / Hours: Mon-Sun | 9am-9pm EST</p>
          </div>
        </section>

        <section className="bg-muted/30 py-16">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
              <div className="rounded-lg border bg-card p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <h3 className="mb-2 text-lg font-semibold">Recovery Support</h3>
                <p className="text-sm text-muted-foreground">Guidance and resources for addiction recovery</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CartProvider>
  )
}
