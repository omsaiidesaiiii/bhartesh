import React, { useState, useEffect } from "react"
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
import { FileText, CheckCircle, Clock, Loader2, Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Assignment, StudentSubmission, fetchAssignmentSubmissions, markAsSubmitted } from "@/lib/assignments-api"
import { format } from "date-fns"
import { toast } from "sonner"

interface SubmissionStatusProps {
  assignments: Assignment[]
}

export function SubmissionStatus({ assignments }: SubmissionStatusProps) {
  const [selectedAsgId, setSelectedAsgId] = useState<string>("")
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedAsgId) {
      loadSubmissions(selectedAsgId)
    }
  }, [selectedAsgId])

  async function loadSubmissions(id: string) {
    setLoading(true)
    const res = await fetchAssignmentSubmissions(id)
    if (res.success) {
      setSubmissions(res.data || [])
    } else {
      toast.error(res.error || "Failed to load submissions")
    }
    setLoading(false)
  }

  async function handleMarkSubmitted(studentId: string) {
    setMarkingId(studentId)
    const res = await markAsSubmitted(selectedAsgId, studentId)
    if (res.success) {
      toast.success("Marked as submitted")
      // Update local state
      setSubmissions(prev => prev.map(s =>
        s.id === studentId ? { ...s, submission: { ...s.submission, status: "SUBMITTED", submittedAt: new Date().toISOString() } } : s
      ))
    } else {
      toast.error(res.error || "Failed to mark as submitted")
    }
    setMarkingId(null)
  }

  const selectedAsg = assignments.find(a => a.id === selectedAsgId)

  const totalStudents = submissions.length
  const submittedCount = submissions.filter(s => s.submission.status === "SUBMITTED").length
  const pendingCount = totalStudents - submittedCount

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-1/2">
          <label className="text-sm font-medium mb-2 block">Select Assignment to Review</label>
          <Select onValueChange={setSelectedAsgId} value={selectedAsgId}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Choose an assignment..." />
            </SelectTrigger>
            <SelectContent>
              {assignments.map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {a.title} (Sem {a.semester})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedAsg && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Due: {selectedAsg.dueDate ? format(new Date(selectedAsg.dueDate), 'MMM dd, yyyy') : 'N/A'}</p>
          </div>
        )}
      </div>

      {selectedAsgId ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Total Students", value: totalStudents.toString(), icon: FileText, color: "text-blue-500" },
              { label: "Submitted", value: submittedCount.toString(), icon: CheckCircle, color: "text-green-500" },
              { label: "Pending", value: pendingCount.toString(), icon: Clock, color: "text-orange-500" },
            ].map((s, i) => (
              <Card key={i} className="bg-card/30 backdrop-blur-sm border-none shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                  <s.icon className={`h-8 w-8 ${s.color} opacity-20`} />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-md border bg-card/50 overflow-hidden">
            {loading ? (
              <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6">Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No students found for this assignment's semester.</TableCell>
                    </TableRow>
                  ) : submissions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="pl-6 font-medium">{sub.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{sub.email}</TableCell>
                      <TableCell>
                        <Badge className={
                          sub.submission.status === "SUBMITTED" ? "bg-green-100 text-green-700 border-none px-2" : "bg-orange-100 text-orange-700 border-none px-2"
                        }>
                          {sub.submission.status === "SUBMITTED" ? "Submitted" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {sub.submission.submittedAt ? format(new Date(sub.submission.submittedAt), 'MMM dd, HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {sub.submission.status === "PENDING" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-[10px] font-bold uppercase tracking-tight"
                            onClick={() => handleMarkSubmitted(sub.id)}
                            disabled={markingId === sub.id}
                          >
                            {markingId === sub.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Mark Submitted
                          </Button>
                        ) : (
                          <span className="text-[10px] text-green-600 font-bold uppercase">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl bg-muted/20">
          <Search className="h-10 w-10 text-muted-foreground opacity-20 mb-4" />
          <p className="text-muted-foreground font-medium">Please select an assignment above to view student submissions.</p>
        </div>
      )}
    </div>
  )
}
