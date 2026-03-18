"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchStudentAssignments, Assignment } from "@/lib/assignments-api"
import { format } from "date-fns"
import React from "react"
import { toast } from "sonner"

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [])

  async function loadAssignments() {
    setLoading(true)
    const result = await fetchStudentAssignments()
    if (result.success) {
      setAssignments(result.data || [])
      setError(null)
    } else {
      setError(result.error || "Failed to load assignments")
      // Don't toast here as it shows on every page load if unauthorized
      console.error("Student assignments fetch error:", result.error)
    }
    setLoading(false)
  }

  const pending = assignments.filter(a => a.status === "PENDING")
  const submitted = assignments.filter(a => a.status === "SUBMITTED")

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading assignments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Assignments</h2>
          <p className="text-muted-foreground text-sm font-medium">Keep track of your submissions and deadlines.</p>
        </div>
        <button onClick={loadAssignments} className="text-xs text-primary font-bold hover:underline">
          Refresh
        </button>
      </section>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button onClick={loadAssignments} className="ml-auto underline">Try again</button>
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-2xl border border-border/50 w-full flex">
          <TabsTrigger value="pending" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="submitted" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-muted-foreground">
            Submitted ({submitted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 outline-none">
          {pending.length === 0 ? (
            <div className="text-center p-16 border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/20">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No pending assignments</p>
              <p className="text-xs">You are all caught up!</p>
            </div>
          ) : pending.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-card border border-border shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.subject?.name || "No Subject"}</span>
                  <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>}
                </div>
                <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold">
                  <Calendar className="h-4 w-4" />
                  <span>{item.dueDate ? format(new Date(item.dueDate), 'MMM dd, yyyy') : 'No Date'}</span>
                </div>
                <div className="text-primary text-[11px] font-bold flex items-center gap-1">
                  Submit in Hard Copy <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4 outline-none">
          {submitted.length === 0 ? (
            <div className="text-center p-16 border-2 border-dashed rounded-3xl text-muted-foreground">
              No submitted assignments found.
            </div>
          ) : submitted.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-muted/30 border border-border active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.subject?.name || "No Subject"}</span>
                  <h3 className="text-sm font-bold text-foreground/80 leading-tight">{item.title}</h3>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Submitted
                </span>
                {item.submittedAt && (
                  <span className="text-[10px] text-muted-foreground font-medium"> on {format(new Date(item.submittedAt), 'MMM dd, HH:mm')}</span>
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
