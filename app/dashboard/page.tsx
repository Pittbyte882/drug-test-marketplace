"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { ShoppingBag, FileText, Package, Clock } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalOrders: number
  pendingResults: number
  completedResults: number
  recentOrders: Array<{
    id: string
    order_number: string
    total_amount: number
    payment_status: string
    created_at: string
  }>
}

export default function DashboardPage() {
  const { customer, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login")
    }
  }, [customer, authLoading, router])

  useEffect(() => {
    if (customer) {
      fetchDashboardStats()
    }
  }, [customer])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/customer/dashboard-stats")
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
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
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-border/50 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {loading ? "..." : stats?.totalOrders || 0}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Results</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {loading ? "..." : stats?.pendingResults || 0}
                </p>
              </div>
              <div className="rounded-lg bg-accent-yellow/20 p-3">
                <Clock className="h-6 w-6 text-accent-yellow-foreground" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Results</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {loading ? "..." : stats?.completedResults || 0}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-border/50 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary">Recent Orders</h2>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Loading orders...
            </div>
          ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${order.total_amount.toFixed(2)}</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {order.payment_status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-primary">No orders yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by browsing our testing services
              </p>
              <Link href="/search">
                <Button className="mt-4 bg-primary hover:bg-primary/90">
                  Browse Tests
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/search">
            <Card className="border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Order New Test</h3>
                  <p className="text-sm text-muted-foreground">Browse available testing services</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/results">
            <Card className="border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-accent-yellow/20 p-3">
                  <FileText className="h-6 w-6 text-accent-yellow-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">View Test Results</h3>
                  <p className="text-sm text-muted-foreground">Check your latest test results</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}