"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManageCompanies } from "./admin/manage-companies"
import { ManageTests } from "./admin/manage-tests"
import { ManageCompanyTests } from "./admin/manage-company-tests"

export function AdminDashboard() {
  return (
    <div className="container py-12">
      <h1 className="mb-8 text-3xl font-bold text-primary">Admin Dashboard</h1>

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
