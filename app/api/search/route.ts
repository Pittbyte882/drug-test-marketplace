import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const zipCode = searchParams.get('zip_code')

    let query = supabase
      .from('locations')
      .select(`
        *,
        companies (
          id,
          name,
          description,
          logo_url,
          phone,
          email,
          website
        )
      `)
      .eq('is_active', true)
      .eq('companies.is_active', true)

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }
    if (state) {
      query = query.eq('state', state)
    }
    if (zipCode) {
      query = query.eq('zip_code', zipCode)
    }

    const { data: locations, error } = await query.order('city')

    if (error) throw error

    // Get tests for each company
    const companyIds = [...new Set(locations.map(loc => loc.company_id))]
    
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('*')
      .in('company_id', companyIds)
      .eq('is_active', true)

    if (testsError) throw testsError

    // Group tests by company
    const testsByCompany = tests.reduce((acc: any, test) => {
      if (!acc[test.company_id]) {
        acc[test.company_id] = []
      }
      acc[test.company_id].push(test)
      return acc
    }, {})

    // Combine data
    const results = locations.map(location => ({
      ...location,
      tests: testsByCompany[location.company_id] || [],
    }))

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error: any) {
    console.error("Error searching locations:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}