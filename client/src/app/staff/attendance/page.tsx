"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkAttendance } from "@/components/staff-dashboard/mark-attendance"
import { AttendanceHistory } from "@/components/staff-dashboard/attendance-history"
import { UserCheck, History, BarChart3, CalendarDays, Loader2 } from "lucide-react"
import { fetchMyAttendanceReport } from "@/app/actions/attendance/main"
import { getUserInfo } from "@/lib/session"
import { toast } from "sonner"

export default function AttendancePage() {
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    const res = await fetchMyAttendanceReport()
    if (res.success && res.data) {
      // Aggregate data by subject
      const subjectStats = new Map<string, { name: string; totalRecords: number; completedRecords: number; totalStudents: number; presentStudents: number }>()

      res.data.forEach((session: any) => {
        if (session.status === 'CANCELLED') return;

        const subjectId = session.subjectId
        const stats = subjectStats.get(subjectId) || {
          name: session.subject.name,
          totalRecords: 0,
          completedRecords: 0,
          totalStudents: 0,
          presentStudents: 0
        }

        stats.totalRecords++
        if (session.status === 'COMPLETED') {
          stats.completedRecords++
          // Since we don't have individual record counts per session in this report yet (just the count), 
          // we'll use a simplified average or just show session counts.
          // Actually _count.records gives us the number of students marked.
          stats.totalStudents += session._count.records
          // For a more accurate "Percentage", we'd need record details.
          // For now, let's show "Sessions Conducted" as the primary metric for staff analytics.
        }
        subjectStats.set(subjectId, stats)
      })

      setAnalyticsData(Array.from(subjectStats.values()))
    } else if (res.error) {
      toast.error(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Management</h1>
        <p className="text-muted-foreground">Mark daily attendance and monitor student participation.</p>
      </div>

      <Tabs defaultValue="mark" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="mark" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" /> Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Attendance History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Class-wise Reports
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Date-wise View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-4">
          <MarkAttendance />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AttendanceHistory />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {analyticsData.map((stat, i) => {
                  const completionRate = Math.round((stat.completedRecords / stat.totalRecords) * 100) || 0
                  return (
                    <div key={i} className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{stat.name}</h3>
                        <p className="text-sm text-muted-foreground">Syllabus Coverage / Sessions</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{stat.completedRecords} / {stat.totalRecords}</div>
                        <p className="text-[10px] text-muted-foreground">
                          {completionRate}% Slots Completed
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-8 text-center">
                <BarChart3 className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900">Advanced Analytics Hub</h3>
                <p className="text-blue-700/70 max-w-md mx-auto mt-2">
                  In the next update, we'll introduce student retention heatmaps and monthly attendance trends for each of your classes.
                </p>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="p-8 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm flex flex-col items-center justify-center text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold">Calendar Attendance View</h2>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              A visual calendar representation of your attendance sessions. This view will help you identify patterns and gaps in daily records.
            </p>
            <div className="mt-6 p-4 border rounded-lg bg-muted/20 w-full max-w-lg">
              <p className="text-sm font-mono text-muted-foreground">Feature in development...</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
