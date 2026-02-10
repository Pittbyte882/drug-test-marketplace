"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { loadStripe } from "@stripe/stripe-js"
import Link from "next/link"
import { Users, Edit2, Check } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface EmployeeInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  sex: "M" | "F" | ""
  employeeNumber?: string
}

interface TestEmployee {
  testKey: string
  employee: EmployeeInfo | null
}

export function CheckoutForm() {
  const { items, total, clearCart } = useCart()
  const { customer } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<"individual" | "company">("individual")
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [currentTestKey, setCurrentTestKey] = useState<string | null>(null)
  const [employeeData, setEmployeeData] = useState<TestEmployee[]>([])
  
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
  })

  const [employeeForm, setEmployeeForm] = useState<EmployeeInfo>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "",
    employeeNumber: "",
  })

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: `${customer.first_name} ${customer.last_name}`,
        companyName: "",
        contactPerson: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone || "",
      })
    }
  }, [customer])

  // Initialize employee data for each cart item
  useEffect(() => {
    const initialEmployeeData = items.map((item) => ({
      testKey: `${item.test.id}-${item.location.id}`,
      employee: null,
    }))
    setEmployeeData(initialEmployeeData)
  }, [items])

  const handleOpenEmployeeModal = (testKey: string) => {
    setCurrentTestKey(testKey)
    
    // Pre-fill if employee data already exists
    const existing = employeeData.find((e) => e.testKey === testKey)
    if (existing?.employee) {
      setEmployeeForm(existing.employee)
    } else {
      setEmployeeForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        sex: "",
        employeeNumber: "",
      })
    }
    
    setShowEmployeeModal(true)
  }

  const handleSaveEmployee = () => {
    if (!currentTestKey) return

    // Validate required fields
    if (!employeeForm.firstName || !employeeForm.lastName || !employeeForm.dateOfBirth || !employeeForm.sex) {
      alert("Please fill in all required fields")
      return
    }

    // Update employee data
    setEmployeeData((prev) =>
      prev.map((item) =>
        item.testKey === currentTestKey
          ? { ...item, employee: { ...employeeForm } }
          : item
      )
    )

    setShowEmployeeModal(false)
    setCurrentTestKey(null)
  }

  const getEmployeeForTest = (testKey: string) => {
    return employeeData.find((e) => e.testKey === testKey)?.employee
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For company orders, validate that all tests have employee info
    if (accountType === "company") {
      const missingEmployeeInfo = employeeData.some((item) => !item.employee)
      if (missingEmployeeInfo) {
        alert("Please provide employee information for all tests in your order")
        return
      }
    }

    setLoading(true)

    try {
      // Prepare customer data based on account type
      const customerData = accountType === 'individual' 
        ? {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          }
        : {
            name: `${formData.companyName} (${formData.contactPerson})`,
            email: formData.email,
            phone: formData.phone,
          }

      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: customerData,
          employeeData: accountType === "company" ? employeeData : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      alert("An error occurred: " + error.message)
    }

    setLoading(false)
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => router.push("/search")}>
            Find Testing Locations
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* Show logged in status */}
        {customer ? (
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm text-green-800">
              ✓ Logged in as <strong>{customer.email}</strong>
            </p>
          </Card>
        ) : (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              Already have an account?{" "}
              <Link href="/login" className="underline font-semibold">
                Sign in
              </Link>
              {" "}or{" "}
              <Link href="/register" className="underline font-semibold">
                Create account
              </Link>
            </p>
          </Card>
        )}

        {/* Account Type Selection - ALWAYS SHOW */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Type</h2>
          <div className="max-w-xl mx-auto">
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
        </Card>

        {/* Customer Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {accountType === 'individual' ? 'Your Information' : 'Company Information'}
          </h2>
          
          <div className="max-w-xl mx-auto space-y-4">
            {/* Individual Fields */}
            {accountType === 'individual' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={!!customer}
                />
              </div>
            )}

            {/* Company Fields */}
            {accountType === 'company' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!customer}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => {
              const testKey = `${item.test.id}-${item.location.id}`
              const employee = getEmployeeForTest(testKey)
              
              return (
                <div key={testKey} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.test.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.location.name} - {item.location.city}, {item.location.state}
                      </p>
                    </div>
                    <span className="font-medium">${(item.test.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  {accountType === "company" && (
                    <div className="mt-3">
                      {employee ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-600 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-green-900">
                                  {employee.firstName} {employee.lastName}
                                </p>
                                <p className="text-green-700 text-xs">
                                  DOB: {employee.dateOfBirth} • Sex: {employee.sex}
                                  {employee.employeeNumber && ` • ID: ${employee.employeeNumber}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEmployeeModal(testKey)}
                              className="h-8"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEmployeeModal(testKey)}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-base underline decoration-2 underline-offset-4 hover:decoration-blue-700 transition-colors"
                          >
                            ADD PERSON TO TEST
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            
            <div className="border-t pt-4 mt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg" 
            disabled={loading}
            className="px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? "Processing..." : `Proceed to Payment - $${total.toFixed(2)}`}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          By placing your order, you agree to our terms and conditions
        </p>
      </form>

      {/* Employee Information Modal */}
      <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Employee Information</DialogTitle>
            <DialogDescription>
              Enter the information for the person who will be taking this test.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={employeeForm.firstName}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={employeeForm.lastName}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={employeeForm.dateOfBirth}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, dateOfBirth: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">
                Sex <span className="text-red-500">*</span>
              </Label>
              <Select
                value={employeeForm.sex}
                onValueChange={(value: "M" | "F") =>
                  setEmployeeForm({ ...employeeForm, sex: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeNumber">
                Employee Number <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="employeeNumber"
                value={employeeForm.employeeNumber}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, employeeNumber: e.target.value })
                }
                placeholder="EMP-12345"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmployeeModal(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEmployee}>
              Save Info
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}