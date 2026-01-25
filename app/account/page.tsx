"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { supabase } from "@/lib/supabase"
import { Package, MapPin, Settings, LogOut } from "lucide-react"

export default function AccountPage() {
  const router = useRouter()
  const { customer, loading: authLoading, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login")
    }
  }, [customer, authLoading, router])

  useEffect(() => {
    if (customer) {
      loadAccountData()
    }
  }, [customer])

  const loadAccountData = async () => {
    if (!customer) return

    // Load recent orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(5)

    setRecentOrders(orders || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    logout()
    router.push("/")
  }

  if (authLoading || loading) {
    return (
      <>
        <SiteHeader />
        <div className="container py-12">
          <p>Loading...</p>
        </div>
      </>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">
              Welcome back, {customer.first_name} {customer.last_name}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Account Info Card */}
        <Card className="mb-6 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Account Information</h2>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Name:</strong> {customer.first_name} {customer.last_name}</p>
                <p><strong>Phone:</strong> {customer.phone || 'Not provided'}</p>
              </div>
            </div>
            <Link href="/account/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Link href="/account/orders">
            <Card className="p-6 hover:border-primary cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Order History</h3>
                  <p className="text-sm text-muted-foreground">
                    View all your orders
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/addresses">
            <Card className="p-6 hover:border-primary cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Saved Addresses</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your addresses
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/account/profile">
            <Card className="p-6 hover:border-primary cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your information
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/account/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No orders yet</p>
              <Link href="/search">
                <Button className="mt-4">
                  Order Your First Test
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-semibold">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}