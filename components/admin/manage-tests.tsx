"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Company {
  id: string
  name: string
}

interface Test {
  id: string
  company_id: string
  name: string
  description?: string
  price: number
  test_type: string
  turnaround_time?: string
  companies?: { name: string }
}

export function ManageTests() {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [tests, setTests] = useState<Test[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    description: "",
    price: "",
    test_type: "drug",
    turnaround_time: "",
  })

  useEffect(() => {
    fetchTests()
    fetchCompanies()
  }, [])

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/admin/tests")
      const result = await response.json()
      if (result.success) {
        setTests(result.data)
      }
    } catch (error) {
      console.error("Error fetching tests:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      const result = await response.json()
      if (result.success) {
        setCompanies(result.data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = "/api/admin/tests"
      const method = editingId ? "PUT" : "POST"
      const body = editingId
        ? { id: editingId, ...formData, price: parseFloat(formData.price) }
        : { ...formData, price: parseFloat(formData.price) }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingId ? "Test updated successfully" : "Test added successfully",
        })
        setShowForm(false)
        setEditingId(null)
        resetForm()
        fetchTests()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save test",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (test: Test) => {
    setFormData({
      company_id: test.company_id,
      name: test.name,
      description: test.description || "",
      price: test.price.toString(),
      test_type: test.test_type,
      turnaround_time: test.turnaround_time || "",
    })
    setEditingId(test.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tests?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Test deleted successfully",
        })
        fetchTests()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete test",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      company_id: "",
      name: "",
      description: "",
      price: "",
      test_type: "drug",
      turnaround_time: "",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Test Types</h2>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              resetForm()
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Test
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="test-name">Test Name *</Label>
              <Input
                id="test-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 10 Panel Drug Test"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the test"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="49.99"
                  required
                />
              </div>

              <div>
                <Label htmlFor="test-type">Test Type *</Label>
                <Select
                  value={formData.test_type}
                  onValueChange={(value) => setFormData({ ...formData, test_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drug">Drug Test</SelectItem>
                    <SelectItem value="alcohol">Alcohol Test</SelectItem>
                    <SelectItem value="dna">DNA Test</SelectItem>
                    <SelectItem value="blood">Blood Test</SelectItem>
                    <SelectItem value="background">Background Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="turnaround">Turnaround Time</Label>
                <Input
                  id="turnaround"
                  value={formData.turnaround_time}
                  onChange={(e) => setFormData({ ...formData, turnaround_time: e.target.value })}
                  placeholder="24-48 hours"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingId ? "Update Test" : "Save Test"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  resetForm()
                }}
                className="border-border/50"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground">Loading tests...</div>
          ) : tests.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No tests added yet. Click "Add Test" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{test.name}</h3>
                    {test.description && (
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    )}
                    <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                      <span>Company: {test.companies?.name}</span>
                      <span>Type: {test.test_type}</span>
                      {test.turnaround_time && <span>Turnaround: {test.turnaround_time}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">${test.price.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(test)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(test.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}