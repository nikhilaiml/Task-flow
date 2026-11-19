"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { supabase } from "@/lib/supabase"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const isAuthPage = pathname?.startsWith("/auth")
  const isResetPage = pathname === "/auth/reset-password"

  useEffect(() => {
    const checkAuth = async () => {
      // FIX - Naya tarika - ?code= aur ?type=recovery dono check karo
      if (typeof window !== "undefined") {
        const hasRecovery = window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery") || window.location.search.includes("code=")
        if (hasRecovery) {
          // Home pe hai to Reset pe bhejo - code ke saath
          if (pathname === "/") {
            router.push("/auth/reset-password" + window.location.search + window.location.hash)
            setChecking(false)
            return
          }
          // Reset page pe hi hai to yahi rehne do
          if (pathname === "/auth/reset-password") {
            setChecking(false)
            return
          }
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user && !isAuthPage) {
        router.push("/auth/login")
      }
      if (user && isAuthPage && !isResetPage) {
        router.push("/")
      }
      setChecking(false)
    }
    checkAuth()
  }, [pathname, isAuthPage, isResetPage, router])

  if (isAuthPage) {
    return <div className="min-h-screen w-full">{children}</div>
  }

  if (checking) {
    return <div className="min-h-screen w-full flex items-center justify-center text-sm text-zinc-500">Loading...</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}