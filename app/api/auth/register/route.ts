import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { hashPassword } from "@/lib/password"
import { Resend } from "resend"
import { SignJWT } from "jose"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create customer
    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      })
      .select("id, email, first_name, last_name, phone")
      .single()

    if (error) {
      console.error("Error creating customer:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create account" },
        { status: 500 }
      )
    }

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")
    const token = await new SignJWT({ customerId: customer.id, email: customer.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secret)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Send welcome email
    try {
      await resend.emails.send({
  from: "Talcada <noreply@test.talcada.com>",  // Changed from talcada.com
  to: email.toLowerCase(),
  subject: "Welcome to Talcada!",
  // ... rest of email

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e293b;">Welcome to Talcada, ${firstName}!</h1>
            <p>Thank you for creating an account with us.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse and order drug testing services</li>
              <li>Track your orders</li>
              <li>View test results</li>
              <li>Manage your account</li>
            </ul>
            <p>If you have any questions, feel free to contact us.</p>
            <p>Best regards,<br>The Talcada Team</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}