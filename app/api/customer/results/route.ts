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
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("customer_token")

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")
    const { payload } = await jwtVerify(token.value, secret)
    const customerId = payload.customerId as string

    // Get test results with all related data
    const { data: results, error } = await supabase
      .from("test_results")
      .select(`
        id,
        result_status,
        result_file_url,
        notes,
        completed_at,
        created_at,
        tests (
          name,
          test_type
        ),
        locations (
          name,
          companies (
            name,
            phone
          )
        ),
        orders (
          order_number
        )
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching results:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch results" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      results: results || [],
    })
  } catch (error) {
    console.error("Results fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch results" },
      { status: 500 }
    )
  }
}