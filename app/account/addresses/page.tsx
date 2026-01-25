"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, MapPin, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AddressesPage() {
  const router = useRouter()
  const { customer, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<any[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    is_default: false,
  })

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login")
    }
  }, [customer, authLoading, router])

  useEffect(() => {
    if (customer) {
      loadAddresses()
    }
  }, [customer])

  const loadAddresses = async () => {
    if (!customer) return

    const { data } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('customer_id', customer.id)
      .order('is_default', { ascending: false })

    setAddresses(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (!customer) return

    // If setting as default, unset other defaults
    if (formData.is_default) {
      await supabase
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('customer_id', customer.id)
    }

    const { error } = await supabase
      .from('saved_addresses')
      .insert({
        customer_id: customer.id,
        ...formData,
      })

    if (!error) {
      setShowDialog(false)
      setFormData({
        label: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        is_default: false,
      })
      loadAddresses()
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    const { error } = await supabase
      .from('saved_addresses')
      .delete()
      .eq('id', id)

    if (!error) {
      loadAddresses()
    }
  }

  const handleSetDefault = async (id: string) => {
    if (!customer) return

    // Unset all defaults
    await supabase
      .from('saved_addresses')
      .update({ is_default: false })
      .eq('customer_id', customer.id)

    // Set new default
    await supabase
      .from('saved_addresses')
      .update({ is_default: true })
      .eq('id', id)

    loadAddresses()
  }

  if (authLoading || loading) {
    return (
      <>
        <SiteHeader />
        <div className="container py-12">
          <p>Loading...</p>
        </div>
      </>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Saved Addresses</h1>
            
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label (e.g., Home, Office)</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_default" className="font-normal">
                      Set as default address
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? "Saving..." : "Save Address"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {addresses.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No saved addresses</h2>
                <p className="mb-6">Add an address for faster checkout</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <Card key={address.id} className="p-6 relative">
                  {address.is_default && (
                    <span className="absolute top-4 right-4 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">{address.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {address.address}<br />
                      {address.city}, {address.state} {address.zip_code}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}