import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")

  // Always render children (which includes login page)
  // The protection happens at the page level
  return <>{children}</>
}