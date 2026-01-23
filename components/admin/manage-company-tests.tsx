"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Clock } from "lucide-react"

interface Company {
  id: string
  name: string
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
  hours_of_operation?: string
  is_active: boolean
  companies?: { name: string }
}

export function ManageCompanyTests() {
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    hours_of_operation: "",
  })

  useEffect(() => {
    fetchLocations()
    fetchCompanies()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/admin/locations")
      const result = await response.json()
      if (result.success) {
        setLocations(result.data)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
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
      const url = "/api/admin/locations"
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
          description: editingId ? "Location updated successfully" : "Location added successfully",
        })
        setShowForm(false)
        setEditingId(null)
        resetForm()
        fetchLocations()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save location",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (location: Location) => {
    setFormData({
      company_id: location.company_id,
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zip_code: location.zip_code,
      phone: location.phone || "",
      hours_of_operation: location.hours_of_operation || "",
    })
    setEditingId(location.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/locations?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Location deleted successfully",
        })
        fetchLocations()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete location",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      company_id: "",
      name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      phone: "",
      hours_of_operation: "",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary">Manage Locations</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add physical locations for testing companies</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              resetForm()
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Location
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
                  {companies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No companies available
                    </SelectItem>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location-name">Location Name *</Label>
              <Input
                id="location-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Downtown Office"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  required
                />
              </div>
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
                <Label htmlFor="hours">Hours of Operation</Label>
                <Input
                  id="hours"
                  value={formData.hours_of_operation}
                  onChange={(e) => setFormData({ ...formData, hours_of_operation: e.target.value })}
                  placeholder="Mon-Fri: 8AM-5PM"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Example: Mon-Fri: 8AM-5PM, Sat: 9AM-2PM, Sun: Closed
            </p>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingId ? "Update Location" : "Save Location"}
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
            <div className="text-center text-sm text-muted-foreground">Loading locations...</div>
          ) : locations.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No locations added yet. Click "Add Location" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {location.address}, {location.city}, {location.state} {location.zip_code}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>Company: {location.companies?.name}</span>
                      {location.phone && <span>📞 {location.phone}</span>}
                      {location.hours_of_operation && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {location.hours_of_operation}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(location.id)}
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