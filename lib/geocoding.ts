export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Try Google Geocoding API first (more reliable)
    if (process.env.GOOGLE_GEOCODING_API_KEY) {
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`
      const encodedAddress = encodeURIComponent(fullAddress)
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        console.log('✓ Geocoded with Google:', location)
        return {
          lat: location.lat,
          lng: location.lng
        }
      }
    }
    
    // Fallback to OpenStreetMap
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`
    const encodedAddress = encodeURIComponent(fullAddress)
    
    console.log('Geocoding with OSM:', fullAddress)
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TalcadaMarketplace/1.0'
        }
      }
    )
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
      console.log('✓ Geocoded with OSM:', coords)
      return coords
    }
    
    console.log('⚠ No geocoding results found')
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}