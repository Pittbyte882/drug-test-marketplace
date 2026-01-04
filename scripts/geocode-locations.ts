require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function geocodeAddress(address: string, city: string, state: string, zipCode: string) {
  try {
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`
    const encodedAddress = encodeURIComponent(fullAddress)
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
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

async function geocodeAllLocations() {
  console.log('Starting geocoding process...')
  
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .or('latitude.is.null,longitude.is.null')
  
  if (error) {
    console.error('Error fetching locations:', error)
    return
  }
  
  console.log(`Found ${locations?.length || 0} locations to geocode`)
  
  if (!locations || locations.length === 0) {
    console.log('No locations need geocoding!')
    return
  }
  
  for (const location of locations) {
    console.log(`\nGeocoding: ${location.name} - ${location.city}, ${location.state}`)
    
    const coords = await geocodeAddress(
      location.address,
      location.city,
      location.state,
      location.zip_code
    )
    
    if (coords) {
      const { error: updateError } = await supabase
        .from('locations')
        .update({
          latitude: coords.lat,
          longitude: coords.lng
        })
        .eq('id', location.id)
      
      if (updateError) {
        console.error(`Failed to update ${location.name}:`, updateError)
      } else {
        console.log(`✓ Updated ${location.name}: ${coords.lat}, ${coords.lng}`)
      }
      
      // Wait 1 second between requests to be nice to the free API
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      console.log(`✗ Could not geocode ${location.name}`)
    }
  }
  
  console.log('\n✅ Geocoding complete!')
}

geocodeAllLocations()