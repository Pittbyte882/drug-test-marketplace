import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("customer_token")

    if (!token) {
      return NextResponse.json({ success: false, customer: null })
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")
    const { payload } = await jwtVerify(token.value, secret)

    // Get customer data
    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, email, first_name, last_name, phone")
      .eq("id", payload.customerId)
      .single()

    if (error || !customer) {
      // Invalid token, clear it
      cookieStore.delete("customer_token")
      return NextResponse.json({ success: false, customer: null })
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
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, customer: null })
  }
}