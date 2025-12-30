import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all tests or by company_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')

    let query = supabase
      .from('tests')
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
    console.error("Error fetching tests:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new test
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { data: test, error } = await supabase
      .from('tests')
      .insert({
        company_id: data.company_id,
        name: data.name,
        description: data.description,
        price: data.price,
        test_type: data.test_type,
        turnaround_time: data.turnaround_time,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: test,
    })
  } catch (error: any) {
    console.error("Error creating test:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update test
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json()

    const { data: test, error } = await supabase
      .from('tests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: test,
    })
  } catch (error: any) {
    console.error("Error updating test:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete test
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: "Test ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting test:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}