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

    // Get total orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number, total_amount, payment_status, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
    }

    // Get test results stats
    const { data: results, error: resultsError } = await supabase
      .from("test_results")
      .select("result_status")
      .eq("customer_id", customerId)

    if (resultsError) {
      console.error("Error fetching results:", resultsError)
    }

    const pendingResults = results?.filter(r => r.result_status === "pending").length || 0
    const completedResults = results?.filter(r => r.result_status === "completed").length || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: orders?.length || 0,
        pendingResults,
        completedResults,
        recentOrders: orders?.slice(0, 5) || [],
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}