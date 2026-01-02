"use client"

import { MapPin } from "lucide-react"

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  latitude?: number | null
  longitude?: number | null
  companies: {
    name: string
  }
}

interface LocationMapProps {
  locations: Location[]
}

export function LocationMap({ locations }: LocationMapProps) {
  return (
    <div className="flex h-full items-center justify-center bg-muted/20 p-8 text-center">
      <div>
        <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-primary">Map View</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Showing {locations.length} testing {locations.length === 1 ? 'location' : 'locations'}
        </p>
        {locations.length > 0 && (
          <div className="mt-4 max-w-xs space-y-2 text-left">
            {locations.slice(0, 5).map((loc) => (
              <div key={loc.id} className="rounded border border-border/30 bg-card p-2 text-xs">
                <p className="font-semibold text-primary">{loc.companies.name}</p>
                <p className="text-muted-foreground">
                  {loc.city}, {loc.state}
                </p>
              </div>
            ))}
            {locations.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{locations.length - 5} more location{locations.length - 5 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Interactive map coming soon
        </p>
      </div>
    </div>
  )
}