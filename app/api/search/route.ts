import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let city = searchParams.get("city") || ""
    let state = searchParams.get("state") || ""
    const zipCode = searchParams.get("zip_code") || ""
    const testType = searchParams.get("test_type") || "" // NEW

    // Handle "City, State" format
    if (city && city.includes(",")) {
      const parts = city.split(",").map(p => p.trim())
      city = parts[0]
      state = parts[1] || state
    }

    // Handle "City ST" format
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

    // Normalize
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

    console.log("Searching with:", { city, state, zipCode, testType })

    // Build the query
    let query = supabase
      .from("locations")
      .select(`
        *,
        companies (*)
      `)
      .eq("is_active", true)

    // Add location filters
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

    // Get tests for each company
    const locationIds = validLocations.map(loc => loc.company_id)
    const uniqueCompanyIds = [...new Set(locationIds)]

    let testsQuery = supabase
      .from("tests")
      .select("*")
      .in("company_id", uniqueCompanyIds)
      .eq("is_active", true)

    // Filter by test category if provided
      if (testType) {
          testsQuery = testsQuery.eq("test_category", testType)
        }
    const { data: tests, error: testsError } = await testsQuery

    if (testsError) {
      console.error("Tests error:", testsError)
      throw testsError
    }

    // Attach tests to each location
    const locationsWithTests = validLocations.map(location => ({
      ...location,
      tests: (tests || []).filter(test => test.company_id === location.company_id)
    }))

    // NEW: Filter out locations with no matching tests if test_type is specified
    const filteredLocations = testType 
      ? locationsWithTests.filter(loc => loc.tests.length > 0)
      : locationsWithTests

    return NextResponse.json({
      success: true,
      data: filteredLocations,
    })
  } catch (error: any) {
    console.error("Search error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}