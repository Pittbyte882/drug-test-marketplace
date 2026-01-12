"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Package } from "lucide-react"

export default function OrderHistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const user = await getCurrentUser()
    
    if (!user) {
      router.push("/login")
      return
    }

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="container py-12">
          <p>Loading orders...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <div className="mb-8">
          <Link href="/account">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Account
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="mb-6">Start shopping to see your order history</p>
              <Link href="/search">
                <Button>Browse Testing Locations</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm">
                      <strong>Customer:</strong> {order.customer_name}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {order.customer_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${order.total.toFixed(2)}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.href = `/confirmation?order=${order.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}