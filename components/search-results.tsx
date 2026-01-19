"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Clock, Search } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { TestCategoryCards } from "@/components/test-category-cards"

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

interface TestCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  display_order: number
}

interface Test {
  id: string
  company_id: string
  name: string
  description?: string
  price: number
  test_type: string
  category_id?: string
  turnaround_time?: string
}

interface SearchResult extends Location {
  tests: Test[]
}

// Default categories - will be overridden by database values
const DEFAULT_CATEGORIES: TestCategory[] = [
  { id: '1', name: 'Drug Testing', slug: 'drug', description: 'Urine, instant, DOT panels', icon: 'pill', display_order: 1 },
  { id: '2', name: 'Alcohol Testing', slug: 'alcohol', description: 'EtG, breathalyzer testing', icon: 'wine', display_order: 2 },
  { id: '3', name: 'Hair Testing', slug: 'hair', description: 'Hair follicle testing', icon: 'scissors', display_order: 3 },
  { id: '4', name: 'Oral Fluid Testing', slug: 'oral-fluid', description: 'Saliva testing', icon: 'droplets', display_order: 4 },
  { id: '5', name: 'DNA Testing', slug: 'dna', description: 'Paternity and relationship testing', icon: 'dna', display_order: 5 },
]

export function SearchResults() {
  const searchParams = useSearchParams()
  const city = searchParams.get("city") || ""
  const state = searchParams.get("state") || ""
  const zipCode = searchParams.get("zip_code") || ""
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [categories, setCategories] = useState<TestCategory[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null)
  const { toast } = useToast()

  // Get the active location for the map
  const activeLocation = results.find(loc => loc.id === activeLocationId) || results[0]

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/test-categories')
        const data = await response.json()
        if (data.success && data.data?.length > 0) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

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
          // Set first location as active by default
          if (data.data.length > 0) {
            setActiveLocationId(data.data[0].id)
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

  const getSearchLocation = () => {
    if (city && state) return `${city}, ${state}`
    if (city) return city
    if (state) return state
    if (zipCode) return zipCode
    return "your area"
  }

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
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
          <div className="h-[400px] md:h-[600px] animate-pulse rounded-lg bg-muted"></div>
        </div>
      </div>
    )
  }

  if (!city && !state && !zipCode) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mb-6 md:mb-8">
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
            className="mx-auto flex flex-col sm:flex-row max-w-2xl gap-4"
          >
            <Input
              type="text"
              name="search"
              placeholder="Enter city, state, or zip code"
              className="h-12 sm:h-14 flex-1 bg-white text-slate-900"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 sm:h-14 bg-[#F59E0B] px-6 sm:px-8 font-semibold text-slate-900 hover:bg-[#F59E0B]/90"
            >
              <Search className="mr-2 h-5 w-5" />
              SEARCH
            </Button>
          </form>
        </div>

        <Card className="p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">
            {searchParams.get("test_type") 
              ? `${searchParams.get("test_type")?.charAt(0).toUpperCase()}${searchParams.get("test_type")?.slice(1)} Testing Locations`
              : "Search for Testing Locations"
            }
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Please enter city, state, or zip code to find testing locations near you.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Gradient Header - Mobile Optimized */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 border-b rounded-lg mb-6 md:mb-8 py-6 md:py-8 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary break-words">
          {searchParams.get("test_type") 
            ? `${searchParams.get("test_type")?.charAt(0).toUpperCase()}${searchParams.get("test_type")?.slice(1)} Testing Locations`
            : "Testing Locations"
          }
          {(city || state || zipCode) && ` near ${getSearchLocation()}`}
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          {results.length} {results.length === 1 ? "location" : "locations"} found
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {results.length === 0 ? (
            <Card className="p-6 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">No locations found</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                No testing locations found for "{getSearchLocation()}". Try searching with a different zip code.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </Card>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {results.map((location, index) => {
                const isActive = location.id === activeLocationId

                return (
                  <div key={location.id}>
                    <Card 
                      className={`
                        overflow-hidden border-l-4 shadow-md transition-all duration-300 cursor-pointer
                        ${isActive 
                          ? 'border-l-primary ring-2 ring-primary/20 shadow-xl' 
                          : 'border-l-primary/50 hover:shadow-xl hover:border-l-primary'
                        }
                      `}
                      onClick={() => setActiveLocationId(location.id)}
                    >
                      {/* Company Header with Gradient - Mobile Optimized */}
                      <div className={`
                        border-b p-4 md:p-6 transition-colors
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary/10 via-blue-50 to-slate-50' 
                          : 'bg-gradient-to-r from-blue-50 to-slate-50'
                        }
                      `}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                              {location.companies.logo_url && (
                                <img
                                  src={location.companies.logo_url}
                                  alt={location.companies.name}
                                  className="h-10 w-10 md:h-12 md:w-12 rounded object-contain"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg md:text-xl font-semibold text-primary break-words">
                                    {location.companies.name}
                                  </h3>
                                  {isActive && (
                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                      Viewing on map
                                    </span>
                                  )}
                                </div>
                                {location.name !== location.companies.name && (
                                  <p className="text-xs md:text-sm text-muted-foreground">{location.name}</p>
                                )}
                                {location.companies.description && (
                                  <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                                    {location.companies.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-3 md:mt-4 flex flex-col gap-2 text-xs md:text-sm text-muted-foreground">
                              <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span className="break-words">
                                  {location.address}, {location.city}, {location.state} {location.zip_code}
                                </span>
                              </div>
                              {location.companies.hours_of_operation && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
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
                                    className="text-primary hover:underline break-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Visit Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* New Category Cards Component */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <TestCategoryCards
                          tests={location.tests}
                          categories={categories}
                          location={{
                            id: location.id,
                            name: location.name,
                            address: location.address,
                            city: location.city,
                            state: location.state,
                            zip_code: location.zip_code,
                            phone: location.phone,
                          }}
                          company={location.companies}
                          searchParams={{ city, state, zipCode }}
                        />
                      </div>
                    </Card>
                    
                    {/* Gradient divider between cards */}
                    {index < results.length - 1 && (
                      <div className="h-0.5 md:h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent my-4 md:my-6" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Map - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <Card className="h-full overflow-hidden border-border/50 shadow-sm">
            {results.length > 0 && activeLocation ? (
              <div className="h-full flex flex-col">
                {/* Map Header showing current location */}
                <div className="p-3 border-b bg-gradient-to-r from-primary/5 to-blue-50">
                  <p className="text-sm font-medium text-primary truncate">
                    {activeLocation.companies.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeLocation.address}, {activeLocation.city}, {activeLocation.state} {activeLocation.zip_code}
                  </p>
                </div>
                <div className="flex-1">
                  <iframe
                    key={activeLocation.id}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
                      `${activeLocation.address}, ${activeLocation.city}, ${activeLocation.state} ${activeLocation.zip_code}`
                    )}&zoom=15`}
                  />
                </div>
              </div>
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