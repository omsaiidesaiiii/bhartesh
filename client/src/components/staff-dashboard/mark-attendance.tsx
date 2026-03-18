import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, X, UserCheck, AlertCircle, Loader2, CalendarX, Clock } from "lucide-react"
import { fetchTodaySessions, fetchSessionStudents, markAttendance, cancelAttendanceSession } from "@/app/actions/attendance/main"
import { AttendanceSession, StudentWithProfile } from "@/app/actions/attendance/types"
import { toast } from "sonner"

export function MarkAttendance() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [students, setStudents] = useState<(StudentWithProfile & { status: 'PRESENT' | 'ABSENT' })[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    const res = await fetchTodaySessions()
    if (res.success && res.data) {
      setSessions(res.data)
    } else {
      toast.error(res.error || "Failed to load sessions")
    }
    setLoading(false)
  }

  const handleSessionChange = async (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setLoading(true)
    const res = await fetchSessionStudents(sessionId)
    if (res.success && res.data) {
      setStudents(res.data.map(s => ({ ...s, status: 'PRESENT' })))
    } else {
      toast.error(res.error || "Failed to load students")
    }
    setLoading(false)
  }

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const toggleStatus = (studentId: string) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId
          ? { ...s, status: s.status === "PRESENT" ? "ABSENT" : "PRESENT" }
          : s
      )
    )
  }

  const handleSave = async () => {
    if (!selectedSessionId) return
    setMarking(true)
    const records = students.map(s => ({
      studentId: s.id,
      status: s.status,
    }))
    const res = await markAttendance(selectedSessionId, records)
    if (res.success) {
      toast.success("Attendance marked successfully!")
      loadSessions()
    } else {
      toast.error(res.error || "Failed to save attendance")
    }
    setMarking(false)
  }

  const handleCancelClass = async () => {
    if (!selectedSessionId) return
    if (!confirm("Are you sure you want to cancel this class? Attendance will not be calculated for cancelled classes.")) return

    setCancelling(true)
    const res = await cancelAttendanceSession(selectedSessionId)
    if (res.success) {
      toast.success("Class marked as cancelled")
      loadSessions()
      setSelectedSessionId("")
      setStudents([])
    } else {
      toast.error(res.error || "Failed to cancel class")
    }
    setCancelling(false)
  }

  const selectedSession = sessions.find(s => s.id === selectedSessionId)

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Schedule for Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 items-end">
            <div className="space-y-2 flex-1 min-w-[300px]">
              <label className="text-sm font-medium text-muted-foreground">Select Slot</label>
              <Select onValueChange={handleSessionChange} value={selectedSessionId}>
                <SelectTrigger className="bg-background border-muted shadow-sm">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id} disabled={session.status === 'CANCELLED'}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{session.timetable?.subject.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({session.semester} Sem {session.section || 'All'})
                        </span>
                        <span className="text-muted-foreground">({formatTime(session.startTime)} - {formatTime(session.endTime)})</span>
                        <Badge variant="outline" className={`ml-2 text-[10px] ${session.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                          session.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                          {session.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                  {sessions.length === 0 && (
                    <SelectItem value="none" disabled>No sessions found for today</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              {selectedSessionId && selectedSession?.status !== 'COMPLETED' && selectedSession?.status !== 'CANCELLED' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelClass}
                  disabled={cancelling}
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarX className="h-4 w-4 mr-2" />}
                  Cancel Class
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSessionId && students.length > 0 && selectedSession?.status !== 'CANCELLED' && (
        <Card className="overflow-hidden border-none shadow-lg">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {selectedSession?.timetable?.subject.name}
                <span className="text-muted-foreground font-normal ml-2">
                  ({selectedSession?.semester} Sem {selectedSession?.section || 'All'})
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Time Slot: {formatTime(selectedSession?.startTime || "")} - {formatTime(selectedSession?.endTime || "")}
              </p>
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                <UserCheck className="h-4 w-4" /> P: {students.filter(s => s.status === "PRESENT").length}
              </span>
              <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                <AlertCircle className="h-4 w-4" /> A: {students.filter(s => s.status === "ABSENT").length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="pl-6">Reg No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/5 transition-colors">
                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">{student.profile?.regno || 'N/A'}</TableCell>
                        <TableCell className="font-medium text-sm">{student.name}</TableCell>
                        <TableCell>
                          <Badge className={
                            student.status === "PRESENT"
                              ? "bg-green-100 text-green-700 border-none px-2 py-0.5 text-[10px]"
                              : "bg-red-100 text-red-700 border-none px-2 py-0.5 text-[10px]"
                          }>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleStatus(student.id)}
                            className={student.status === "PRESENT" ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                          >
                            {student.status === "PRESENT" ? "Mark Absent" : "Mark Present"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 bg-muted/20 border-t flex justify-between items-center">
                  <p className="text-xs text-muted-foreground italic">
                    {selectedSession?.isLocked ? "This session is locked and cannot be edited." : "Review the list carefully before saving."}
                  </p>
                  <Button
                    onClick={handleSave}
                    disabled={marking || selectedSession?.isLocked}
                    className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
                  >
                    {marking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {selectedSession?.isLocked ? "Session Locked" : "Submit Attendance"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {selectedSessionId && students.length === 0 && !loading && selectedSession?.status !== 'CANCELLED' && (
        <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
          <p className="text-muted-foreground">No students found for this session.</p>
        </div>
      )}

      {selectedSession?.status === 'CANCELLED' && (
        <div className="p-12 text-center border-2 border-dashed border-red-200 rounded-xl bg-red-50/30">
          <CalendarX className="h-10 w-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700">Class Cancelled</h3>
          <p className="text-red-600/70 max-w-sm mx-auto mt-2">
            This class session was marked as cancelled. Attendance records are not required and will not be calculated.
          </p>
        </div>
      )}
    </div>
  )
}
