
export async function geocodeAddress(address: string, city: string, state: string, zipCode: string) {
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    )
    
    const data = await response.json()
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center
      return { latitude, longitude }
    }
  } catch (error) {
    console.error("Geocoding error:", error)
  }
  
  return { latitude: null, longitude: null }
}