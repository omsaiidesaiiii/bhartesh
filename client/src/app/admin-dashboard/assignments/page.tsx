"use client"

import * as React from "react"
import {
    FileText,
    CheckCircle2,
    Clock,
    BarChart3,
    Search,
    MoreVertical,
    Plus,
    Users,
    Loader2,
    Trash2,
    FilePlus,
    ChevronLeft,
    ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchAssignments, deleteAssignment, Assignment } from "@/lib/assignments-api"
import { format } from "date-fns"
import { toast } from "sonner"
import { CreateAssignment } from "@/components/staff-dashboard/create-assignment"

export default function AdminAssignmentsPage() {
    const [activeTab, setActiveTab] = React.useState("overview")
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [searchTerm, setSearchTerm] = React.useState("")

    // Pagination state
    const [currentPage, setCurrentPage] = React.useState(1)
    const itemsPerPage = 10

    React.useEffect(() => {
        loadAssignments()
    }, [])

    async function loadAssignments() {
        setLoading(true)
        const result = await fetchAssignments()
        if (result.success) {
            setAssignments(result.data || [])
            setError(null)
        } else {
            setError(result.error || "Failed to load assignments")
            toast.error(result.error || "Failed to load assignments")
        }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure? This will remove the assignment and all student submission records.")) return
        const res = await deleteAssignment(id)
        if (res.success) {
            toast.success("Assignment deleted")
            loadAssignments()
        } else {
            toast.error(res.error)
        }
    }

    const filteredAssignments = assignments.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination logic
    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage)
    const paginatedAssignments = filteredAssignments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    // Reset to page 1 when search changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Assignments & Monitoring</h1>
                    <p className="text-muted-foreground">Track assignment submissions, grading status, and faculty workloads.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setActiveTab("create")} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Create Assignment
                    </Button>
                    <Button onClick={loadAssignments} variant="outline" size="sm">
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (activeTab === "overview") && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                    <Button variant="link" size="sm" onClick={loadAssignments} className="text-destructive font-bold underline">Retry</Button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.length}</div>
                        <p className="text-xs text-muted-foreground">Across all departments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {assignments.filter(a => {
                                const due = a.dueDate ? new Date(a.dueDate) : null;
                                return due && due > new Date();
                            }).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending deadlines</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">N/A</div>
                        <p className="text-xs text-muted-foreground">Global average</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">All</div>
                        <p className="text-xs text-muted-foreground">Participating</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="create" className="flex items-center gap-2">
                        <FilePlus className="h-4 w-4" /> Create
                    </TabsTrigger>
                    <TabsTrigger value="faculty">Faculty Workload</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search assignments, faculty or subjects..."
                                className="pl-8 sm:w-[300px] md:w-[400px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">Assignment Name</TableHead>
                                            <TableHead>Faculty / Author</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedAssignments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No assignments found.</TableCell>
                                            </TableRow>
                                        ) : paginatedAssignments.map(assign => (
                                            <TableRow key={assign.id}>
                                                <TableCell className="font-medium pl-6">
                                                    <div className="font-bold">{assign.title}</div>
                                                    <div className="text-xs text-muted-foreground">{assign.subject?.name || "No Subject"} ({assign.subject?.code || "N/A"})</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium">{assign.author?.name}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{assign.author?.role}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        {assign.dueDate ? format(new Date(assign.dueDate), 'MMM dd, yyyy') : 'No Date'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">Sem {assign.semester}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleDelete(assign.id)} className="text-destructive">
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete Assignment
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                        {/* Pagination Controls */}
                        {!loading && totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} assignments
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
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
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="create" className="space-y-4">
                    <CreateAssignment onSuccess={() => {
                        loadAssignments()
                        setActiveTab("overview")
                        toast.success("Assignment created successfully by Admin")
                    }} />
                </TabsContent>

                <TabsContent value="faculty" className="space-y-4">
                    <div className="p-10 text-center border-2 border-dashed rounded-xl text-muted-foreground font-medium">
                        Faculty workload monitoring is integrated with the main Workload dashboard.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

const AlertCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
)
