"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Package, MapPin, Calendar, DollarSign, Eye } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total_amount: number
  payment_status: string
  stripe_payment_intent_id: string
  created_at: string
  order_items: Array<{
    id: string
    test_id: string
    location_id: string
    quantity: number
    price: number
    tests: {
      name: string
      test_type: string
    }
    locations: {
      name: string
      address: string
      city: string
      state: string
      zip_code: string
      companies: {
        name: string
        phone: string
      }
    }
  }>
}

export default function OrdersPage() {
  const { customer, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login")
    }
  }, [customer, authLoading, router])

  useEffect(() => {
    if (customer) {
      fetchOrders()
    }
  }, [customer])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/customer/orders")
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <DashboardHeader />
      <DashboardNav />
      
      <div className="container py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">My Orders</h2>
          <p className="text-sm text-muted-foreground">View and track your testing orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-border/50 p-12 shadow-sm text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold text-primary">No orders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by browsing our testing services
            </p>
            <Link href="/search">
              <Button className="mt-6 bg-primary hover:bg-primary/90">
                Browse Tests
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-border/50 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-primary/5 via-blue-50 to-slate-50 border-b p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-primary">
                            Order {order.order_number}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${order.payment_status === "completed" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                        }
                      `}>
                        {order.payment_status === "completed" ? "Paid" : "Pending"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-semibold text-primary mb-4">Tests Ordered:</h4>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border/50 p-4 bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-primary">{item.tests.name}</h5>
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.tests.test_type} Test
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              ${item.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Location Info */}
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-sm font-medium text-primary mb-2">
                            {item.locations.companies.name}
                          </p>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {item.locations.address}, {item.locations.city}, {item.locations.state} {item.locations.zip_code}
                            </span>
                          </div>
                          {item.locations.companies.phone && (
                            <p className="text-sm text-muted-foreground mt-1 ml-6">
                              📞 {item.locations.companies.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}