import { NextResponse } from "next/server"
import { getOrderByNumber } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const order = await getOrderByNumber(params.orderNumber)

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}