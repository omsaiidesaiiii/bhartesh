"use client"

import { StudentNotices } from "@/components/dashboard/student-notices"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Megaphone, Building2, Bell, AlertTriangle } from "lucide-react"

export default function NoticesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Notices & Announcements</h1>
        <p className="text-muted-foreground">Stay updated with the latest news and announcements from the campus.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
            { label: "New Announcements", value: "3", icon: Bell, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Academic", value: "5", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Important", value: "1", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Unread", value: "2", icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
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

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 w-full md:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="all" className="flex items-center gap-2 px-6">
            <Megaphone className="h-4 w-4" /> All Notices
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2 px-6">
            <Building2 className="h-4 w-4" /> Academic
          </TabsTrigger>
          <TabsTrigger value="important" className="flex items-center gap-2 px-6">
            <AlertTriangle className="h-4 w-4" /> Important
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Campus-wide Announcements</h2>
                <StudentNotices audience="all" />
            </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Academic Updates</h2>
                <StudentNotices audience="academic" />
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
    </div>
  )
}