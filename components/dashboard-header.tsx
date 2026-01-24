"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  const { customer, logout } = useAuth()

  return (
    <div className="border-b bg-gradient-to-r from-primary/5 via-blue-50 to-slate-50">
      <div className="container flex items-center justify-between py-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Welcome back, {customer?.first_name}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your testing orders and view results
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  )
}