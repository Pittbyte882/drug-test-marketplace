"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Try to determine if it's a zip code, city, or state
      const trimmed = searchQuery.trim()
      const isZipCode = /^\d{5}(-\d{4})?$/.test(trimmed)
      
      // Check if it's a state abbreviation (2 letters)
      const isState = /^[A-Z]{2}$/i.test(trimmed)
      
      if (isZipCode) {
        router.push(`/search?zip_code=${encodeURIComponent(trimmed)}`)
      } else if (isState) {
        router.push(`/search?state=${encodeURIComponent(trimmed.toUpperCase())}`)
      } else {
        // Check if it contains a comma (City, State format)
        if (trimmed.includes(',')) {
          const parts = trimmed.split(',').map(p => p.trim())
          const city = parts[0]
          const state = parts[1] || ''
          
          const params = new URLSearchParams()
          if (city) params.append('city', city)
          if (state) params.append('state', state.toUpperCase())
          router.push(`/search?${params.toString()}`)
        } else {
          // Treat as city
          router.push(`/search?city=${encodeURIComponent(trimmed)}`)
        }
      }
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 py-20 text-white md:py-32">
      {/* Background pattern or image can go here */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Talcada Marketplace 
          </h1>
          <p className="mb-10 text-xl text-slate-200 md:text-2xl">
            Testing locations everywhere.
          </p>

          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="text"
                placeholder="Enter city, state, or zip code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 flex-1 border-slate-600 bg-white/95 text-lg text-slate-900 placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                required
              />
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 bg-amber-500 px-8 text-lg font-semibold text-slate-900 hover:bg-amber-400"
              >
                <Search className="mr-2 h-5 w-5" />
                SEARCH
              </Button>
            </div>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            Find drug testing, DNA testing, and alcohol screening locations near you
          </p>

          {/* Optional: Quick search buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("Drug Testing")}
              className="border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            >
              Drug Testing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("DNA Testing")}
              className="border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            >
              DNA Testing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("Alcohol Testing")}
              className="border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            >
              Alcohol Testing
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
            className="text-background"
          />
        </svg>
      </div>
    </section>
  )
}