import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { geocodeAddress } from "@/lib/geocoding"

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

    // Auto-geocode the address if coordinates not provided
    let latitude = data.latitude
    let longitude = data.longitude

    if (!latitude || !longitude) {
      console.log('Geocoding new location...')
      const coords = await geocodeAddress(
        data.address,
        data.city,
        data.state,
        data.zip_code
      )
      
      if (coords) {
        latitude = coords.lat
        longitude = coords.lng
        console.log('✓ Auto-geocoded location')
      } else {
        console.log('⚠ Could not geocode location, saving without coordinates')
      }
    }

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
        latitude: latitude,
        longitude: longitude,
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

    // If address changed and no coordinates provided, re-geocode
    if ((updateData.address || updateData.city || updateData.state || updateData.zip_code) && 
        (!updateData.latitude || !updateData.longitude)) {
      
      // Get current location data to fill in missing address parts
      const { data: currentLocation } = await supabase
        .from('locations')
        .select('address, city, state, zip_code')
        .eq('id', id)
        .single()

      if (currentLocation) {
        const coords = await geocodeAddress(
          updateData.address || currentLocation.address,
          updateData.city || currentLocation.city,
          updateData.state || currentLocation.state,
          updateData.zip_code || currentLocation.zip_code
        )
        
        if (coords) {
          updateData.latitude = coords.lat
          updateData.longitude = coords.lng
          console.log('✓ Re-geocoded updated location')
        }
      }
    }

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