"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Clock, ShoppingCart, Search, ChevronDown, ChevronUp } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

interface Company {
  id: string
  name: string
  description?: string
  logo_url?: string
  phone?: string
  email?: string
  website?: string
  hours_of_operation?: string
}

interface Location {
  id: string
  company_id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string
  latitude?: number | null
  longitude?: number | null
  companies: Company
}

interface Test {
  id: string
  company_id: string
  name: string
  description?: string
  price: number
  test_type: string
  turnaround_time?: string
}

interface SearchResult extends Location {
  tests: Test[]
}

export function SearchResults() {
  const searchParams = useSearchParams()
  const city = searchParams.get("city") || ""
  const state = searchParams.get("state") || ""
  const zipCode = searchParams.get("zip_code") || ""
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (city) params.append("city", city)
        if (state) params.append("state", state)
        if (zipCode) params.append("zip_code", zipCode)

        const response = await fetch(`/api/search?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setResults(data.data)
          // Auto-expand first location
          if (data.data.length > 0) {
          setExpandedLocations(new Set([data.data[0].id]))
        }
        } else {
          throw new Error(data.error)
        }
      } catch (error: any) {
        console.error("Error fetching search results:", error)
        toast({
          title: "Error",
          description: "Failed to load testing locations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (city || state || zipCode) {
      fetchResults()
    } else {
      setLoading(false)
    }
  }, [city, state, zipCode, toast])

  const toggleLocation = (locationId: string) => {
    setExpandedLocations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(locationId)) {
        newSet.delete(locationId)
      } else {
        newSet.add(locationId)
      }
      return newSet
    })
  }

  const handleAddToCart = (location: SearchResult, test: Test) => {
    addItem({
      company: location.companies,
      location: {
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        zip_code: location.zip_code,
        phone: location.phone,
      },
      test: test,
      quantity: 1,
    })

    // Get current search parameters to return to same results
    const currentParams = new URLSearchParams()
    if (city) currentParams.append("city", city)
    if (state) currentParams.append("state", state)
    if (zipCode) currentParams.append("zip_code", zipCode)
    const searchUrl = `/search?${currentParams.toString()}`

    toast({
      title: "Added to cart",
      description: (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = searchUrl}
          >
            Continue Shopping
          </Button>
          <Button
            size="sm"
            onClick={() => window.location.href = '/cart'}
          >
            View Cart
          </Button>
        </div>
      ),
    })
  }

  const getSearchLocation = () => {
    if (city && state) return `${city}, ${state}`
    if (city) return city
    if (state) return state
    if (zipCode) return zipCode
    return "your area"
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Testing Locations near {getSearchLocation()}
          </h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-32 animate-pulse rounded-md bg-muted"></div>
                </Card>
              ))}
            </div>
          </div>
          <div className="h-[600px] animate-pulse rounded-lg bg-muted"></div>
        </div>
      </div>
    )
  }

  if (!city && !state && !zipCode) {
    return (
      <div className="container py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const searchValue = formData.get('search') as string
              if (searchValue.trim()) {
                const params = new URLSearchParams()
                params.append("city", searchValue.trim())
                if (searchParams.get("test_type")) {
                  params.append("test_type", searchParams.get("test_type")!)
                }
                window.location.href = `/search?${params.toString()}`
              }
            }}
            className="mx-auto flex max-w-2xl gap-4"
          >
            <Input
              type="text"
              name="search"
              placeholder="Enter city, state, or zip code"
              className="h-14 flex-1 bg-white text-slate-900"
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 bg-[#F59E0B] px-8 font-semibold text-slate-900 hover:bg-[#F59E0B]/90"
            >
              <Search className="mr-2 h-5 w-5" />
              SEARCH
            </Button>
          </form>
        </div>

        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {searchParams.get("test_type") 
              ? `${searchParams.get("test_type")?.charAt(0).toUpperCase()}${searchParams.get("test_type")?.slice(1)} Testing Locations`
              : "Search for Testing Locations"
            }
          </h2>
          <p className="text-muted-foreground">
            Please enter city, state, or zip code to find testing locations near you.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {searchParams.get("test_type") 
            ? `${searchParams.get("test_type")?.charAt(0).toUpperCase()}${searchParams.get("test_type")?.slice(1)} Testing Locations`
            : "Testing Locations"
          }
          {(city || state || zipCode) && ` near ${getSearchLocation()}`}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {results.length} {results.length === 1 ? "location" : "locations"} found
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {results.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold text-primary mb-2">No locations found</h3>
              <p className="text-muted-foreground mb-4">
                No testing locations found for "{getSearchLocation()}". Try searching with a different zip code.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {results.map((location) => (
                <Card key={location.id} className="overflow-hidden border-border/50 shadow-sm">
                  <div className="border-b bg-muted/20 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {location.companies.logo_url && (
                            <img
                              src={location.companies.logo_url}
                              alt={location.companies.name}
                              className="h-12 w-12 rounded object-contain"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-primary">
                              {location.companies.name}
                            </h3>
                            {location.name !== location.companies.name && (
                              <p className="text-sm text-muted-foreground">{location.name}</p>
                            )}
                            {location.companies.description && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {location.companies.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                              {location.address}, {location.city}, {location.state} {location.zip_code}
                            </span>
                          </div>
                          {(location.phone || location.companies.phone) && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{location.phone || location.companies.phone}</span>
                            </div>
                          )}
                          {location.companies.hours_of_operation && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{location.companies.hours_of_operation}</span>
                            </div>
                          )}
                          {location.companies.website && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs">🌐</span>
                              <a 
                                href={location.companies.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                          {/* Accordion for tests */}
        <div className="border-t">
          <button
            onClick={() => toggleLocation(location.id)}
            className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
          >
            <h4 className="font-semibold text-primary">
              Available Tests ({location.tests.length})
            </h4>
            {expandedLocations.has(location.id) ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {expandedLocations.has(location.id) && (
            <div className="px-6 pb-6 pt-0">
              {location.tests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tests currently available at this location.
                </p>
              ) : (
                <div className="space-y-3">
                  {location.tests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-primary">{test.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {test.test_type}
                          </Badge>
                        </div>
                        {test.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
                        )}
                        {test.turnaround_time && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Results in {test.turnaround_time}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex items-center gap-4">
                        <span className="text-lg font-bold text-primary">
                          ${test.price.toFixed(2)}
                        </span>
                        <Button
                          onClick={() => handleAddToCart(location, test)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <Card className="h-full overflow-hidden border-border/50 shadow-sm">
            {results.length > 0 ? (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                  `${results[0].address}, ${results[0].city}, ${results[0].state} ${results[0].zip_code}`
                )}&zoom=14`}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/20 p-8 text-center">
                <div>
                  <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium text-primary">Map View</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Search for a location to see the map
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}