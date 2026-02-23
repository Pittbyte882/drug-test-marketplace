import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { generateOrderConfirmationEmail } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch orders with related data
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          test_id,
          location_id,
          price,
          employee_data,
          tests (name),
          locations (name, city, state)
        )
      `
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    // Format the data
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total_amount: order.total_amount,
      status: order.status,
      payment_status: order.payment_status,
      account_type: order.account_type,
      company_name: order.company_name,
      created_at: order.created_at,
      items: order.order_items.map((item: any) => ({
        test_name: item.tests?.name,
        location_name: `${item.locations?.name} - ${item.locations?.city}, ${item.locations?.state}`,
        price: item.price,
        employee_info: item.employee_data,
      })),
    }))

    return NextResponse.json({ success: true, data: formattedOrders })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, status } = body

    // Get order details before updating
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    // Send email notification if status changed to completed
    if (status === "completed" && order.customer_email) {
      try {
        await resend.emails.send({
          from: "Talcada <orders@talcada.com>",
          to: order.customer_email,
          subject: `Order ${order.order_number} - Status Updated`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Order Status Update</h2>
              <p>Hello ${order.customer_name},</p>
              <p>Your order <strong>${order.order_number}</strong> has been marked as <strong>${status}</strong>.</p>
              <p>Thank you for choosing Talcada!</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Error sending status update email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}