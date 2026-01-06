import { NextResponse } from 'next/server'
import { 
  sendOrderConfirmationEmail, 
  sendAdminNotificationEmail,
  sendProviderNotificationEmail 
} from '@/lib/email-service'

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET() {
  try {
    console.log('Testing all email notifications...')

    const testOrderData = {
      orderId: 'test-' + Date.now(),
      orderNumber: 'TEST-' + Math.floor(Math.random() * 1000),
      customerName: 'Test Customer',
      customerEmail: 'orders@talcada.com',
      customerPhone: '(951) 555-1234',
    }

    const testItems = [
      {
        company: {
          id: '1',
          name: 'ABC Lab',
          phone: '9515551234',
          email: 'orders@talcada.com',
          logo_url: undefined,
        },
        location: {
          id: '1',
          name: 'ABC Lab Temecula',
          address: '41743 Enterprise Circle N',
          city: 'Temecula',
          state: 'CA',
          zip_code: '92590',
          phone: '9515551234',
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
    ]

    const total = 79.99

    console.log('1. Sending customer confirmation email...')
    const customerResult = await sendOrderConfirmationEmail({
      ...testOrderData,
      items: testItems,
      total,
    })
    console.log('Customer email result:', customerResult.success ? '✅' : '❌')

    // Wait 1 second before next email
    await wait(1500)

    console.log('2. Sending admin notification email...')
    const adminResult = await sendAdminNotificationEmail({
      ...testOrderData,
      items: testItems,
      total,
    })
    console.log('Admin email result:', adminResult.success ? '✅' : '❌')

    // Wait 1 second before next email
    await wait(1500)

    console.log('3. Sending provider notification email...')
    const providerResult = await sendProviderNotificationEmail({
      ...testOrderData,
      providerEmail: 'orders@talcada.com',
      providerName: 'ABC Lab',
      locationName: 'ABC Lab Temecula',
      items: testItems.map(item => ({
        test: item.test,
        quantity: item.quantity,
      })),
      total,
    })
    console.log('Provider email result:', providerResult.success ? '✅' : '❌')

    return NextResponse.json({
      success: true,
      message: 'All test emails sent to orders@talcada.com! Check your inbox.',
      orderNumber: testOrderData.orderNumber,
      results: {
        customer: customerResult.success ? '✅ Sent' : '❌ Failed',
        admin: adminResult.success ? '✅ Sent' : '❌ Failed',
        provider: providerResult.success ? '✅ Sent' : '❌ Failed',
      },
    })
  } catch (error: any) {
    console.error('Test email exception:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}