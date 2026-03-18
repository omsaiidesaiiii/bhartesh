"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminNotices } from "@/components/staff-dashboard/admin-notices"
import { DepartmentNotices } from "@/components/staff-dashboard/department-notices"
import { Megaphone, Building2, Bell, AlertTriangle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useState, useEffect, useCallback } from "react"
import { CreateNoticeDialog } from "@/components/staff-dashboard/create-notice-dialog"
import { fetchNotices, Notice } from "@/lib/notices-api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function NoticesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotices = useCallback(async () => {
    setLoading(true)
    const res = await fetchNotices({ limit: 100 }) // Fetch more for stats on this page
    if (res.success && res.data) {
      setNotices(res.data.notices)
    } else {
      toast.error(res.error || "Failed to load notices")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadNotices()
  }, [loadNotices])

  const stats = [
    { label: "Total Announcements", value: notices.length.toString(), icon: Bell, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pinned Notices", value: notices.filter(n => n.pinned).length.toString(), icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    {
      label: "Recent (7d)", value: notices.filter(n => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(n.createdAt) > weekAgo
      }).length.toString(), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50"
    },
    { label: "Audience: All", value: notices.filter(n => n.audience === 'ALL').length.toString(), icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Notices & Announcements</h1>
            <p className="text-muted-foreground">Stay updated with the latest news from administration and your department.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Notice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-4 rounded-xl border bg-card/40 backdrop-blur-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} dark:bg-white/5`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="admin" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 w-full md:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="admin" className="flex items-center gap-2 px-6">
            <Megaphone className="h-4 w-4" /> Administration
          </TabsTrigger>
          <TabsTrigger value="department" className="flex items-center gap-2 px-6">
            <Building2 className="h-4 w-4" /> Department
          </TabsTrigger>
          <TabsTrigger value="important" className="flex items-center gap-2 px-6">
            <AlertTriangle className="h-4 w-4" /> Important
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Campus-wide Announcements</h2>
            <AdminNotices />
          </div>
        </TabsContent>

        <TabsContent value="department" className="space-y-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Departmental Updates</h2>
            <DepartmentNotices />
          </div>
        </TabsContent>

        <TabsContent value="important" className="space-y-4">
          <div className="p-6 rounded-xl border-l-8 border-red-500 bg-red-50 dark:bg-red-950/20 shadow-lg">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-red-700 dark:text-red-400">URGENT: Server Maintenance Downtime</h2>
                <p className="text-red-800/80 dark:text-red-300/80 font-medium">
                  The campus learning management system (LMS) will be offline for emergency maintenance starting tonight at 11:00 PM.
                  Please ensure all essential materials are downloaded before then. Expected uptime is tomorrow 05:00 AM.
                </p>
                <div className="pt-2 flex gap-4 text-xs font-bold text-red-700/60 dark:text-red-400/60 uppercase tracking-widest">
                  <span>Posted by: IT Services</span>
                  <span>•</span>
                  <span>Expires: 24 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreateNoticeDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
