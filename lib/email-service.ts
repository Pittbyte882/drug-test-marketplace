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