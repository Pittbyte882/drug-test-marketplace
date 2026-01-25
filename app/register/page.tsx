"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { CartProvider } from "@/lib/cart-context"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<"individual" | "company">("individual")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (formData.password !== formData.confirmPassword) {
    toast({
      title: "Error",
      description: "Passwords do not match",
      variant: "destructive",
    })
    return
  }

  if (formData.password.length < 8) {
    toast({
      title: "Error",
      description: "Password must be at least 8 characters",
      variant: "destructive",
    })
    return
  }

  if (accountType === "company" && !formData.companyName) {
    toast({
      title: "Error",
      description: "Company name is required",
      variant: "destructive",
    })
    return
  }

  setLoading(true)

  try {
    // For company accounts, use company name as first name
    const firstName = accountType === "company" ? formData.companyName : formData.firstName
    const lastName = accountType === "company" ? "(Company)" : formData.lastName

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: firstName,
      lastName: lastName,
      phone: formData.phone
    })

    if (result.success) {
      toast({
        title: "Success!",
        description: "Your account has been created",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create account",
        variant: "destructive",
      })
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
} // <-- This closes handleSubmit
  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <SiteHeader />
        
        <div className="container flex items-center justify-center py-12 md:py-20">
          <Card className="w-full max-w-md border-border/50 p-8 shadow-lg">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-primary">Create Account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Join Talcada to manage your testing orders
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selection */}
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup value={accountType} onValueChange={(value: any) => setAccountType(value)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="font-normal cursor-pointer flex-1">
                      <div>
                        <p className="font-semibold">Individual</p>
                        <p className="text-xs text-muted-foreground">For personal testing</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="font-normal cursor-pointer flex-1">
                      <div>
                        <p className="font-semibold">Company</p>
                        <p className="text-xs text-muted-foreground">For business or employee testing</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Individual Fields */}
              {accountType === "individual" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Company Fields */}
              {accountType === "company" && (
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="Your Company Name"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone *(Mandatory)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="At least 8 characters"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </CartProvider>
  )
}