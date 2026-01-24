"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { FileText, Download, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface TestResult {
  id: string
  result_status: string
  result_file_url?: string
  notes?: string
  completed_at?: string
  created_at: string
  tests: {
    name: string
    test_type: string
  }
  locations: {
    name: string
    companies: {
      name: string
      phone: string
    }
  }
  orders: {
    order_number: string
  }
}

export default function ResultsPage() {
  const { customer, loading: authLoading } = useAuth()
  const router = useRouter()
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login")
    }
  }, [customer, authLoading, router])

  useEffect(() => {
    if (customer) {
      fetchResults()
    }
  }, [customer])

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/customer/results")
      const data = await response.json()
      
      if (data.success) {
        setResults(data.results)
      }
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (authLoading || !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <DashboardHeader />
      <DashboardNav />
      
      <div className="container py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Test Results</h2>
          <p className="text-sm text-muted-foreground">View your completed and pending test results</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="border-border/50 p-12 shadow-sm text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold text-primary">No test results yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your test results will appear here once they're processed
            </p>
            <Link href="/search">
              <Button className="mt-6 bg-primary hover:bg-primary/90">
                Order a Test
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <Card key={result.id} className="border-border/50 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 via-blue-50 to-slate-50 border-b p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        {getStatusIcon(result.result_status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          {result.tests.name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {result.tests.test_type} Test
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Order: {result.orders.order_number}
                        </p>
                      </div>
                    </div>
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-medium capitalize
                      ${getStatusColor(result.result_status)}
                    `}>
                      {result.result_status}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Testing Location</p>
                      <p className="font-medium text-primary">{result.locations.companies.name}</p>
                      <p className="text-sm text-muted-foreground">{result.locations.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {result.result_status === "completed" ? "Completed" : "Submitted"}
                      </p>
                      <p className="font-medium text-primary">
                        {result.completed_at 
                          ? new Date(result.completed_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : new Date(result.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                        }
                      </p>
                    </div>
                  </div>

                  {result.notes && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-4">
                      <p className="text-sm font-medium text-primary mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{result.notes}</p>
                    </div>
                  )}

                  {result.result_status === "completed" && result.result_file_url && (
                    <div className="flex gap-2">
                      <Link href={`/dashboard/results/${result.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <a href={result.result_file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </a>
                    </div>
                  )}

                  {result.result_status === "pending" && (
                    <p className="text-sm text-muted-foreground italic">
                      Your test is being processed. Results will be available soon.
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}