import { NextResponse } from "next/server"
import { 
  sendOrderConfirmationEmail, 
  sendAdminNotificationEmail,
  sendProviderNotificationEmail 
} from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { orderId, orderNumber, customer, items } = await request.json()

    const total = items.reduce((sum: number, item: any) => sum + item.test.price * item.quantity, 0)

    // 1. Send customer confirmation email
    await sendOrderConfirmationEmail({
      orderId,
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      total,
    })

    // 2. Send admin notification email
    await sendAdminNotificationEmail({
      orderId,
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      total,
    })

    // 3. Send provider notifications
    // Group items by company to send one email per provider
    const itemsByCompany = items.reduce((acc: any, item: any) => {
      const companyId = item.company.id
      if (!acc[companyId]) {
        acc[companyId] = {
          company: item.company,
          location: item.location,
          items: [],
        }
      }
      acc[companyId].items.push(item)
      return acc
    }, {})

    // Send email to each provider
    for (const companyId in itemsByCompany) {
      const providerData = itemsByCompany[companyId]
      
      // Only send if company has an email
      if (providerData.company.email) {
        const providerTotal = providerData.items.reduce(
          (sum: number, item: any) => sum + (item.test.price * item.quantity), 
          0
        )

        await sendProviderNotificationEmail({
          orderId,
          orderNumber,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          providerEmail: providerData.company.email,
          providerName: providerData.company.name,
          locationName: providerData.location.name,
          items: providerData.items.map((item: any) => ({
            test: item.test,
            quantity: item.quantity,
          })),
          total: providerTotal,
        })

        console.log(`Provider email sent to ${providerData.company.name}`)
      } else {
        console.log(`No email for provider: ${providerData.company.name}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Email error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}