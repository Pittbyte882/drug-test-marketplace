"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Phone, User, LogIn } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const { customer, logout } = useAuth()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="md:sticky top-0 z-50 w-full border-b bg-white">
      {/* Top bar - hidden on mobile */}
      <div className="hidden md:block border-b bg-muted/30">
        <div className="container flex h-10 items-center justify-end gap-4 text-sm">
          <span className="text-muted-foreground">Talcada Customer Service</span>
          
          <a 
            href="tel:8004608598" 
            className="flex items-center gap-1 font-semibold text-foreground hover:text-primary"
          >
            <Phone className="h-4 w-4" />
            (800) 460-8598
          </a>
          
          <Button 
            asChild 
            size="sm" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/search">Order A Test Near You</Link>
          </Button>
        </div>
      </div>

      {/* Main header - always visible */}
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="https://www.talcada.com/wp-content/uploads/2024/12/Talcada-Logo-Trans-624-x-153-px.png" 
              alt="Talcada" 
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Phone icon only on mobile */}
          <a 
            href="tel:8004608598" 
            className="md:hidden"
          >
            <Phone className="h-5 w-5 text-primary" />
          </a>

          {/* User Menu / Login - Desktop */}
          {customer ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {customer.first_name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-primary">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="cursor-pointer">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/results" className="cursor-pointer">
                      Test Results
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* User Menu / Login - Mobile */}
          {customer ? (
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-primary">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="cursor-pointer">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/results" className="cursor-pointer">
                      Test Results
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="md:hidden flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
          
          {/* Cart - Always visible */}
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