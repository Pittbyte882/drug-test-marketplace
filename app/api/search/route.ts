import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let city = searchParams.get("city") || ""
    let state = searchParams.get("state") || ""
    const zipCode = searchParams.get("zip_code") || ""

    // Handle "City, State" format (e.g., "Temecula, CA" or "temecula ca")
    if (city && city.includes(",")) {
      const parts = city.split(",").map(p => p.trim())
      city = parts[0]
      state = parts[1] || state
    }

    // If city contains a space and two letters at the end, assume it's "City ST" format
    // e.g., "Temecula CA" or "Los Angeles CA"
    if (city && !state) {
      const parts = city.trim().split(/\s+/)
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1]
        // Check if last part is 2 letters (likely a state abbreviation)
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
        companies (*),
        tests:tests!tests_company_id_fkey (*)
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

    const { data: locations, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    // Filter out locations without active companies or tests
    const validLocations = (locations || []).filter(
      (location) =>
        location.companies?.is_active &&
        location.tests?.some((test: any) => test.is_active)
    )

    // Filter tests to only include active ones
    const locationsWithActiveTests = validLocations.map((location) => ({
      ...location,
      tests: location.tests?.filter((test: any) => test.is_active) || [],
    }))

    return NextResponse.json({
      success: true,
      data: locationsWithActiveTests,
    })
  } catch (error: any) {
    console.error("Search error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}