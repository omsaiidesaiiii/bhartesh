"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Home, 
  Book, 
  ClipboardList, 
  BarChart3, 
  User,
  Loader2,
  Bell
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { FloatingChatbot } from "@/components/ai/floating-chatbot"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/student/dashboard" },
    { icon: Book, label: "Notes", href: "/student/academics" },
    { icon: ClipboardList, label: "Assignments", href: "/student/assignments" },
    { icon: BarChart3, label: "Attendance", href: "/student/attendance" },
    { icon: User, label: "Profile", href: "/student/profile" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" role="student" />
        
        <SidebarInset className="flex flex-col min-h-screen overflow-hidden">
          {/* Mobile Header - Consumed from site global colors */}
          <header className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
                C
              </div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">CampusLink</h1>
            </div>
            <Link href="/student/notices" className="p-2 rounded-full text-muted-foreground relative">
              <Bell className="h-6 w-6 stroke-[1.5]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            </Link>
          </header>

          {/* Desktop Header */}
          <div className="hidden md:block">
            <SiteHeader />
          </div>

          {/* Main Content Area - Matches Staff Layout style */}
          <main className="flex-1 w-full bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto pb-safe">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Nav - Matches global sidebar-accent and card surface */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border px-6 py-2 flex justify-around items-center h-16 pb-safe safe-area-bottom">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className="flex items-center justify-center relative flex-1 h-full"
                >
                  <item.icon 
                    className={`h-7 w-7 transition-all duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`} 
                    strokeWidth={isActive ? 2.2 : 1.5}
                  />
                </Link>
              )
            })}
          </nav>
           <FloatingChatbot />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}



