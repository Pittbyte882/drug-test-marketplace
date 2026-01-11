import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")

  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return <>{children}</>
}