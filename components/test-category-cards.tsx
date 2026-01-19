"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Pill, 
  Wine, 
  Scissors, 
  Droplets, 
  Dna, 
  Search, 
  ShoppingCart, 
  Clock,
  X,
  ChevronDown
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"

// Types
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

interface TestCategoryCardsProps {
  tests: Test[]
  categories: TestCategory[]
  location: {
    id: string
    name: string
    address: string
    city: string
    state: string
    zip_code: string
    phone?: string
  }
  company: Company
  searchParams?: { city?: string; state?: string; zipCode?: string }
}

// Icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  pill: <Pill className="h-8 w-8" />,
  wine: <Wine className="h-8 w-8" />,
  scissors: <Scissors className="h-8 w-8" />,
  droplets: <Droplets className="h-8 w-8" />,
  dna: <Dna className="h-8 w-8" />,
}

// Fallback category mapping for tests without category_id (based on test_type string)
const getCategoryFromTestType = (testType: string): string => {
  const type = testType.toLowerCase()
  if (type.includes('hair')) return 'hair'
  if (type.includes('oral') || type.includes('saliva') || type.includes('swab')) return 'oral-fluid'
  if (type.includes('alcohol') || type.includes('etg') || type.includes('breathalyzer')) return 'alcohol'
  if (type.includes('dna') || type.includes('paternity')) return 'dna'
  return 'drug' // Default to drug testing
}

export function TestCategoryCards({ 
  tests, 
  categories, 
  location, 
  company,
  searchParams 
}: TestCategoryCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleTests, setVisibleTests] = useState(6)
  const { addItem } = useCart()
  const { toast } = useToast()

  // Group tests by category
  const testsByCategory = useMemo(() => {
    const grouped: Record<string, Test[]> = {}
    
    categories.forEach(cat => {
      grouped[cat.slug] = []
    })
    
    tests.forEach(test => {
      // Find category by category_id or fallback to test_type string matching
      let categorySlug = 'drug' // default
      
      if (test.category_id) {
        const category = categories.find(c => c.id === test.category_id)
        if (category) categorySlug = category.slug
      } else {
        categorySlug = getCategoryFromTestType(test.test_type)
      }
      
      if (grouped[categorySlug]) {
        grouped[categorySlug].push(test)
      } else {
        // If category doesn't exist, add to drug testing
        if (grouped['drug']) {
          grouped['drug'].push(test)
        }
      }
    })
    
    return grouped
  }, [tests, categories])

  // Get tests for selected category, filtered by search
  const filteredTests = useMemo(() => {
    if (!selectedCategory) return []
    
    const categoryTests = testsByCategory[selectedCategory] || []
    
    if (!searchQuery.trim()) return categoryTests
    
    return categoryTests.filter(test => 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [selectedCategory, testsByCategory, searchQuery])

  const handleCategoryClick = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory(null)
      setSearchQuery("")
      setVisibleTests(6)
    } else {
      setSelectedCategory(slug)
      setSearchQuery("")
      setVisibleTests(6)
    }
  }

  const handleAddToCart = (test: Test) => {
    addItem({
      company: company,
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

    const currentParams = new URLSearchParams()
    if (searchParams?.city) currentParams.append("city", searchParams.city)
    if (searchParams?.state) currentParams.append("state", searchParams.state)
    if (searchParams?.zipCode) currentParams.append("zip_code", searchParams.zipCode)
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

  const handleLoadMore = () => {
    setVisibleTests(prev => prev + 6)
  }

  const selectedCategoryData = categories.find(c => c.slug === selectedCategory)

  return (
    <div className="border-t border-primary/10">
      {/* Header */}
      <div className="p-4 md:p-6">
        <h4 className="font-semibold text-primary text-base md:text-lg mb-4">
          Available Tests ({tests.length})
        </h4>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {categories.map((category) => {
            const testCount = testsByCategory[category.slug]?.length || 0
            const isSelected = selectedCategory === category.slug
            const hasTests = testCount > 0

            return (
              <button
                key={category.id}
                onClick={() => hasTests && handleCategoryClick(category.slug)}
                disabled={!hasTests}
                className={`
                  relative group p-4 rounded-xl border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                    : hasTests
                      ? 'border-border bg-white hover:border-primary/50 hover:shadow-md hover:scale-[1.01]'
                      : 'border-border/50 bg-muted/30 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  mx-auto mb-2 w-12 h-12 rounded-full flex items-center justify-center transition-colors
                  ${isSelected 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-primary/10 text-primary'
                  }
                `}>
                  {categoryIcons[category.icon || 'pill']}
                </div>

                {/* Category Name */}
                <p className={`
                  font-medium text-sm md:text-base text-center leading-tight
                  ${isSelected ? 'text-primary-foreground' : 'text-primary'}
                `}>
                  {category.name}
                </p>

                {/* Test Count Badge */}
                <div className={`
                  mt-2 text-xs font-medium text-center
                  ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}
                `}>
                  {testCount} {testCount === 1 ? 'test' : 'tests'}
                </div>

                {/* Selected Indicator Arrow */}
                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <ChevronDown className="h-5 w-5 text-primary" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Expanded Tests Section */}
      {selectedCategory && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 animate-in slide-in-from-top-2 duration-300">
          {/* Search Bar */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${selectedCategoryData?.name.toLowerCase() || 'tests'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          </div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? `No tests found matching "${searchQuery}"` 
                : 'No tests available in this category'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredTests.slice(0, visibleTests).map((test, index) => (
                  <Card
                    key={test.id}
                    className={`
                      p-4 border-2 border-border/50 bg-white shadow-sm 
                      transition-all duration-300 hover:shadow-md hover:border-primary/50
                      animate-in fade-in-0 slide-in-from-bottom-2
                    `}
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex flex-col h-full">
                      {/* Test Name & Badge */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <h5 className="font-medium text-primary text-sm md:text-base leading-tight flex-1">
                            {test.name}
                          </h5>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {test.test_type}
                          </Badge>
                        </div>

                        {/* Description */}
                        {test.description && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                            {test.description}
                          </p>
                        )}

                        {/* Turnaround Time */}
                        {test.turnaround_time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <Clock className="h-3 w-3" />
                            <span>Results in {test.turnaround_time}</span>
                          </div>
                        )}
                      </div>

                      {/* Price & Add to Cart */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-lg md:text-xl font-bold text-primary">
                          ${test.price.toFixed(2)}
                        </span>
                        <Button
                          onClick={() => handleAddToCart(test)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 shadow-md"
                        >
                          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {visibleTests < filteredTests.length && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    className="px-8"
                  >
                    Show More Tests ({filteredTests.length - visibleTests} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}