"use client"

import * as React from "react"
import {
    Search,
    Filter,
    Users,
    GraduationCap,
    ArrowRight,
    MoreHorizontal,
    Plus,
    AlertCircle,
    Download,
    Upload,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { fetchStudents, fetchStudentStats, bulkPromoteStudents, createStudent, updateStudent, bulkCreateStudents } from "@/app/actions/student/main"
import { Student, StudentStats, CreateStudentData } from "@/app/actions/student/types"
import { toast } from "sonner"
import { fetchCourses } from "@/app/actions/course/main"
import type { Course } from "@/app/actions/course/types"
import { fetchDepartments } from "@/app/actions/setup/main"
import type { Department } from "@/app/actions/setup/types"

export default function StudentsPage() {
    const [students, setStudents] = React.useState<Student[]>([])
    const [stats, setStats] = React.useState<StudentStats | null>(null)
    const [courses, setCourses] = React.useState<Course[]>([])
    const [departments, setDepartments] = React.useState<Department[]>([])
    const [loading, setLoading] = React.useState(true)
    const [selectedStudents, setSelectedStudents] = React.useState<string[]>([])
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedCourse, setSelectedCourse] = React.useState("all")
    const [open, setOpen] = React.useState(false)
    const [creating, setCreating] = React.useState(false)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false)
    const [selectedStudentForProfile, setSelectedStudentForProfile] = React.useState<Student | null>(null)
    const [profileData, setProfileData] = React.useState({
        regno: "",
        semester: 1,
        section: "",
        cgpa: 0
    })
    const [isSubmittingProfile, setIsSubmittingProfile] = React.useState(false)
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = React.useState(false)
    const [templateConfig, setTemplateConfig] = React.useState({
        departmentId: "",
        semester: 1,
        section: "A"
    })
    // Pagination state
    const [currentPage, setCurrentPage] = React.useState(1)
    const [totalPages, setTotalPages] = React.useState(1)
    const [totalStudents, setTotalStudents] = React.useState(0)
    const itemsPerPage = 10

    // Promotion settings state
    const [promotionFromCourse, setPromotionFromCourse] = React.useState<string>("all")
    const [promotionFromSemester, setPromotionFromSemester] = React.useState<number>(1)
    const [promotionToSemester, setPromotionToSemester] = React.useState<number>(2)
    const [promotionToSection, setPromotionToSection] = React.useState<string>("keep-same")

    const loadData = React.useCallback(async () => {
        try {
            setLoading(true)
            const [studentsRes, statsRes, coursesRes, deptsRes] = await Promise.all([
                fetchStudents(currentPage, itemsPerPage, searchTerm, selectedCourse === "all" ? undefined : selectedCourse),
                fetchStudentStats(),
                fetchCourses(),
                fetchDepartments()
            ])

            if (studentsRes.success && studentsRes.data) {
                setStudents(studentsRes.data.students || [])
                setTotalPages(studentsRes.data.pagination?.totalPages || 1)
                setTotalStudents(studentsRes.data.pagination?.total || 0)
            }

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data)
            }

            if (coursesRes.success && coursesRes.data) {
                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
            }

            if (deptsRes.success && deptsRes.data) {
                setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : [])
            }

            if (!studentsRes.success) {
                toast.error(studentsRes.error || "Failed to load students")
            }
        } catch (err) {
            toast.error("An unexpected error occurred")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [searchTerm, selectedCourse, currentPage])

    React.useEffect(() => {
        loadData()
    }, [loadData])

    // Reset to page 1 when search or filter changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedCourse])

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const toggleStudent = (id: string) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (!Array.isArray(students)) return;
        const promotionCandidates = students.filter(s => s.profile?.semester === 1)
        if (selectedStudents.length === promotionCandidates.length) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(promotionCandidates.map(s => s.id))
        }
    }

    const openProfileDialog = (student: Student) => {
        setSelectedStudentForProfile(student)
        setProfileData({
            regno: student.profile?.regno || "",
            semester: student.profile?.semester || 1,
            section: student.profile?.section || "",
            cgpa: student.profile?.cgpa || 0
        })
        setIsProfileDialogOpen(true)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudentForProfile) return

        setIsSubmittingProfile(true)
        const res = await updateStudent(selectedStudentForProfile.id, {
            semester: Number(profileData.semester),
            section: profileData.section,
            regno: profileData.regno,
            cgpa: Number(profileData.cgpa),
        })

        if (res.success) {
            toast.success("Profile updated successfully")
            setIsProfileDialogOpen(false)
            loadData()
        } else {
            toast.error(res.error || "Failed to update profile")
        }
        setIsSubmittingProfile(false)
    }

    const handleBulkPromote = async () => {
        const result = await bulkPromoteStudents({
            studentIds: selectedStudents,
            targetSemester: promotionToSemester,
            section: promotionToSection !== "keep-same" ? promotionToSection : undefined
        })

        if (result.success) {
            toast.success(`Successfully promoted ${selectedStudents.length} students`)
            setSelectedStudents([])
            loadData()
        } else {
            toast.error(result.error || "Failed to promote students")
        }
    }

    const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data: CreateStudentData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string || undefined,
            departmentId: formData.get('departmentId') as string || undefined,
            semester: formData.get('semester') ? parseInt(formData.get('semester') as string) : 1,
            section: formData.get('section') as string || 'A'
        }

        try {
            setCreating(true)
            const result = await createStudent(data)
            if (result.success) {
                toast.success("Student created successfully")
                setOpen(false)
                loadData()
            } else {
                toast.error(result.error || "Failed to create student")
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        } finally {
            setCreating(false)
        }
    }

    const handleDownloadTemplate = () => {
        const headers = ["name", "email", "phone", "departmentId", "semester", "section", "regno"]
        const sampleRow = [
            "John Doe",
            "john@student.edu",
            "+1234567890",
            templateConfig.departmentId,
            templateConfig.semester,
            templateConfig.section,
            "REG-001"
        ]
        const csvContent = headers.join(",") + "\n" + sampleRow.join(",") + "\n"
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `student_template_${templateConfig.section}_sem${templateConfig.semester}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setIsTemplateDialogOpen(false)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as Record<string, string>[]
                const studentsToCreate: CreateStudentData[] = data.map(row => ({
                    name: row.name,
                    email: row.email,
                    phone: row.phone || undefined,
                    departmentId: row.departmentId || undefined,
                    semester: row.semester ? parseInt(row.semester) : 1,
                    section: row.section || 'A',
                    regno: row.regno || undefined
                }))

                if (studentsToCreate.length === 0) {
                    toast.error("No data found in CSV")
                    return
                }

                const loadingToast = toast.loading(`Importing ${studentsToCreate.length} students...`)
                const res = await bulkCreateStudents(studentsToCreate)
                toast.dismiss(loadingToast)

                if (res.success && res.data) {
                    toast.success(`Import complete: ${res.data.success} success, ${res.data.failed} failed`)
                    if (res.data.errors.length > 0) {
                        console.error("Import errors:", res.data.errors)
                    }
                    loadData()
                } else {
                    toast.error(res.error || "Failed to import students")
                }
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`)
            }
        })
        // Reset input
        e.target.value = ""
    }

    if (loading && students.length === 0) {
        return <div className="flex items-center justify-center h-64">Loading students...</div>
    }

    const promotionCandidates = Array.isArray(students)
        ? students.filter(s => {
            const matchesSemester = s.profile?.semester === promotionFromSemester
            const matchesCourse = promotionFromCourse === "all" || s.department?.id === promotionFromCourse
            return matchesSemester && matchesCourse
        })
        : []

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
                    <p className="text-muted-foreground">Directory, admissions, and academic records.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Download Template</DialogTitle>
                                <DialogDescription>
                                    Select the department, semester, and section for the template.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="template-dept">Department</Label>
                                    <Select 
                                        value={templateConfig.departmentId} 
                                        onValueChange={(val) => setTemplateConfig({...templateConfig, departmentId: val})}
                                    >
                                        <SelectTrigger id="template-dept">
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(departments) && departments.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="template-sem">Semester</Label>
                                        <Input 
                                            id="template-sem" 
                                            type="number" 
                                            min={1} 
                                            max={8} 
                                            value={templateConfig.semester}
                                            onChange={(e) => setTemplateConfig({...templateConfig, semester: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="template-sec">Section/Div</Label>
                                        <Input 
                                            id="template-sec" 
                                            placeholder="A" 
                                            value={templateConfig.section}
                                            onChange={(e) => setTemplateConfig({...templateConfig, section: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleDownloadTemplate} disabled={!templateConfig.departmentId}>Download</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="relative">
                        <Input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            id="csv-upload"
                            onChange={handleFileUpload}
                        />
                        <Button variant="outline" asChild>
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" /> Bulk Import
                            </label>
                        </Button>
                    </div>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <DialogDescription>
                                    Enter details to register a new student.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateStudent} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" placeholder="Alex Johnson" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="alex@student.edu" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" name="phone" placeholder="+1234567890" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="departmentId">Department</Label>
                                        <Select name="departmentId">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.isArray(departments) && departments.map(dept => (
                                                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Initial Semester</Label>
                                        <Input id="semester" name="semester" type="number" defaultValue={1} min={1} max={8} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="section">Initial Section</Label>
                                        <Input id="section" name="section" placeholder="A" defaultValue="A" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Register Student"}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Students
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.activeStudents || 0} active students
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Batches
                        </CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeBatches || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {stats?.courseDistribution?.length || 0} courses
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Student Directory</TabsTrigger>
                    <TabsTrigger value="promotion">Promotion & Batching</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or ID..."
                                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {Array.isArray(courses) && courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.code}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead>Name & ID</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>CGPA</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(students) && students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={student.profileImageUrl || ""} alt={student.name} />
                                                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <Link href={`/admin-dashboard/students/${student.id}`} className="hover:underline">
                                                        <span>{student.name}</span>
                                                    </Link>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">{student.profile?.regno || student.email}</span>
                                                        {!student.profile?.regno && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <AlertCircle className="h-3 w-3 text-destructive" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Missing profile details</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{student.department?.name || "N/A"}</TableCell>
                                            <TableCell>{student.profile?.semester ? `Sem ${student.profile.semester}` : "N/A"}</TableCell>
                                            <TableCell>{student.profile?.section || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant={student.isActive ? "default" : "destructive"}>
                                                    {student.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{student.profile?.cgpa?.toFixed(2) || "0.00"}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin-dashboard/students/${student.id}`}>View Details</Link>
                                                        </DropdownMenuItem>
                                                        {!student.profile?.regno && (
                                                            <DropdownMenuItem onClick={() => openProfileDialog(student)}>
                                                                Complete Profile
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => openProfileDialog(student)}>Edit Details</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>Academic Record</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {students.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalStudents)} of {totalStudents} students
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    className="w-8 h-8 p-0"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    disabled={loading}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || loading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="promotion" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Promotion</CardTitle>
                            <CardDescription>Promote students to the next semester in bulk.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <div className="grid gap-4 border p-4 rounded-md">
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Promote From</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Course/Department</Label>
                                            <Select value={promotionFromCourse} onValueChange={setPromotionFromCourse}>
                                                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Courses</SelectItem>
                                                    {Array.isArray(departments) && departments.map(dept => (
                                                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Current Semester</Label>
                                            <Select value={promotionFromSemester.toString()} onValueChange={(v) => {
                                                const sem = parseInt(v)
                                                setPromotionFromSemester(sem)
                                                // Auto-update target semester to next one
                                                if (sem < 8) setPromotionToSemester(sem + 1)
                                            }}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                        <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center p-2">
                                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                </div>

                                <div className="grid gap-4 border p-4 rounded-md">
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Promote To</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Target Semester</Label>
                                            <Select value={promotionToSemester.toString()} onValueChange={(v) => setPromotionToSemester(parseInt(v))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].filter(sem => sem > promotionFromSemester).map(sem => (
                                                        <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Section (Optional)</Label>
                                            <Select value={promotionToSection} onValueChange={setPromotionToSection}>
                                                <SelectTrigger><SelectValue placeholder="Keep Same" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="keep-same">Keep Same</SelectItem>
                                                    <SelectItem value="A">Section A</SelectItem>
                                                    <SelectItem value="B">Section B</SelectItem>
                                                    <SelectItem value="C">Section C</SelectItem>
                                                    <SelectItem value="D">Section D</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-lg font-medium mb-4">Eligible Candidates ({promotionCandidates.length})</h3>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">
                                                    <Checkbox
                                                        checked={selectedStudents.length === promotionCandidates.length && promotionCandidates.length > 0}
                                                        onCheckedChange={toggleAll}
                                                    />
                                                </TableHead>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Current Performance (CGPA)</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {promotionCandidates.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedStudents.includes(student.id)}
                                                            onCheckedChange={() => toggleStudent(student.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={student.profileImageUrl || ""} />
                                                                <AvatarFallback>S</AvatarFallback>
                                                            </Avatar>
                                                            {student.name}
                                                            <span className="text-muted-foreground text-xs">({student.profile?.regno || student.email})</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>3.8</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            Eligible
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {promotionCandidates.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                        No eligible candidates for promotion.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                    disabled={selectedStudents.length === 0}
                                    onClick={handleBulkPromote}
                                >
                                    Promote {selectedStudents.length} Students
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedStudentForProfile?.profile?.regno ? "Edit Profile" : "Complete Profile"}</DialogTitle>
                        <DialogDescription>
                            {selectedStudentForProfile?.profile?.regno
                                ? "Update the academic details for this student."
                                : "Add missing academic details to create the student profile."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="regno">Registration Number</Label>
                                <Input
                                    id="regno"
                                    value={profileData.regno}
                                    onChange={(e) => setProfileData({ ...profileData, regno: e.target.value })}
                                    placeholder="e.g. REG-2023-001"
                                    disabled={!!selectedStudentForProfile?.profile?.regno}
                                />
                                <p className="text-[0.7rem] text-muted-foreground italic">
                                    {selectedStudentForProfile?.profile?.regno
                                        ? "Registration number is set during admission and cannot be changed here."
                                        : "Assign a unique registration number to this student."}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="semester">Current Semester</Label>
                                <Select
                                    value={profileData.semester.toString()}
                                    onValueChange={(v) => setProfileData({ ...profileData, semester: parseInt(v) })}
                                >
                                    <SelectTrigger id="semester">
                                        <SelectValue placeholder="Select Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="section">Section</Label>
                                <Input
                                    id="section"
                                    value={profileData.section}
                                    onChange={(e) => setProfileData({ ...profileData, section: e.target.value })}
                                    placeholder="e.g. A"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cgpa">Current CGPA</Label>
                                <Input
                                    id="cgpa"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4"
                                    value={profileData.cgpa || ""}
                                    onChange={(e) => setProfileData({ ...profileData, cgpa: parseFloat(e.target.value) })}
                                    placeholder="e.g. 3.85"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmittingProfile}>
                                {isSubmittingProfile ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
