import { NextResponse } from 'next/server'
import { resend, EMAIL_CONFIG } from '@/lib/email-service'
import { generateOrderConfirmationEmail } from '@/lib/email-templates'

export async function GET() {
  try {
    console.log('Testing email with:', {
      fromEmail: EMAIL_CONFIG.from,
      apiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
    })

    const testOrderData = {
      orderId: 'test-' + Date.now(),
      orderNumber: 'TEST-' + Math.floor(Math.random() * 1000),
      customerName: 'Test Customer',
      items: [
        {
          company: {
            id: '1',
            name: 'ABC Lab',
            phone: '951-555-1234',
            email: 'contact@abclab.com',
            logo_url: undefined,
          },
          location: {
            id: '1',
            name: 'ABC Lab Temecula',
            address: '41743 Enterprise Circle N',
            city: 'Temecula',
            state: 'CA',
            zip_code: '92590',
            phone: '951555-1234',
          },
          test: {
            id: '1',
            name: '5 Panel Drug Test',
            description: 'Standard 5 panel drug screening',
            price: 79.99,
            turnaround_time: '24-48 hours',
          },
          quantity: 1,
        },
      ],
      total: 79.99,
    }

    const emailHtml = generateOrderConfirmationEmail(testOrderData)

    const { data, error } = await resend.emails.send({
  from: EMAIL_CONFIG.from,
  to: 'orders@talcada.com', // Changed from admin@talcada.com
  subject: `TEST Order Confirmation #${testOrderData.orderNumber}`,
  html: emailHtml,
})

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json({
        success: false,
        error: error,
      }, { status: 500 })
    }

    console.log('Email sent successfully:', data)

    return NextResponse.json({
  success: true,
  message: 'Test email sent to orders@talcada.com', // Updated message
  emailId: data?.id,
})
  } catch (error: any) {
    console.error('Test email exception:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}