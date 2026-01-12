"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    contact_person: "",
    phone: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      router.push("/login")
      return
    }

    setUser(currentUser)

    const userProfile = await getUserProfile(currentUser.id)
    setProfile(userProfile)
    
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        company_name: userProfile.company_name || "",
        contact_person: userProfile.contact_person || "",
        phone: userProfile.phone || "",
      })
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: formData.full_name,
        company_name: formData.company_name || null,
        contact_person: formData.contact_person || null,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="container py-12">
          <p>Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/account">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Account
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
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              {profile?.account_type === 'individual' && (
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
              )}

              {profile?.account_type === 'company' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

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