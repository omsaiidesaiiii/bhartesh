"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle2, Loader2, BookOpen, GraduationCap } from "lucide-react"
import { submitMarks, fetchStudentsForMarksEntry, fetchStaffExams, fetchStaffSubjects, type SubmitMarksInput, type SubjectInfo } from "@/app/actions/exams/marks"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface StudentMark {
  id: string
  name: string
  rollNo: string
  marks: string
}

interface ExamOption {
  id: string
  name: string
  code: string
  type: string
}

export function EnterMarks() {
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<'IA1' | 'IA2' | 'IA3' | 'IA4'>('IA1')
  const [maxMarks, setMaxMarks] = useState(20)
  const [marks, setMarks] = useState<StudentMark[]>([])
  const [exams, setExams] = useState<ExamOption[]>([])
  const [subjects, setSubjects] = useState<SubjectInfo[]>([])
  const [departmentName, setDepartmentName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fetchingStudents, setFetchingStudents] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [examsRes, subjectsRes] = await Promise.all([
        fetchStaffExams(),
        fetchStaffSubjects()
      ])
      
      if (examsRes.success && examsRes.data) {
        setExams(examsRes.data)
      } else {
        toast.error(examsRes.error || "Failed to load exams")
      }

      if (subjectsRes.success && subjectsRes.data) {
        setSubjects(subjectsRes.data.subjects)
        setDepartmentName(subjectsRes.data.department?.name || "Unknown Department")
      } else {
        toast.error(subjectsRes.error || "Failed to load subjects")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectChange = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    if (subject) {
      setSelectedSubject(subject)
      // Clear marks when subject changes
      setMarks([])
    }
  }

  const handleFetchStudents = async () => {
    if (!selectedExam || !selectedSubject) {
      toast.error("Please select exam and subject")
      return
    }

    setFetchingStudents(true)
    try {
      const res = await fetchStudentsForMarksEntry(
        selectedExam,
        selectedSubject.id,
        selectedSubject.semester
      )
      
      if (res.success && res.data) {
        const studentMarks: StudentMark[] = res.data.map((student) => ({
          id: student.id,
          name: student.name,
          rollNo: student.profile?.regno || "N/A",
          marks: ""
        }))
        setMarks(studentMarks)
        toast.success(`Loaded ${studentMarks.length} students from Semester ${selectedSubject.semester}`)
      } else {
        toast.error(res.error || "Failed to fetch students")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setFetchingStudents(false)
    }
  }

  const handleMarkChange = (id: string, value: string) => {
    const numValue = parseFloat(value)
    if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > maxMarks)) {
      toast.error(`Marks must be between 0 and ${maxMarks}`)
      return
    }
    setMarks(prev => prev.map(s => s.id === id ? { ...s, marks: value } : s))
  }

  const handleReset = () => {
    setMarks(prev => prev.map(s => ({ ...s, marks: "" })))
    toast.info("All marks cleared")
  }

  const handleSubmit = async () => {
    if (!selectedExam || !selectedSubject) {
      toast.error("Please select exam and subject")
      return
    }

    // Validate that all students have marks entered
    const emptyMarks = marks.filter(s => !s.marks || s.marks === "")
    if (emptyMarks.length > 0) {
      toast.error(`Please enter marks for all ${marks.length} students`)
      return
    }

    // Validate marks are within range
    const invalidMarks = marks.filter(s => {
      const mark = parseFloat(s.marks)
      return isNaN(mark) || mark < 0 || mark > maxMarks
    })
    
    if (invalidMarks.length > 0) {
      toast.error(`Some marks are invalid. Please check and try again.`)
      return
    }

    setSubmitting(true)
    try {
      const submitData: SubmitMarksInput = {
        examId: selectedExam,
        subjectId: selectedSubject.id,
        semester: selectedSubject.semester,
        assessmentType: selectedAssessment,
        maxMarks: maxMarks,
        marks: marks.map(s => ({
          studentId: s.id,
          marks: parseFloat(s.marks)
        }))
      }

      const res = await submitMarks(submitData)
      
      if (res.success) {
        toast.success(res.message || "Marks submitted successfully!")
        setMarks(prev => prev.map(s => ({ ...s, marks: "" })))
        setSelectedExam("")
        setSelectedSubject(null)
      } else {
        toast.error(res.error || "Failed to submit marks")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = selectedExam && selectedSubject

  return (
    <div className="space-y-6">
      {/* Department Info Card */}
      {departmentName && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Department:</span>
              <Badge variant="outline" className="bg-white dark:bg-gray-900">
                {departmentName}
              </Badge>
              <span className="text-sm text-muted-foreground ml-auto">
                {subjects.length} subjects assigned
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/50 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Entry Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Exam Selection */}
            <div className="space-y-2 overflow-x-scroll">
              <label className="text-sm font-medium text-muted-foreground">Select Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose examination..." />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading exams...</SelectItem>
                  ) : exams.length === 0 ? (
                    <SelectItem value="none" disabled>No exams available</SelectItem>
                  ) : (
                    exams.map(exam => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} ({exam.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2 overflow-x-scroll">
              <label className="text-sm font-medium text-muted-foreground">
                Select Subject
              </label>
              <Select 
                value={selectedSubject?.id || ""} 
                onValueChange={handleSubjectChange}
                disabled={loading || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject..." />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                  ) : subjects.length === 0 ? (
                    <SelectItem value="none" disabled>No subjects assigned</SelectItem>
                  ) : (
                    subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{subject.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {subject.code} • Sem {subject.semester}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedSubject && (
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Semester {selectedSubject.semester}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedSubject.code}
                  </Badge>
                </div>
              )}
            </div>

            {/* Assessment Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Assessment Type</label>
              <Select value={selectedAssessment} onValueChange={(v) => setSelectedAssessment(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IA1">Internal Assessment 1</SelectItem>
                  <SelectItem value="IA2">Internal Assessment 2</SelectItem>
                  <SelectItem value="IA3">Internal Assessment 3</SelectItem>
                  <SelectItem value="IA4">Internal Assessment 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Marks */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Max Marks</label>
              <Input 
                type="number" 
                value={maxMarks} 
                onChange={(e) => setMaxMarks(parseInt(e.target.value) || 20)}
                className="w-full" 
                min={1}
                max={100}
              />
            </div>
          </div>

          <Button 
            disabled={!isFormValid || fetchingStudents} 
            onClick={handleFetchStudents}
            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
          >
            {fetchingStudents ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Students...
              </>
            ) : (
              "Fetch Student List"
            )}
          </Button>
        </CardContent>
      </Card>

      {marks.length > 0 && selectedSubject && (
        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                  Direct Mark Entry
                  <Badge variant="outline">{selectedSubject.name}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Entering {selectedAssessment} marks (Max: {maxMarks}) for {marks.length} students • 
                  Semester {selectedSubject.semester}
                </p>
            </div>
            <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleReset}
                  disabled={submitting}
                >
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Reset
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/10 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="pl-6 w-[150px]">Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-[200px]">Marks Obtained (/{maxMarks})</TableHead>
                    <TableHead className="text-right pr-6">Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="pl-6 font-mono text-xs">{student.rollNo}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          placeholder={`0-${maxMarks}`}
                          value={student.marks}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="h-8 focus-visible:ring-blue-500"
                          disabled={submitting}
                          min={0}
                          max={maxMarks}
                          step={0.5}
                        />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                          {student.marks ? (
                               <span className="flex items-center justify-end gap-1 text-[10px] text-green-600">
                                  <CheckCircle2 className="h-3 w-3" /> Valid
                               </span>
                          ) : (
                              <span className="text-[10px] text-muted-foreground italic lowercase">Pending entry</span>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 bg-muted/5 border-t flex justify-between items-center gap-3">
                <span className="text-sm text-muted-foreground italic font-serif">
                  Note: Marks once submitted to registrar cannot be changed here.
                </span>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmit}
                  disabled={submitting || marks.some(s => !s.marks)}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit to Registrar"
                  )}
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

