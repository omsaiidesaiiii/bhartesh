"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotesList } from "@/components/staff-dashboard/notes-list"
import { UploadNotes } from "@/components/staff-dashboard/upload-notes"
import { FilePlus, FileText, Search, Library, Clock } from "lucide-react"

export default function NotesPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("list")

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    setActiveTab("list")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Study Materials (Notes)</h1>
        <p className="text-muted-foreground">Upload and manage subject-wise lecture notes and reference materials.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
            { label: "Total Notes", value: "24", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Recent Uploads", value: "4", icon: Clock, color: "text-green-600", bg: "bg-green-50" },
            { label: "Subjects Covered", value: "6", icon: Library, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Downloads", value: "1.2k", icon: Search, color: "text-orange-600", bg: "bg-orange-50" },
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Library className="h-4 w-4" /> My Notes
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" /> Upload New Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <NotesList refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <UploadNotes onSuccess={handleUploadSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
