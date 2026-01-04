import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Geocode a search query
async function geocodeQuery(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedQuery = encodeURIComponent(query + ', USA')
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TalcadaMarketplace/1.0'
        }
      }
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let city = searchParams.get("city") || ""
    let state = searchParams.get("state") || ""
    const zipCode = searchParams.get("zip_code") || ""
    const testType = searchParams.get("test_type") || ""

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

    // Geocode the search query
    const searchQuery = zipCode || `${city}${state ? ', ' + state : ''}`
    const searchCoords = await geocodeQuery(searchQuery)

    if (!searchCoords) {
      return NextResponse.json({
        success: false,
        error: "Could not find location"
      }, { status: 404 })
    }

    console.log("Search coordinates:", searchCoords)

    // Get ALL active locations with coordinates
    const { data: locations, error: locationsError } = await supabase
      .from("locations")
      .select(`
        *,
        companies (*)
      `)
      .eq("is_active", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    if (locationsError) {
      console.error("Supabase error:", locationsError)
      throw locationsError
    }

    // Filter locations within 60 miles
    const RADIUS_MILES = 60
    const nearbyLocations = (locations || [])
      .map(location => ({
        ...location,
        distance: calculateDistance(
          searchCoords.lat,
          searchCoords.lng,
          location.latitude!,
          location.longitude!
        )
      }))
      .filter(location => location.distance <= RADIUS_MILES)
      .sort((a, b) => a.distance - b.distance) // Sort by closest first

    console.log(`Found ${nearbyLocations.length} locations within ${RADIUS_MILES} miles`)

    // Filter out locations without active companies
    const validLocations = nearbyLocations.filter(
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

    // Filter by test type if provided
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

    // Filter out locations with no matching tests if test_type is specified
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