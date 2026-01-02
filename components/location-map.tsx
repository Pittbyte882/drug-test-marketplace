"use client"

import { useEffect, useRef } from "react"
import Map, { Marker } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapPin } from "lucide-react"

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  latitude: number | null
  longitude: number | null
  companies: {
    name: string
  }
}

interface LocationMapProps {
  locations: Location[]
}

export function LocationMap({ locations }: LocationMapProps) {
  const mapRef = useRef<any>(null)

  // Calculate center and bounds
  const validLocations = locations.filter(
    (loc) => loc.latitude !== null && loc.longitude !== null
  )

  if (validLocations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/20 p-8 text-center">
        <div>
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-primary">Map View</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Location coordinates not available. Map will appear when geocoding is added.
          </p>
        </div>
      </div>
    )
  }

  const center = {
    latitude:
      validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) /
      validLocations.length,
    longitude:
      validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) /
      validLocations.length,
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: center.longitude,
        latitude: center.latitude,
        zoom: validLocations.length === 1 ? 13 : 10,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {validLocations.map((location) => (
        <Marker
          key={location.id}
          longitude={location.longitude!}
          latitude={location.latitude!}
          anchor="bottom"
        >
          <div className="relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-xs font-medium shadow-lg">
              {location.companies.name}
            </div>
            <MapPin className="h-8 w-8 fill-red-500 text-red-600" />
          </div>
        </Marker>
      ))}
    </Map>
  )
}