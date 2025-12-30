import { NextResponse } from "next/server"
import { Resend } from "resend"
import { generateOrderConfirmationEmail } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { orderId, orderNumber, customer, items } = await request.json()

    const total = items.reduce((sum: number, item: any) => sum + item.test.price * item.quantity, 0)

    const emailHtml = generateOrderConfirmationEmail({
      orderId,
      orderNumber,
      customerName: customer.name,
      items,
      total,
    })

    await resend.emails.send({
      from: 'Talcada <onboarding@resend.dev>',
      to: customer.email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Email error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}