import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Temporary debug line - REMOVE after testing
    console.log('Received password:', password)
    console.log('Expected password:', process.env.ADMIN_PASSWORD)
    console.log('Match:', password === process.env.ADMIN_PASSWORD)

    // Check password (stored in environment variable)
    if (password === process.env.ADMIN_PASSWORD) {
      // Set a secure cookie
      const cookieStore = await cookies()
      cookieStore.set("admin_authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}