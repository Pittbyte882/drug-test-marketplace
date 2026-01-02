"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Phone } from "lucide-react"
import { useCart } from "@/lib/cart-context"

const drugTests = [
  { name: "Urine Drug Testing", href: "/tests/drug-tests" },
  { name: "5 Panel Drug Test", href: "/tests/drug-tests" },
  { name: "10 Panel Drug Test", href: "/tests/drug-tests" },
  { name: "12 Panel Drug Test", href: "/tests/drug-tests" },
  { name: "DOT Drug Testing", href: "/tests/drug-tests" },
  { name: "Hair Drug Tests", href: "/tests/drug-tests" },
  { name: "Alcohol Tests", href: "/tests/drug-tests" },
  { name: "Urine Alcohol Tests", href: "/tests/drug-tests" },
  { name: "Breath Alcohol Tests", href: "/tests/drug-tests" },
  { name: "Employment Drug Testing", href: "/tests/drug-tests" },
  { name: "Court-Ordered Drug Testing", href: "/tests/drug-tests" },
  { name: "Drug Test Panels", href: "/tests/drug-tests" },
  { name: "Drugs Tested", href: "/tests/drug-tests" },
]

const dnaTests = [
  { name: "Alternative DNA Test", href: "/tests/dna-tests" },
  { name: "Paternity Testing", href: "/tests/dna-tests" },
  { name: "Legal Paternity Test", href: "/tests/dna-tests" },
  { name: "Home DNA Test Kit", href: "/tests/dna-tests" },
  { name: "Prenatal Paternity Test", href: "/tests/dna-tests" },
  { name: "Sibling DNA Test", href: "/tests/dna-tests" },
  { name: "Aunt or Uncle DNA Test", href: "/tests/dna-tests" },
  { name: "Grandparent DNA Test", href: "/tests/dna-tests" },
  { name: "Postmortem DNA Test", href: "/tests/dna-tests" },
  { name: "Hair DNA Test", href: "/tests/dna-tests" },
]

const backgroundChecks = [
  { name: "Triple Database Package", href: "/tests/background-check" },
  { name: "Court Record Package", href: "/tests/background-check" },
  { name: "Platinum Package", href: "/tests/background-check" },
  { name: "Ultimate Package", href: "/tests/background-check" },
  { name: "Resume Verification", href: "/tests/background-check" },
  { name: "DOT Background Check", href: "/tests/background-check" },
]

const occupationalHealth = [
  { name: "Occupational Health Locations", href: "/tests/occupational-health" },
  { name: "Antibody Testing", href: "/tests/occupational-health" },
  { name: "Biometrics", href: "/tests/occupational-health" },
  { name: "Employment Physical", href: "/tests/occupational-health" },
  { name: "Respiratory Health Exam", href: "/tests/occupational-health" },
  { name: "Tuberculosis (TB) Testing", href: "/tests/occupational-health" },
  { name: "Vaccines", href: "/tests/occupational-health" },
  { name: "Vision and Hearing", href: "/tests/occupational-health" },
]

const resources = [
  { name: "GLASS App", href: "/resources/glass" },
  { name: "Blog", href: "/resources/blog" },
  { name: "FAQs", href: "/resources/faqs" },
  { name: "Drug & DNA Locations", href: "/locations" },
  { name: "Marijuana Compliance", href: "/resources/marijuana" },
  { name: "State Laws Compliance", href: "/resources/state-laws" },
  { name: "Industries", href: "/resources/industries" },
]

export function SiteHeader() {
  const { items } = useCart()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="border-b bg-muted/30">
        <div className="container flex h-10 items-center justify-end gap-4 text-sm">
          <span className="text-muted-foreground">Talcada Customer Service</span>
          <a href="tel:8334611709" className="flex items-center gap-1 font-semibold text-foreground hover:text-primary">
            <Phone className="h-4 w-4" />
            (800) 460-8598
          </a>
          <Button asChild size="sm" className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/search">Order A Test Near You</Link>
          </Button>
        </div>
      </div>

      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="https://www.talcada.com/wp-content/uploads/2024/12/Talcada-Logo-Trans-624-x-153-px.png" 
              alt="Talcada" 
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
  <a href="https://www.talcada.com/drug-information/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Drug
  </a>
  <a href="https://www.talcada.com/alcohol-education-awareness/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Alcohol
  </a>
  <a href="https://www.talcada.com/addiction-recovery-resources-support/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Recovery
  </a>
  <a href="https://www.talcada.com/drug-alcohol-testing-information/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Testing
  </a>
  <a href="https://www.talcada.com/dna-testing-genetic-information/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Blood
  </a>
  <a href="https://www.talcada.com/dna-information/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    DNA
  </a>
  <a href="https://www.talcada.com/employer-drug-testing-compliance-resources/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Employers
  </a>
  <Link href="https://tests.talcada.com" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Order Test
  </Link>
  <a href="https://www.talcada.com/contact/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
    Contact Us
  </a>
</nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-yellow text-xs font-bold text-accent-yellow-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}