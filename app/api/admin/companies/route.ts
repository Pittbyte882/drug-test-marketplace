import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"  // ✅ Changed this line

// GET all companies (only active)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin  // ✅ Changed
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new company
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { data: company, error } = await supabaseAdmin  // ✅ Changed
      .from('companies')
      .insert({
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        logo_url: data.logo_url,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: company,
    })
  } catch (error: any) {
    console.error("Error creating company:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update company
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json()

    const { data: company, error } = await supabaseAdmin  // ✅ Changed
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: company,
    })
  } catch (error: any) {
    console.error("Error updating company:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Soft delete company (set is_active to false)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: "Company ID required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin  // ✅ Changed
      .from('companies')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deactivating company:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}