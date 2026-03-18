"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExamSchedule } from "@/components/staff-dashboard/exam-schedule"
import { EnterMarks } from "@/components/staff-dashboard/enter-marks"
import { ClassResultsSummary } from "@/components/staff-dashboard/results-summary"
import { ClipboardList, Calendar, PieChart, PenTool, Loader2 } from "lucide-react"
import { fetchExams, fetchResultOverview } from "@/app/actions/exams/main"
import { Exam, ResultOverview } from "@/app/actions/exams/types"
import { toast } from "sonner"

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [results, setResults] = useState<ResultOverview[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [examsRes, resultsRes] = await Promise.all([
        fetchExams(),
        fetchResultOverview()
      ])

      if (examsRes.success) setExams(examsRes.data || [])
      if (resultsRes.success) setResults(resultsRes.data || [])

      if (!examsRes.success) toast.error(examsRes.error || "Failed to load exams")
      if (!resultsRes.success) toast.error(resultsRes.error || "Failed to load results")
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Exams & Grading</h1>
        <p className="text-muted-foreground">Manage examination schedules and evaluate student performance.</p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Exam Schedule
          </TabsTrigger>
          <TabsTrigger value="entry" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" /> Enter Marks
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" /> Class-wise Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
          ) : (
            <ExamSchedule exams={exams} />
          )}
        </TabsContent>

        <TabsContent value="entry" className="space-y-4">
          <EnterMarks />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
          ) : (
            <ClassResultsSummary results={results} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
