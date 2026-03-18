"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PYQList } from "@/components/staff-dashboard/pyq-list"
import { UploadPYQ } from "@/components/staff-dashboard/upload-pyq"
import { FileSearch, FileUp, Sparkles, History } from "lucide-react"

export default function PYQPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("list")

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    setActiveTab("list")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Previous Year Question Papers</h1>
        <p className="text-muted-foreground">Access and share previous academic years' question papers for reference.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
            { label: "Available Papers", value: "112", icon: FileSearch, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Commonly Searched", value: "Math 101", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "My Contributions", value: "8", icon: History, color: "text-orange-600", bg: "bg-orange-50" },
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
            <FileSearch className="h-4 w-4" /> Browse PYQs
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" /> Contribute Paper
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <PYQList refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <UploadPYQ onSuccess={handleUploadSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
