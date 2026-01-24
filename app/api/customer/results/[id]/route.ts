import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get specific test result
    const { data: result, error } = await supabase
      .from("test_results")
      .select(`
        id,
        result_status,
        result_file_url,
        result_data,
        notes,
        completed_at,
        created_at,
        tests (
          name,
          description,
          test_type
        ),
        locations (
          name,
          address,
          city,
          state,
          zip_code,
          phone,
          companies (
            name,
            phone,
            email,
            website
          )
        ),
        orders (
          order_number,
          created_at
        )
      `)
      .eq("id", params.id)
      .eq("customer_id", customerId)
      .single()

    if (error || !result) {
      return NextResponse.json(
        { success: false, error: "Result not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Result detail fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch result" },
      { status: 500 }
    )
  }
}