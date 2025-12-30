"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function ConfirmationView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-2xl border-border/50 p-12 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-accent" />

        <h1 className="mb-4 text-3xl font-bold text-primary">Order Confirmed!</h1>

        <p className="mb-6 text-lg text-muted-foreground">
          Thank you for your purchase. A confirmation email has been sent with your testing location details and phone
          number to call.
        </p>

        {orderId && (
          <div className="mb-8 rounded-lg bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-lg font-semibold text-primary">{orderId}</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please check your email for complete details about your test, including:
          </p>
          <ul className="mx-auto max-w-md space-y-2 text-left text-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              <span>Testing location address and phone number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              <span>Whether walk-ins are accepted or appointment is required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">✓</span>
              <span>Test confirmation number to provide when you call</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={() => router.push("/")} className="flex-1 border-border/50">
            Return Home
          </Button>
          <Button onClick={() => router.push("/search?location=")} className="flex-1 bg-primary hover:bg-primary/90">
            Find More Locations
          </Button>
        </div>
      </Card>
    </div>
  )
}
