import { NextResponse } from "next/server"
import { createOrder } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { customer, items, total, stripePaymentIntentId } = await request.json()

    const order = await createOrder({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      total_amount: total,
      payment_status: "completed",
      stripe_payment_intent_id: stripePaymentIntentId,
      items: items.map((item: any) => ({
        test_id: item.test.id,
        location_id: item.location.id,
        company_id: item.company.id,
        quantity: item.quantity,
        price: item.test.price,
      })),
    })

    // Send confirmation email
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        orderNumber: order.order_number,
        customer,
        items,
      }),
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}