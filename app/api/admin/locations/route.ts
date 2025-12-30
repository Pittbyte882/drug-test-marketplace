import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all locations or by company_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')

    let query = supabase
      .from('locations')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url
        )
      `)
      .order('created_at', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new location
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        company_id: data.company_id,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: location,
    })
  } catch (error: any) {
    console.error("Error creating location:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update location
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json()

    const { data: location, error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: location,
    })
  } catch (error: any) {
    console.error("Error updating location:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete location
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: "Location ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting location:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}