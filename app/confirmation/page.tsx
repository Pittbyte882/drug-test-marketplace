"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/${orderNumber}`)
        const data = await response.json()
        if (data.success) {
          setOrder(data.data)
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading your order...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!orderNumber || !order) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-12">
          <Card className="mx-auto max-w-2xl p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-primary">Order Not Found</h1>
            <p className="mb-6 text-muted-foreground">
              We couldn't find your order. Please check your email for confirmation details.
            </p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="overflow-hidden border-border/50 shadow-lg">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
              <CheckCircle className="mx-auto mb-4 h-16 w-16" />
              <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
              <p className="text-lg">Thank you for your order</p>
            </div>

            <div className="p-8">
              <div className="mb-6 rounded-lg bg-muted/30 p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-mono font-semibold">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className="capitalize text-green-600 font-semibold">{order.payment_status}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="mb-4 text-xl font-semibold text-primary">What's Next?</h2>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    <span>Check your email for the order confirmation with testing location details</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    <span>Contact the testing location to schedule your appointment (if required)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      3
                    </span>
                    <span>Bring a valid photo ID to your appointment</span>
                  </li>
                </ol>
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-4 font-semibold text-primary">Your Tests</h3>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="rounded-lg border border-border/50 p-4">
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium">{item.tests.name}</span>
                        <span className="font-bold">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="font-medium">{item.companies.name}</div>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            {item.locations.address}, {item.locations.city}, {item.locations.state}{" "}
                            {item.locations.zip_code}
                          </span>
                        </div>
                        {item.locations.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{item.locations.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Return to Home
                  </Button>
                </Link>
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1"
                >
                  Print Confirmation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
