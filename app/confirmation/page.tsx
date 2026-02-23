"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found")
      setLoading(false)
      return
    }

    fetch(`/api/checkout?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order)
        } else {
          setError(data.error || "Failed to create order")
        }
      })
      .catch((err) => {
        console.error("Error:", err)
        setError("An error occurred")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId])

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Processing your order...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-20">
        <Card className="mx-auto max-w-md p-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-20">
      <Card className="mx-auto max-w-2xl p-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <h1 className="mt-4 text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. A confirmation email has been sent to your email address.
          </p>
        </div>

        {order && (
          <div className="mt-8 rounded-lg bg-muted p-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-2xl font-bold">{order.order_number}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please check your email for complete order details and next steps.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.push("/")}>Return Home</Button>
          <Button variant="outline" onClick={() => router.push("/search")}>
            Book Another Test
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-20 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}