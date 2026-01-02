import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let city = searchParams.get("city") || ""
    let state = searchParams.get("state") || ""
    const zipCode = searchParams.get("zip_code") || ""

    // Handle "City, State" format (e.g., "Los Angeles, CA")
    if (city && city.includes(",")) {
      const parts = city.split(",").map(p => p.trim())
      city = parts[0]
      state = parts[1] || state
    }

    // If city contains a space and two letters at the end, assume it's "City ST" format
    if (city && !state) {
      const parts = city.trim().split(/\s+/)
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1]
        if (lastPart.length === 2 && /^[A-Za-z]+$/.test(lastPart)) {
          state = lastPart
          city = parts.slice(0, -1).join(" ")
        }
      }
    }

    // Normalize: capitalize city, uppercase state
    if (city) {
      city = city
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }
    if (state) {
      state = state.trim().toUpperCase()
    }

    console.log("Searching with:", { city, state, zipCode })

    // Build the query
    let query = supabase
      .from("locations")
      .select(`
        *,
        companies (*)
      `)
      .eq("is_active", true)

    // Add filters
    if (city) {
      query = query.ilike("city", city)
    }
    if (state) {
      query = query.ilike("state", state)
    }
    if (zipCode) {
      query = query.eq("zip_code", zipCode)
    }

    const { data: locations, error: locationsError } = await query

    if (locationsError) {
      console.error("Supabase error:", locationsError)
      throw locationsError
    }

    // Filter out locations without active companies
    const validLocations = (locations || []).filter(
      (location) => location.companies?.is_active
    )

    // Now get tests for each company
    const locationIds = validLocations.map(loc => loc.company_id)
    const uniqueCompanyIds = [...new Set(locationIds)]

    const { data: tests, error: testsError } = await supabase
      .from("tests")
      .select("*")
      .in("company_id", uniqueCompanyIds)
      .eq("is_active", true)

    if (testsError) {
      console.error("Tests error:", testsError)
      throw testsError
    }

    // Attach tests to each location
    const locationsWithTests = validLocations.map(location => ({
      ...location,
      tests: (tests || []).filter(test => test.company_id === location.company_id)
    }))

    return NextResponse.json({
      success: true,
      data: locationsWithTests,
    })
  } catch (error: any) {
    console.error("Search error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}