"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) return

    const params = new URLSearchParams()
    params.append("city", searchQuery.trim())
    router.push(`/search?${params.toString()}`)
  }

  const handleTestTypeClick = (testType: string) => {
    const params = new URLSearchParams()
    params.append("test_type", testType)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="relative overflow-hidden bg-slate-900 pb-32 pt-20 text-white">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl">
            Talcada Marketplace
          </h1>
          
          <p className="mb-8 text-xl text-slate-300">
            Testing locations everywhere. 
          </p>
          
          <p className="mb-8 text-m text-slate-300">
             Order Diagnostic, Drug & DNA Tests Online
          </p>
          
          

          <form onSubmit={handleSearch} className="mx-auto mb-8 flex max-w-2xl gap-4">
            <Input
              type="text"
              placeholder="Enter city, state, or zip code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <p className="mb-6 text-slate-300">
            Find drug testing, DNA testing, and alcohol screening locations near you
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => handleTestTypeClick("drug")}
              variant="outline"
              className="border border-slate-600 bg-transparent text-white hover:bg-slate-800"
            >
              Drug Testing
            </Button>
            <Button
              onClick={() => handleTestTypeClick("dna")}
              variant="outline"
              className="border border-slate-600 bg-transparent text-white hover:bg-slate-800"
            >
              DNA Testing
            </Button>
            <Button
              onClick={() => handleTestTypeClick("alcohol")}
              variant="outline"
              className="border border-slate-600 bg-transparent text-white hover:bg-slate-800"
            >
              Alcohol Testing
            </Button>
           
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  )
}