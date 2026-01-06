import { Resend } from 'resend'
import { generateOrderConfirmationEmail } from './email-templates'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || "Talcada Orders <orders@talcada.com>",
  supportEmail: "support@talcada.com",
  adminEmail: process.env.ADMIN_EMAIL || "admin@talcada.com",
}

export async function sendOrderConfirmationEmail(orderData: {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<any>
  total: number
}) {
  const emailHtml = generateOrderConfirmationEmail(orderData)

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: orderData.customerEmail,
      subject: `Order Confirmation #${orderData.orderNumber} - Talcada`,
      html: emailHtml,
    })

    if (error) {
      console.error('Error sending customer email:', error)
      return { success: false, error }
    }

    console.log('Customer email sent successfully to:', orderData.customerEmail)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send customer email:', error)
    return { success: false, error }
  }
}

export async function sendAdminNotificationEmail(orderData: {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<any>
  total: number
}) {
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Order Received! 🎉</h2>
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
        <p><strong>Order ID:</strong> ${orderData.orderId}</p>
        <p><strong>Customer:</strong> ${orderData.customerName}</p>
        <p><strong>Email:</strong> ${orderData.customerEmail}</p>
        <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
        <p><strong>Items:</strong> ${orderData.items.length}</p>
      </div>
      <p>Log into your admin dashboard to view full order details.</p>
    </div>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.adminEmail,
      subject: `New Order #${orderData.orderNumber} - Talcada Marketplace`,
      html: adminHtml,
    })

    if (error) {
      console.error('Error sending admin email:', error)
      return { success: false, error }
    }

    console.log('Admin notification sent successfully to:', EMAIL_CONFIG.adminEmail)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send admin email:', error)
    return { success: false, error }
  }
}

export async function sendProviderNotificationEmail(orderData: {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  providerEmail: string
  providerName: string
  locationName: string
  items: Array<{
    test: {
      name: string
      description?: string
      price: number
    }
    quantity: number
  }>
  total: number
}) {
  const itemsHtml = orderData.items
  .map(
    (item) => `
  <div style="background: #f9fafb; padding: 16px; margin: 12px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #111827;">
      ${item.test.name}
    </p>
    ${item.test.description ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${item.test.description}</p>` : ''}
    <p style="margin: 0; color: #4b5563; font-size: 14px;">
      <strong>Quantity:</strong> ${item.quantity}
    </p>
  </div>
`
  )
  .join('')

  const providerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order - Talcada</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                🎉 Congratulations!
              </h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 18px;">You Have a New Order Request</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
                A customer has placed an order for testing services at <strong>${orderData.locationName}</strong>.
              </p>
              
              <!-- Order Info Box -->
              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px;">
                  <strong>Order Number:</strong> ${orderData.orderNumber}
                </p>
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>Order ID:</strong> ${orderData.orderId}
                </p>
              </div>
              
              <!-- Customer Information -->
              <h3 style="margin: 24px 0 16px 0; color: #111827; font-size: 20px;">Customer Information</h3>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #111827; font-size: 15px;">
                  <strong>Name:</strong> ${orderData.customerName}
                </p>
                <p style="margin: 0 0 8px 0; color: #111827; font-size: 15px;">
                  <strong>Email:</strong> <a href="mailto:${orderData.customerEmail}" style="color: #3b82f6; text-decoration: none;">${orderData.customerEmail}</a>
                </p>
                ${orderData.customerPhone ? `
                <p style="margin: 0; color: #111827; font-size: 15px;">
                  <strong>Phone:</strong> <a href="tel:${orderData.customerPhone}" style="color: #3b82f6; text-decoration: none;">${orderData.customerPhone}</a>
                </p>
                ` : ''}
              </div>
              
              <!-- Test Details -->
              <h3 style="margin: 24px 0 16px 0; color: #111827; font-size: 20px;">Test Order Details</h3>
              ${itemsHtml}
              
              <!-- Divider -->
              <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e5e7eb;"></div>
              
              <!-- Next Steps -->
              <div style="margin-top: 32px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">⚡ Next Steps:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                  <li>The customer will contact you to schedule their appointment</li>
                  <li>Please have the order number ready: <strong>${orderData.orderNumber}</strong></li>
                  <li>Payment has been processed through Talcada</li>
                </ul>
              </div>
              
              <!-- Support -->
              <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Questions about this order? Contact Talcada Support<br/>
                  <a href="tel:8004608598" style="color: #3b82f6; text-decoration: none;">(800) 460-8598</a> | 
                  <a href="mailto:support@talcada.com" style="color: #3b82f6; text-decoration: none;">support@talcada.com</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                <strong>Talcada - The Talcada Edge</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 Talcada. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: orderData.providerEmail,
      subject: `New Order Request #${orderData.orderNumber} - ${orderData.customerName}`,
      html: providerHtml,
    })

    if (error) {
      console.error('Error sending provider email:', error)
      return { success: false, error }
    }

    console.log('Provider notification sent successfully to:', orderData.providerEmail)
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send provider email:', error)
    return { success: false, error }
  }
}