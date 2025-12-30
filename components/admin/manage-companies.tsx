"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Clock } from "lucide-react"

interface Company {
  id: string
  name: string
  description?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  hours_of_operation?: string
  is_active: boolean
}

export function ManageCompanies() {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    logo_url: "",
    hours_of_operation: "",
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      const result = await response.json()
      if (result.success) {
        setCompanies(result.data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = "/api/admin/companies"
      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { id: editingId, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingId ? "Company updated successfully" : "Company added successfully",
        })
        setShowForm(false)
        setEditingId(null)
        resetForm()
        fetchCompanies()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save company",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name,
      description: company.description || "",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
      logo_url: company.logo_url || "",
      hours_of_operation: company.hours_of_operation || "",
    })
    setEditingId(company.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company? This will also delete all associated locations and tests.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/companies?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Company deleted successfully",
        })
        fetchCompanies()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      logo_url: "",
      hours_of_operation: "",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Testing Companies</h2>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              resetForm()
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hours">Hours of Operation</Label>
              <Input
                id="hours"
                value={formData.hours_of_operation}
                onChange={(e) => setFormData({ ...formData, hours_of_operation: e.target.value })}
                placeholder="Mon-Fri: 9am-5pm, Sat: 10am-2pm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Example: Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://company.com/logo.png"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingId ? "Update Company" : "Save Company"}
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
            <div className="text-center text-sm text-muted-foreground">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No companies added yet. Click "Add Company" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{company.name}</h3>
                    {company.description && (
                      <p className="text-sm text-muted-foreground">{company.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {company.phone && <span>📞 {company.phone}</span>}
                      {company.email && <span>✉️ {company.email}</span>}
                      {company.hours_of_operation && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {company.hours_of_operation}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(company.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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