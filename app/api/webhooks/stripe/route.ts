import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY!)


export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Get metadata from session
      const customerId = session.metadata?.customer_id || null
      const customerName = session.metadata?.customer_name || ""
      const customerEmail = session.metadata?.customer_email || session.customer_email || ""
      const customerPhone = session.metadata?.customer_phone || ""
      const itemsData = JSON.parse(session.metadata?.items || "[]")

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      // Calculate total
      const totalAmount = session.amount_total! / 100

      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          total_amount: totalAmount,
          payment_status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .select()
        .single()

      if (orderError) {
        console.error("Error creating order:", orderError)
        throw orderError
      }

      console.log("✅ Order created:", orderNumber)

      // Create order items
if (itemsData.length > 0) {
  const orderItems = itemsData.map((item: any) => ({
    order_id: order.id,
    test_id: item.test_id,
    location_id: item.location_id,
    quantity: item.quantity,
    price: item.price,
    company_id: item.company_id,  // ADD THIS LINE
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
  } else {
    console.log("✅ Order items created")
  }
        // Create test results entries
        const testResults = itemsData.map((item: any) => ({
          order_id: order.id,
          customer_id: customerId,
          test_id: item.test_id,
          location_id: item.location_id,
          company_id: item.company_id,
          result_status: "pending",
        }))

        const { error: resultsError } = await supabase
          .from("test_results")
          .insert(testResults)

        if (resultsError) {
          console.error("Error creating test results:", resultsError)
        } else {
          console.log("✅ Test results created")
        }
      }

      // Send confirmation email
      try {
        // Fetch order details with all related data
        const { data: orderWithDetails } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              tests (name, test_type),
              locations (
                name,
                address,
                city,
                state,
                zip_code,
                phone,
                companies (name, phone)
              )
            )
          `)
          .eq("id", order.id)
          .single()

        if (orderWithDetails && orderWithDetails.order_items.length > 0) {
          await resend.emails.send({
            from: "Talcada <noreply@talcada.com>",
            to: customerEmail,
            subject: `Order Confirmation - ${orderNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; color: white;">
                  <h1 style="margin: 0; font-size: 32px;">Order Confirmed!</h1>
                  <p style="margin: 10px 0 0; font-size: 18px;">Thank you for your order</p>
                </div>

                <div style="padding: 40px 20px;">
                  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h2 style="color: #1e293b; margin: 0 0 15px;">Order Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Order Number:</td>
                        <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: bold;">${orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Order Date:</td>
                        <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Total:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 18px;">$${totalAmount.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>

                  <h2 style="color: #1e293b; margin: 0 0 15px;">Your Tests</h2>
                  ${orderWithDetails.order_items.map((item: any) => `
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <strong style="color: #1e293b;">${item.tests.name}</strong>
                        <strong style="color: #1e293b;">$${item.price.toFixed(2)}</strong>
                      </div>
                      <div style="color: #6b7280; font-size: 14px;">
                        <p style="margin: 5px 0; font-weight: 600;">${item.locations.companies.name}</p>
                        <p style="margin: 5px 0;">📍 ${item.locations.address}, ${item.locations.city}, ${item.locations.state} ${item.locations.zip_code}</p>
                        ${item.locations.phone ? `<p style="margin: 5px 0;">📞 ${item.locations.phone}</p>` : ''}
                      </div>
                    </div>
                  `).join('')}

                  <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin-top: 30px; border-radius: 4px;">
                    <h3 style="color: #1e293b; margin: 0 0 10px; font-size: 16px;">What's Next?</h3>
                    <ol style="margin: 0; padding-left: 20px; color: #6b7280;">
                      <li style="margin: 5px 0;">Check this email for testing location details</li>
                      <li style="margin: 5px 0;">Contact the testing location to schedule your appointment (if required)</li>
                      <li style="margin: 5px 0;">Bring a valid photo ID to your appointment</li>
                    </ol>
                  </div>

                  ${customerId ? `
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://talcada.com'}/dashboard/orders" 
                         style="display: inline-block; background: #1e293b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                        View Order in Dashboard
                      </a>
                    </div>
                  ` : ''}

                  <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    If you have any questions, please contact us at <a href="tel:8004608598" style="color: #2563eb;">(800) 460-8598</a>
                  </p>
                  
                  <p style="color: #6b7280; font-size: 14px;">
                    Best regards,<br/>
                    The Talcada Team
                  </p>
                </div>
              </div>
            `,
          })
          console.log("✅ Confirmation email sent")
        }
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError)
        // Don't fail the webhook if email fails
      }

      console.log("✅ Webhook processing complete for order:", orderNumber)
    } catch (error) {
      console.error("❌ Error processing checkout session:", error)
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}