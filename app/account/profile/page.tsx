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
import { ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { customer, loading: authLoading, refreshCustomer } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  })

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login")
    }
  }, [customer, authLoading, router])

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
      })
      setLoading(false)
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    if (!customer) return

    const { error } = await supabase
      .from('customers')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id)

    if (error) {
      console.error('Error updating profile:', error)
    } else {
      setSuccess(true)
      await refreshCustomer()
      setTimeout(() => setSuccess(false), 3000)
    }

    setSaving(false)
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
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (cannot be changed)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {success && (
                <p className="text-sm text-green-600">Profile updated successfully!</p>
              )}

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}