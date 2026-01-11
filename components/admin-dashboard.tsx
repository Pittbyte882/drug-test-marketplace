"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { ManageCompanies } from "./admin/manage-companies"
import { ManageTests } from "./admin/manage-tests"
import { ManageCompanyTests } from "./admin/manage-company-tests"

export function AdminDashboard() {
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <ManageCompanies />
        </TabsContent>

        <TabsContent value="tests">
          <ManageTests />
        </TabsContent>

        <TabsContent value="locations">
          <ManageCompanyTests />
        </TabsContent>
      </Tabs>
    </div>
  )
}
