"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignmentList } from "@/components/staff-dashboard/assignment-list"
import { CreateAssignment } from "@/components/staff-dashboard/create-assignment"
import { SubmissionStatus } from "@/components/staff-dashboard/submission-status"
import { FilePlus, LayoutGrid, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { fetchAssignments, Assignment } from "@/lib/assignments-api"

export default function AssignmentsPage() {
  const [assignments, setAssignments] = React.useState<Assignment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadAssignments()
  }, [])

  async function loadAssignments() {
    setLoading(true)
    const result = await fetchAssignments()
    if (result.success) {
      setAssignments(result.data || [])
    } else {
      setError(result.error || "Failed to load assignments")
    }
    setLoading(false)
  }

  const activeCount = assignments.length
  const pendingCount = 0 // Still placeholder as we don't have review status easily available without nested fetch

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assignments Management</h1>
        <p className="text-muted-foreground">Distribute learning materials, set deadlines, and track student submissions.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Assignments", value: assignments.length.toString(), icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active This Semester", value: activeCount.toString(), icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Completion Rate", value: "85%", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
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

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> Assignment List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" /> Create New Assignment
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Review Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
          ) : (
            <AssignmentList assignments={assignments} onRefresh={loadAssignments} />
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <CreateAssignment onSuccess={() => {
            loadAssignments()
            // Could switch tab to 'list' here if needed
          }} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <SubmissionStatus assignments={assignments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
