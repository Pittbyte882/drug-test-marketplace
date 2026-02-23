import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase"

import { Resend } from "resend"
import { generateOrderConfirmationEmail } from "@/lib/email-templates"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { items, customer, employeeData } = await request.json()

    // Get logged-in customer ID if available
    const customerId = await getCustomerId()

    // Determine account type
    const accountType = employeeData && employeeData.length > 0 ? "company" : "individual"
    const companyName = accountType === "company" ? customer.name.split(" (")[0] : null

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
        account_type: accountType,
        company_name: companyName || "",
        items: JSON.stringify(items.map((item: any) => ({
          test_id: item.test.id,
          location_id: item.location.id,
          company_id: item.company?.id,
          quantity: item.quantity,
          price: item.test.price,
        }))),
        employee_data: employeeData ? JSON.stringify(employeeData) : "",
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

// Handle successful payment and create order
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "No session ID provided" },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }

    // Parse items and employee data from metadata
    const items = JSON.parse(session.metadata?.items || "[]")
    const employeeData = session.metadata?.employee_data 
      ? JSON.parse(session.metadata.employee_data) 
      : null

    // Create order in database
    const order = await createOrderInDatabase(session, items, employeeData)

    // Send confirmation email
    await sendOrderConfirmationEmail(order)

    return NextResponse.json({ 
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
      }
    })
  } catch (error: any) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function createOrderInDatabase(session: any, items: any[], employeeData: any[] | null) {
  const supabase = await createClient()
  
  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  // Create order record
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: session.metadata?.customer_name || session.customer_details?.name,
      customer_email: session.metadata?.customer_email || session.customer_details?.email,
      customer_phone: session.metadata?.customer_phone || session.customer_details?.phone,
      total_amount: session.amount_total / 100,
      status: "pending",
      payment_status: "paid",
      stripe_session_id: session.id,
      account_type: session.metadata?.account_type || "individual",
      company_name: session.metadata?.company_name || null,
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const testKey = `${item.test_id}-${item.location_id}`
    const employee = employeeData?.find((e: any) => e.testKey === testKey)
    
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      test_id: item.test_id,
      location_id: item.location_id,
      price: item.price,
      quantity: item.quantity,
      employee_data: employee?.employee || null,
    })

    if (itemError) throw itemError
  }

  // Fetch complete order data with relationships
  const { data: completeOrder, error: fetchError } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        tests (*),
        locations (
          *,
          companies (*)
        )
      )
    `)
    .eq("id", order.id)
    .single()

  if (fetchError) throw fetchError

  return completeOrder
}

async function sendOrderConfirmationEmail(order: any) {
  if (!order.customer_email) return

  // Format items for email template
  const emailItems = order.order_items.map((item: any) => ({
    company: item.locations.companies,
    location: item.locations,
    test: item.tests,
    quantity: item.quantity,
  }))

  const emailHtml = generateOrderConfirmationEmail({
    orderId: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    items: emailItems,
    total: order.total_amount,
  })

  try {
    await resend.emails.send({
      from: "Talcada <orders@talcada.com>",
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: emailHtml,
    })
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError)
    // Don't throw error - order was still created successfully
  }
}