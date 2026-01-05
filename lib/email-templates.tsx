// Helper function to format phone numbers
function formatPhoneNumber(phone?: string): string {
  if (!phone) return "Contact for details"
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (###) ###-####
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // If 11 digits (with country code 1), remove the 1
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  // Return as-is if format is unexpected
  return phone
}

interface OrderEmailProps {
  orderId: string
  orderNumber: string
  customerName: string
  items: Array<{
    company: {
      id: string
      name: string
      phone?: string
      email?: string
      logo_url?: string
    }
    location: {
      id: string
      name: string
      address: string
      city: string
      state: string
      zip_code: string
      phone?: string
    }
    test: {
      id: string
      name: string
      description?: string
      price: number
      turnaround_time?: string
    }
    quantity: number
  }>
  total: number
}

export function generateOrderConfirmationEmail({ 
  orderId, 
  orderNumber,
  customerName, 
  items, 
  total 
}: OrderEmailProps) {
  const itemsHtml = items
    .map(
      (item) => `
    <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #111827;">${item.test.name}</h3>
      <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">${item.test.description || ""}</p>
      ${item.test.turnaround_time ? `<p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">⏱️ Results in ${item.test.turnaround_time}</p>` : ""}
      
      <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 12px;">
        <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">${item.company.name}</h4>
        ${item.location.name !== item.company.name ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">${item.location.name}</p>` : ""}
        <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
          <strong>Address:</strong><br/>
          ${item.location.address}<br/>
          ${item.location.city}, ${item.location.state} ${item.location.zip_code}
        </p>
        <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
          <strong>Phone:</strong> ${formatPhoneNumber(item.location.phone || item.company.phone)}
        </p>
        ${item.company.email ? `<p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
          <strong>Email:</strong> ${item.company.email}
        </p>` : ""}
      </div>
      
      <p style="margin: 12px 0 0 0; font-size: 16px;">
        <strong>Price:</strong> $${(item.test.price * item.quantity).toFixed(2)}
        ${item.quantity > 1 ? ` (${item.quantity} x $${item.test.price.toFixed(2)})` : ""}
      </p>
    </div>
  `,
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Talcada</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                Talcada
              </h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 16px;">Order Confirmation</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px;">
                Thank you, ${customerName}!
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">
                Your order has been confirmed. Please contact the testing location(s) below to schedule your appointment or confirm walk-in availability.
              </p>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0 0 4px 0; color: #92400e; font-size: 14px;">
                  <strong>Order Number:</strong> ${orderNumber}
                </p>
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Order ID:</strong> ${orderId}
                </p>
              </div>
              
              <h3 style="margin: 24px 0 16px 0; color: #111827; font-size: 20px;">Your Testing Details</h3>
              
              ${itemsHtml}
              
              <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align: right; padding: 8px 0;">
                      <span style="color: #6b7280; font-size: 16px;">Total Paid:</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0; width: 120px;">
                      <strong style="color: #111827; font-size: 20px;">$${total.toFixed(2)}</strong>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <h4 style="margin: 0 0 12px 0; color: #111827; font-size: 16px;">Next Steps:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                  <li>Contact the testing location using the phone number provided above</li>
                  <li>Mention your order number: <strong>${orderNumber}</strong></li>
                  <li>Schedule an appointment or confirm walk-in availability</li>
                  <li>Bring a valid photo ID to your appointment</li>
                </ol>
              </div>
              
              <div style="margin-top: 24px; padding: 16px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <p style="margin: 0; color: #075985; font-size: 14px;">
                  <strong>Need Help?</strong> Contact us at <a href="tel:8004608598" style="color: #0ea5e9; text-decoration: none;">(800) 460-8598</a> or email <a href="mailto:support@talcada.com" style="color: #0ea5e9; text-decoration: none;">support@talcada.com</a>
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
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                Testing locations everywhere.
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
}