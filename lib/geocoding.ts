export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`
    const encodedAddress = encodeURIComponent(fullAddress)
    
    console.log('Geocoding address:', fullAddress)
    
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
      console.log('Geocoded coordinates:', coords)
      return coords
    }
    
    console.log('No geocoding results found')
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}