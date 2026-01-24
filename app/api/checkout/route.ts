import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function getCustomerId() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("customer_token")
    
    if (!token) return null
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")
    const { payload } = await jwtVerify(token.value, secret)
    return payload.customerId as string
  } catch (error) {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { items, customer } = await request.json()

    // Get logged-in customer ID if available
    const customerId = await getCustomerId()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.test.name,
            description: `${item.location.name} - ${item.location.city}, ${item.location.state}`,
          },
          unit_amount: Math.round(item.test.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cart`,
      customer_email: customer.email,
      metadata: {
        customer_id: customerId || "",
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items: JSON.stringify(items.map((item: any) => ({
          test_id: item.test.id,
          location_id: item.location.id,
          company_id: item.company.id,
          quantity: item.quantity,
          price: item.test.price,
        }))),
      },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}