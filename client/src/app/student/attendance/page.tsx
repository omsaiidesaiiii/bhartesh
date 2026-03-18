"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { fetchStudentAttendance } from "@/app/actions/attendance/main"
import { toast } from "sonner"
import { StudentAttendanceReport } from "@/app/actions/attendance/types"


export default function StudentAttendancePage() {
  const { user, loading: authLoading } = useAuth()
  const [report, setReport] = useState<StudentAttendanceReport | null>(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!authLoading && user?.id) {
      const loadAttendance = async (userId: string) => {
        setFetching(true)
        const res = await fetchStudentAttendance(userId)
        if (res.success && res.data) {
          setReport(res.data)
        } else {
          toast.error(res.error || "Failed to load attendance")
        }
        setFetching(false)
      }
      loadAttendance(user.id)
    }
  }, [authLoading, user?.id])

  const subjectBreakdown = useMemo(() => {
    if (!report?.records) return []

    const subjects = new Map<string, { present: number; total: number }>()

    report.records.forEach((rec) => {
      const subjectName = rec.session.subject.name
      const stats = subjects.get(subjectName) || { present: 0, total: 0 }
      stats.total++
      if (rec.status === 'PRESENT') {
        stats.present++
      }
      subjects.set(subjectName, stats)
    })

    return Array.from(subjects.entries()).map(([subject, stats]) => {
      const percentage = Math.round((stats.present / stats.total) * 100)
      let status = "Excellent"
      if (percentage < 75) status = "Critical"
      else if (percentage < 85) status = "Warning"
      else if (percentage < 95) status = "Good"

      return {
        subject,
        percentage,
        present: stats.present,
        total: stats.total,
        status
      }
    })
  }, [report])

  if (authLoading || fetching) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const overallAttendance = report?.percentage ? Math.round(report.percentage) : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Attendance</h2>
        <p className="text-muted-foreground text-sm font-medium">Detailed breakdown of your campus presence.</p>
      </section>

      {/* Overall Attendance - Minimal Hero */}
      <section>
        <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground relative overflow-hidden shadow-lg">
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Total Presence</span>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold tracking-tighter">{overallAttendance}%</span>
              <TrendingUp className="h-6 w-6 opacity-80" />
            </div>
            <p className="opacity-90 text-xs font-medium max-w-[200px] leading-relaxed">
              {overallAttendance >= 75
                ? "You've maintained great attendance this semester. Keep going!"
                : "Caution: Your overall attendance is below the requirements."}
            </p>
          </div>
          <BarChart3 className="absolute -bottom-6 -right-6 h-40 w-40 text-primary-foreground/10 -rotate-12" />
        </div>
      </section>

      {/* Subject-Wise Breakdown */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Breakdown</h3>
        <div className="grid gap-4">
          {subjectBreakdown.length > 0 ? (
            subjectBreakdown.map((item, i) => (
              <div key={i} className="p-5 rounded-3xl bg-card border border-border shadow-sm active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{item.subject}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{item.present} of {item.total} classes</p>
                  </div>
                  <span className={`text-lg font-bold ${item.percentage >= 75 ? 'text-foreground' : 'text-destructive'
                    }`}>{item.percentage}%</span>
                </div>

                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${item.percentage >= 75 ? 'bg-primary' : 'bg-destructive'
                        }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  {item.percentage < 75 && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-destructive uppercase tracking-wider">
                      <AlertTriangle className="h-3 w-3" /> Below 75% Threshold
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center border-2 border-dashed rounded-3xl bg-muted/5">
              <p className="text-muted-foreground">No attendance records found yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Insights Footer */}
      {subjectBreakdown.length > 0 && (
        <section className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/20 border-dashed space-y-3">
          <h4 className="text-sm font-bold text-primary flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Attendance Insight
          </h4>
          <div className="text-xs text-muted-foreground font-medium leading-relaxed">
            {subjectBreakdown.some(s => s.percentage < 75)
              ? "Warning: You have subjects below the 75% threshold. Please prioritize those classes."
              : "Excellent work! You are meeting the attendance requirements in all subjects."}
          </div>
        </section>
      )}
    </div>
  )
}

