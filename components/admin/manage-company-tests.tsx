"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Search, X } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
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
    })
  }

  // Filter locations based on search query
  const filteredLocations = locations.filter((location) => {
    const query = searchQuery.toLowerCase()
    return (
      location.name.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query) ||
      location.city.toLowerCase().includes(query) ||
      location.state.toLowerCase().includes(query) ||
      location.zip_code.includes(query) ||
      location.companies?.name.toLowerCase().includes(query) ||
      location.phone?.includes(query)
    )
  })

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

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

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

        {/* Search Field */}
        {!showForm && locations.length > 0 && (
          <div className="mb-4 border-t pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, address, city, state, zip, company, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-muted-foreground">
                Found {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'}
              </p>
            )}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground">Loading locations...</div>
          ) : locations.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No locations added yet. Click "Add Location" to get started.
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No locations match your search. Try a different query.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {location.address}, {location.city}, {location.state} {location.zip_code}
                    </p>
                    <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                      <span>Company: {location.companies?.name}</span>
                      {location.phone && <span>📞 {location.phone}</span>}
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