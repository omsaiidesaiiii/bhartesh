"use client"

import React, { useState, useEffect } from "react"
import {
    BarChart3,
    Users,
    BookOpen,
    Search,
    Filter,
    Loader2,
    CalendarDays
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchTodaySessions, fetchStudentAttendance, fetchSubjectAttendanceReport, fetchStaffAttendanceReport } from "@/app/actions/attendance/main"
import { StaffAttendanceReport, SubjectAttendanceReport } from "@/app/actions/attendance/types"
import { fetchStaff } from "@/app/actions/user/main"
import { User } from "@/app/actions/user/types"
import { fetchSubjectsByDepartment, fetchSubjects } from "@/app/actions/subject/main"
import { Subject } from "@/app/actions/subject/types"
import { toast } from "sonner"
import { secureApiClient } from "@/lib/secure-api" // We'll use this through actions mostly

export default function AdminAttendancePage() {
    const [loading, setLoading] = useState(true)
    const [staffList, setStaffList] = useState<User[]>([])
    const [subjectList, setSubjectList] = useState<Subject[]>([])
    const [selectedStaffId, setSelectedStaffId] = useState<string>("")
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
    const [staffReport, setStaffReport] = useState<StaffAttendanceReport[]>([])
    const [subjectReport, setSubjectReport] = useState<SubjectAttendanceReport[]>([])

    useEffect(() => {
        loadInitialData()
    }, [])



    const handleStaffChange = async (staffId: string) => {
        setSelectedStaffId(staffId)
        setLoading(true)
        const res = await fetchStaffAttendanceReport(staffId)
        if (res.success && res.data) {
            setStaffReport(res.data)
        } else {
            toast.error(res.error || "Failed to load staff report")
        }
        setLoading(false)
    }

    const handleSubjectChange = async (subjectId: string) => {
        setSelectedSubjectId(subjectId)
        setLoading(true)
        // const { fetchSubjectAttendanceReport } = await import("@/app/actions/attendance/main") // Imported at top now
        const res = await fetchSubjectAttendanceReport(subjectId)
        if (res.success && res.data) {
            setSubjectReport(res.data)
        } else {
            toast.error(res.error || "Failed to load subject report")
        }
        setLoading(false)
    }

    const loadInitialData = async () => {
        setLoading(true)
        const [staffRes, subjectRes] = await Promise.all([
            fetchStaff(1, 100),
            fetchSubjects()
        ])

        if (staffRes.success && staffRes.data) {
            setStaffList(staffRes.data.users)
        }
        if (subjectRes.success && subjectRes.data) {
            setSubjectList(subjectRes.data)
        }

        setLoading(false)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Overview</h1>
                <p className="text-muted-foreground">Monitor campus-wide attendance trends and staff activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Daily Sessions</CardTitle>
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffReport.length > 0 ? staffReport.length : "--"}</div>
                        <p className="text-xs text-muted-foreground">Sessions by selected staff</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                        <BarChart3 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-- %</div>
                        <p className="text-xs text-muted-foreground">System-wide average</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <Users className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffList.length}</div>
                        <p className="text-xs text-muted-foreground">Reporting today</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="staff" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="staff">Staff-wise Reports</TabsTrigger>
                    <TabsTrigger value="subject">Subject-wise Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-4">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>Staff Attendance Activity</CardTitle>
                            <CardDescription>Select a staff member to view their class conducting history.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <Select onValueChange={handleStaffChange} value={selectedStaffId}>
                                    <SelectTrigger className="w-[250px] bg-background">
                                        <SelectValue placeholder="Select Staff Member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffList.map((staff) => (
                                            <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" disabled={!selectedStaffId || loading} onClick={() => handleStaffChange(selectedStaffId)}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                    Refresh
                                </Button>
                            </div>

                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Semester / Section</TableHead>
                                            <TableHead>Students Marked</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading && selectedStaffId ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                                </TableCell>
                                            </TableRow>
                                        ) : staffReport.length > 0 ? (
                                            staffReport.map((session) => (
                                                <TableRow key={session.id} className="hover:bg-muted/10">
                                                    <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-medium">{session.subject.name}</TableCell>
                                                    <TableCell>{session.semester} / {session.section || 'All'}</TableCell>
                                                    <TableCell>{session._count.records}</TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {session.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                    {selectedStaffId ? "No sessions found for this staff" : "Select a staff member to view records"}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subject" className="space-y-4">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>Subject Performance Breakdown</CardTitle>
                            <CardDescription>Detailed student-wise attendance for selected subject.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <Select onValueChange={handleSubjectChange} value={selectedSubjectId}>
                                    <SelectTrigger className="w-[300px] bg-background">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectList.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id}>{sub.name} ({sub.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Roll Number</TableHead>
                                            <TableHead>Total Sessions</TableHead>
                                            <TableHead>Present</TableHead>
                                            <TableHead>Percentage</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading && selectedSubjectId ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                                </TableCell>
                                            </TableRow>
                                        ) : subjectReport.length > 0 ? (
                                            subjectReport.map((student) => {
                                                const percentage = Math.round((student.present / student.total) * 100) || 0;
                                                return (
                                                    <TableRow key={student.studentId} className="hover:bg-muted/10">
                                                        <TableCell className="font-medium">{student.name}</TableCell>
                                                        <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                                                        <TableCell>{student.total}</TableCell>
                                                        <TableCell>{student.present}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-1.5 bg-muted rounded-full">
                                                                    <div
                                                                        className={`h-full rounded-full ${percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-bold">{percentage}%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${percentage >= 75 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                                                }`}>
                                                                {percentage >= 75 ? 'Safe' : 'Critical'}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                    {selectedSubjectId ? "No records found for this subject" : "Select a subject to view performance"}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
