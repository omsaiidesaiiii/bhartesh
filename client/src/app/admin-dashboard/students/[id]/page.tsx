"use client"

import * as React from "react"
import {
    Calendar as CalendarIcon,
    Mail,
    Phone,
    MapPin,
    BookOpen,
    Users,
    Clock,
    Plus,
    MoreHorizontal,
    GraduationCap,
    FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useParams } from "next/navigation"
import { fetchStudentById, updateStudentSection } from "@/app/actions/student/main"
import { Student } from "@/app/actions/student/types"
import { toast } from "sonner"
import { fetchStudentMarks, upsertMark, fetchStudentResults, upsertExternalMark, UpsertExternalMarkData } from "@/app/actions/marks/main"
import { InternalMark, StudentSubjectResult, AssessmentType } from "@/app/actions/marks/types"
import { fetchSubjectsByDepartment, Subject as StudentSubject } from "@/app/actions/subject/main"

export default function StudentProfilePage() {
    const params = useParams()
    const studentId = params.id as string

    const [student, setStudent] = React.useState<Student | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [updating, setUpdating] = React.useState(false)
    const [newSection, setNewSection] = React.useState("")
    const [newSemester, setNewSemester] = React.useState("")
    const [marks, setMarks] = React.useState<InternalMark[]>([])
    const [results, setResults] = React.useState<StudentSubjectResult[]>([])
    const [subjects, setSubjects] = React.useState<StudentSubject[]>([])
    const [isMarksDialogOpen, setIsMarksDialogOpen] = React.useState(false)
    const [selectedSubjectId, setSelectedSubjectId] = React.useState("")
    const [markValue, setMarkValue] = React.useState("")
    const [assessmentType, setAssessmentType] = React.useState<AssessmentType>("IA1")
    const [isExternalMark, setIsExternalMark] = React.useState(false)
    const [submittingMarks, setSubmittingMarks] = React.useState(false)

    const loadStudent = async () => {
        try {
            setLoading(true)
            const studentRes = await fetchStudentById(studentId)

            if (studentRes.success && studentRes.data) {
                const s = studentRes.data
                setStudent(s)
                setNewSection(s.profile?.section || "")
                const semester = s.profile?.semester || 1
                setNewSemester(semester.toString() || "")

                const [marksRes, resultsRes, subjectsRes] = await Promise.all([
                    fetchStudentMarks(studentId, semester),
                    fetchStudentResults(studentId, semester),
                    s.department?.id ? fetchSubjectsByDepartment(s.department.id, semester) : Promise.resolve({ success: false, data: [] })
                ])

                let allSubjects: StudentSubject[] = []
                if (subjectsRes.success && Array.isArray(subjectsRes.data)) {
                    allSubjects = [...subjectsRes.data]
                }

                if (resultsRes.success && Array.isArray(resultsRes.data)) {
                    setResults(resultsRes.data)
                    // Ensure subjects from results are also available for selection
                    resultsRes.data.forEach(r => {
                        if (r.subject && !allSubjects.find(s => s.id === r.subject.id)) {
                            allSubjects.push(r.subject)
                        }
                    })
                }

                setSubjects(allSubjects)

                if (marksRes.success && Array.isArray(marksRes.data)) setMarks(marksRes.data)
            } else {
                toast.error(studentRes.error || "Failed to load student details")
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        if (studentId) {
            loadStudent()
        }
    }, [studentId])

    const handleUpdateSection = async () => {
        if (!student) return

        try {
            setUpdating(true)
            const result = await updateStudentSection(
                student.id,
                newSection,
                newSemester ? parseInt(newSemester) : undefined
            )

            if (result.success) {
                toast.success("Section updated successfully")
                loadStudent()
            } else {
                toast.error(result.error || "Failed to update section")
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to update section")
        } finally {
            setUpdating(false)
        }
    }

    const handleSaveMark = async () => {
        if (!student || !selectedSubjectId || !markValue) return

        try {
            setSubmittingMarks(true)
            let res;
            if (isExternalMark) {
                res = await upsertExternalMark({
                    studentId: student.id,
                    subjectId: selectedSubjectId,
                    marks: parseFloat(markValue),
                    semester: student.profile?.semester || 1,
                    maxMarks: 80
                })
            } else {
                res = await upsertMark({
                    studentId: student.id,
                    subjectId: selectedSubjectId,
                    marks: parseFloat(markValue),
                    assessmentType,
                    semester: student.profile?.semester || 1,
                    maxMarks: 20
                })
            }

            if (res.success) {
                toast.success("Mark saved successfully")
                setIsMarksDialogOpen(false)
                setSelectedSubjectId("")
                setMarkValue("")
                loadStudent()
            } else {
                toast.error(res.error || "Failed to save marks")
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to save marks")
        } finally {
            setSubmittingMarks(false)
        }
    }

    const getSGPA = () => {
        if (!Array.isArray(results) || results.length === 0) return "0.00"
        let totalPoints = 0
        let totalCredits = 0
        results.forEach(res => {
            if (res && res.subject) {
                totalPoints += (res.gradePoint * res.subject.credits)
                totalCredits += res.subject.credits
            }
        })
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
    }

    const getTotalCredits = () => {
        if (!Array.isArray(results)) return 0
        return results.reduce((acc, curr) => acc + (curr?.subject?.credits || 0), 0)
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading student profile...</div>
    }

    if (!student) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Student not found</div>
    }

    const academicRecords = [
        { subject: "Introduction to CS", grade: "A", attendance: "95%" },
        { subject: "Mathematics I", grade: "B+", attendance: "88%" },
        { subject: "Digital Electronics", grade: "A-", attendance: "92%" },
        { subject: "Communication Skills", grade: "A", attendance: "98%" },
    ]

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                    <AvatarImage src={student.profileImageUrl || ""} alt={student.name} />
                    <AvatarFallback className="text-2xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
                        <Badge variant={student.isActive ? "default" : "secondary"}>{student.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{student.profile?.regno || "No ID"}</span>
                        <span>•</span>
                        <span>{student.department?.name || "No Department"}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" /> {student.email}
                        </div>
                        {student.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" /> {student.phone}
                            </div>
                        )}
                        {student.profile?.address && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {student.profile.address}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Update Section</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Class & Section</DialogTitle>
                                <DialogDescription>Move this student to a different class section or semester.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Current Assignment</Label>
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        {student.department?.name || "N/A"} - Semester {student.profile?.semester || "N/A"} - Section {student.profile?.section || "N/A"}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>New Semester</Label>
                                        <Input
                                            type="number"
                                            value={newSemester}
                                            onChange={(e) => setNewSemester(e.target.value)}
                                            placeholder="Enter semester"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Section</Label>
                                        <Select value={newSection} onValueChange={setNewSection}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Section A</SelectItem>
                                                <SelectItem value="B">Section B</SelectItem>
                                                <SelectItem value="C">Section C</SelectItem>
                                                <SelectItem value="D">Section D</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    onClick={handleUpdateSection}
                                    disabled={updating}
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={() => setIsMarksDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Manage Marks
                    </Button>
                    <Button>Edit Profile</Button>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-[1fr_350px]">
                <div className="space-y-6">
                    <Tabs defaultValue="academic" className="w-full">
                        <TabsList>
                            <TabsTrigger value="academic">Academic Details</TabsTrigger>
                            <TabsTrigger value="attendance">Attendance</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="academic" className="space-y-4 mt-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Semester SGPA</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{getSGPA()}</div>
                                        <p className="text-xs text-muted-foreground">Based on current results</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{getTotalCredits()}</div>
                                        <p className="text-xs text-muted-foreground">Total for Semester {student.profile?.semester}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-lg">Semester {student.profile?.semester || 1} Results</CardTitle>
                                        <CardDescription>{student.department?.name || "Department"} • Academic Breakdown</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <FileText className="mr-2 h-4 w-4" /> Export Grade Card
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Subject</TableHead>
                                                <TableHead className="text-center">IA 1</TableHead>
                                                <TableHead className="text-center">IA 2</TableHead>
                                                <TableHead className="text-center">IA 3</TableHead>
                                                <TableHead className="text-center">IA 4</TableHead>
                                                <TableHead className="text-center">External</TableHead>
                                                <TableHead className="text-center font-bold">Total</TableHead>
                                                <TableHead className="text-right">Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Array.isArray(results) && results.length > 0 ? (
                                                results.map((res) => (
                                                    <TableRow key={res.subject.id}>
                                                        <TableCell>
                                                            <div className="font-medium whitespace-nowrap">{res.subject.name}</div>
                                                            <div className="text-xs text-muted-foreground">{res.subject.code} • {res.subject.credits} Credits</div>
                                                        </TableCell>
                                                        <TableCell className="text-center">{res.internals.find(i => i.assessmentType === 'IA1')?.marks ?? "-"}</TableCell>
                                                        <TableCell className="text-center">{res.internals.find(i => i.assessmentType === 'IA2')?.marks ?? "-"}</TableCell>
                                                        <TableCell className="text-center">{res.internals.find(i => i.assessmentType === 'IA3')?.marks ?? "-"}</TableCell>
                                                        <TableCell className="text-center">{res.internals.find(i => i.assessmentType === 'IA4')?.marks ?? "-"}</TableCell>
                                                        <TableCell className="text-center">{res.external?.marks ?? "-"}</TableCell>
                                                        <TableCell className="text-center font-bold">{res.totalMarks.toFixed(1)} / {res.totalMax}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant={res.grade === 'F' ? "destructive" : "default"}>
                                                                {res.grade} ({res.gradePoint})
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                                        No results available for this semester.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="attendance" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attendance Record</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[200px] flex items-center justify-center border-dashed border rounded-md m-4 bg-muted/20">
                                    <p className="text-muted-foreground">Attendance Chart Placeholder</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-1">
                                <span className="text-muted-foreground">Registration No:</span>
                                <span className="font-medium text-right">{student.profile?.regno || "N/A"}</span>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-1">
                                <span className="text-muted-foreground">Date Joined:</span>
                                <span className="font-medium text-right">
                                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                                </span>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-1">
                                <span className="text-muted-foreground">Department:</span>
                                <span className="font-medium text-right">{student.department?.name || "N/A"}</span>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-1">
                                <span className="text-muted-foreground">Current Sem:</span>
                                <span className="font-medium text-right">{student.profile?.semester || "N/A"}</span>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-1">
                                <span className="text-muted-foreground">Section:</span>
                                <span className="font-medium text-right">{student.profile?.section || "N/A"}</span>
                            </div>
                            <Separator />
                            <div className="mt-4">
                                <Label className="text-xs text-muted-foreground uppercase mb-2 block">Assigned Mentor</Label>
                                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">Dr. John Doe</div>
                                        <div className="text-xs text-muted-foreground">Senior Professor</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 text-sm">
                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="font-medium">Library Book Returned</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                                <div>
                                    <p className="font-medium">Fees Paid - Semester 2</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Marks Management Dialog */}
            <Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Internal Marks</DialogTitle>
                        <DialogDescription>
                            Enter marks for {student?.name} (Semester {student.profile?.semester || 1})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                    <SelectTrigger id="subject">
                                        <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.length > 0 ? (
                                            subjects.map((subj) => (
                                                <SelectItem key={subj.id} value={subj.id}>
                                                    {subj.name} ({subj.code})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No subjects found for this semester.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mark-type">Entry Type</Label>
                                <Select
                                    value={isExternalMark ? "external" : "internal"}
                                    onValueChange={(v) => setIsExternalMark(v === "external")}
                                >
                                    <SelectTrigger id="mark-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="internal">Internal Assessment</SelectItem>
                                        <SelectItem value="external">External / Final Exam</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {!isExternalMark && (
                            <div className="space-y-2">
                                <Label htmlFor="assessment-type">Assessment Slot</Label>
                                <Select value={assessmentType} onValueChange={(v) => setAssessmentType(v as AssessmentType)}>
                                    <SelectTrigger id="assessment-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IA1">Internal Assessment 1 (IA1)</SelectItem>
                                        <SelectItem value="IA2">Internal Assessment 2 (IA2)</SelectItem>
                                        <SelectItem value="IA3">Internal Assessment 3 (IA3)</SelectItem>
                                        <SelectItem value="IA4">Internal Assessment 4 (IA4)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="marks">Marks Obtained (Max {isExternalMark ? "80" : "20"})</Label>
                            <Input
                                id="marks"
                                type="number"
                                min={0}
                                max={isExternalMark ? 80 : 20}
                                step={0.5}
                                value={markValue}
                                onChange={(e) => setMarkValue(e.target.value)}
                                placeholder="Enter marks"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsMarksDialogOpen(false)
                                setSelectedSubjectId("")
                                setMarkValue("")
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveMark}
                            disabled={submittingMarks || !selectedSubjectId || !markValue}
                        >
                            {submittingMarks ? "Saving..." : "Save Marks"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
