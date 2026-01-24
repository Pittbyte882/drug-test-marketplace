"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { FileText, Download, ArrowLeft, Calendar, MapPin, Building2, Phone } from "lucide-react"
import Link from "next/link"

interface TestResultDetail {
  id: string
  result_status: string
  result_file_url?: string
  result_data?: any
  notes?: string
  completed_at?: string
  created_at: string
  tests: {
    name: string
    description: string
    test_type: string
  }
  locations: {
    name: string
    address: string
    city: string
    state: string
    zip_code: string
    phone?: string
    companies: {
      name: string
      phone?: string
      email?: string
      website?: string
    }
  }
  orders: {
    order_number: string
    created_at: string
  }
}

export default function ResultDetailPage() {
  const { customer, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const resultId = params.id as string
  
  const [result, setResult] = useState<TestResultDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login")
    }
  }, [customer, authLoading, router])

  useEffect(() => {
    if (customer && resultId) {
      fetchResultDetail()
    }
  }, [customer, resultId])

  const fetchResultDetail = async () => {
    try {
      const response = await fetch(`/api/customer/results/${resultId}`)
      const data = await response.json()
      
      if (data.success) {
        setResult(data.result)
      } else {
        router.push("/dashboard/results")
      }
    } catch (error) {
      console.error("Failed to fetch result detail:", error)
      router.push("/dashboard/results")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !customer || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <DashboardHeader />
      <DashboardNav />
      
      <div className="container py-8">
        <Link href="/dashboard/results">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Result Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-blue-50 to-slate-50 border-b p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-primary">
                      {result.tests.name}
                    </h1>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      {result.tests.test_type} Test
                    </p>
                    {result.tests.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {result.tests.description}
                      </p>
                    )}
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium capitalize
                    ${result.result_status === "completed" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                    }
                  `}>
                    {result.result_status}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">Test Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {result.completed_at && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-primary">Completed Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.completed_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">Order Number</p>
                      <p className="text-sm text-muted-foreground">
                        {result.orders.order_number}
                      </p>
                    </div>
                  </div>
                </div>

                {result.notes && (
                  <div className="mt-6 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm font-medium text-primary mb-2">Laboratory Notes:</p>
                    <p className="text-sm text-muted-foreground">{result.notes}</p>
                  </div>
                )}

                {result.result_status === "completed" && result.result_file_url && (
                  <div className="mt-6">
                    <a href={result.result_file_url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
                        <Download className="h-4 w-4" />
                        Download Full Report (PDF)
                      </Button>
                    </a>
                  </div>
                )}

                {result.result_status === "pending" && (
                  <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <p className="text-sm font-medium text-yellow-800">
                      Your test results are being processed and will be available soon.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Result Data Card (if available) */}
            {result.result_data && (
              <Card className="border-border/50 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Test Results</h3>
                <div className="space-y-3">
                  {Object.entries(result.result_data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm font-medium text-primary capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Location Info */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Testing Location</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary">
                      {result.locations.companies.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {result.locations.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p>{result.locations.address}</p>
                    <p>
                      {result.locations.city}, {result.locations.state} {result.locations.zip_code}
                    </p>
                  </div>
                </div>

                {(result.locations.companies.phone || result.locations.phone) && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p>{result.locations.companies.phone || result.locations.phone}</p>
                    </div>
                  </div>
                )}

                {result.locations.companies.website && (
                  <div className="mt-4">
                    <a 
                      href={result.locations.companies.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit Website →
                    </a>
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-border/50 shadow-sm p-6 bg-gradient-to-br from-blue-50 to-slate-50">
              <h3 className="text-lg font-semibold text-primary mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about your results, please contact the testing facility directly.
              </p>
              {result.locations.companies.email && (
                <a 
                  href={`mailto:${result.locations.companies.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {result.locations.companies.email}
                </a>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}