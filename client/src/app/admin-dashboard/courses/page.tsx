"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Search,
  FileEdit,
  Trash2,
  BookOpen,
  Filter,
  Loader2,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type Course,
  type CourseType,
  type CreateCourseData,
  type UpdateCourseData
} from "@/app/actions/course/main"
import { fetchDepartments, type Department } from "@/app/actions/setup/main"

// Column configuration
type SortDirection = 'asc' | 'desc' | null;
type SortConfig = { key: keyof Course | 'departmentName'; direction: SortDirection };

// Form state type
interface CourseFormData {
  title: string;
  code: string;
  description: string;
  type: CourseType;
  duration: string;
  totalSemesters: number;
  credits: number;
  maxEnrollment: number;
  status: 'ACTIVE' | 'INACTIVE';
  departmentId: string;
}

const initialFormData: CourseFormData = {
  title: "",
  code: "",
  description: "",
  type: "UNDERGRADUATE",
  duration: "3 Years",
  totalSemesters: 6,
  credits: 0,
  maxEnrollment: 100,
  status: "ACTIVE",
  departmentId: ""
};

export default function CoursesPage() {
  // Data states
  const [courses, setCourses] = useState<Course[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Table states
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(0)
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    code: true,
    type: true,
    department: true,
    duration: true,
    totalSemesters: true,
    status: true,
    actions: true
  })
  const pageSize = 10

  // Sheet/form states
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<CourseFormData>(initialFormData)

  // Load courses and departments
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true)
      try {
        const [coursesResult, departmentsResult] = await Promise.all([
          fetchCourses(),
          fetchDepartments()
        ]);

        if (!mounted) return;

        if (coursesResult.success && coursesResult.data) {
          setCourses(coursesResult.data)
        } else {
          toast.error(coursesResult.error || "Failed to load courses")
        }

        if (departmentsResult.success && departmentsResult.data) {
          setDepartments(departmentsResult.data)
        }
      } catch (error) {
        if (mounted) {
          console.error("Error loading data:", error)
          toast.error("Failed to load data")
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false;
    }
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setCurrentCourse(null)
  }, [])

  const handleSave = async () => {
    if (!formData.title || !formData.code || !formData.departmentId) {
      toast.error("Title, Code, and Department are required")
      return
    }

    setIsSaving(true)
    try {
      if (currentCourse) {
        // Update existing course
        const updateData: UpdateCourseData = {
          title: formData.title,
          code: formData.code,
          description: formData.description || undefined,
          type: formData.type,
          duration: formData.duration,
          totalSemesters: formData.totalSemesters,
          credits: formData.credits || undefined,
          maxEnrollment: formData.maxEnrollment || undefined,
          status: formData.status,
          departmentId: formData.departmentId
        }

        const result = await updateCourse(currentCourse.id, updateData)

        if (result.success && result.data) {
          setCourses(prev => prev.map(c => c.id === currentCourse.id ? result.data! : c))
          toast.success("Course updated successfully")
        } else {
          toast.error(result.error || "Failed to update course")
          return
        }
      } else {
        // Create new course
        const createData: CreateCourseData = {
          title: formData.title,
          code: formData.code,
          description: formData.description || undefined,
          type: formData.type,
          duration: formData.duration,
          totalSemesters: formData.totalSemesters,
          credits: formData.credits || undefined,
          maxEnrollment: formData.maxEnrollment || undefined,
          status: formData.status,
          departmentId: formData.departmentId
        }

        const result = await createCourse(createData)

        if (result.success && result.data) {
          setCourses(prev => [...prev, result.data!])
          toast.success("Course created successfully")
        } else {
          toast.error(result.error || "Failed to create course")
          return
        }
      }

      setIsSheetOpen(false)
      resetForm()
    } catch (error) {
      console.error("Save error:", error)
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = useCallback((course: Course) => {
    setCurrentCourse(course)
    setFormData({
      title: course.title,
      code: course.code,
      description: course.description || "",
      type: course.type,
      duration: course.duration,
      totalSemesters: course.totalSemesters,
      credits: course.credits || 0,
      maxEnrollment: course.maxEnrollment || 100,
      status: course.status,
      departmentId: course.departmentId
    })
    setIsSheetOpen(true)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      const result = await deleteCourse(id)

      if (result.success) {
        setCourses(prev => prev.filter(c => c.id !== id))
        toast.success("Course deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete course")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("An error occurred while deleting")
    }
  }

  // Sorting
  const handleSort = useCallback((key: keyof Course | 'departmentName') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Filtered and sorted data
  const filteredAndSortedCourses = useMemo(() => {
    if (!Array.isArray(courses)) return []
    let result = [...courses]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.department?.name?.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter(course => course.type === typeFilter)
    }

    // Sort
    if (sortConfig.direction) {
      result.sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';

        if (sortConfig.key === 'departmentName') {
          aVal = a.department?.name || '';
          bVal = b.department?.name || '';
        } else {
          aVal = a[sortConfig.key] as string | number ?? '';
          bVal = b[sortConfig.key] as string | number ?? '';
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      })
    }

    return result
  }, [courses, searchQuery, typeFilter, sortConfig])

  // Pagination
  const paginatedCourses = useMemo(() => {
    const start = currentPage * pageSize
    return filteredAndSortedCourses.slice(start, start + pageSize)
  }, [filteredAndSortedCourses, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedCourses.length / pageSize)
  const canPreviousPage = currentPage > 0
  const canNextPage = currentPage < totalPages - 1

  // Sort icon helper
  const SortIcon = ({ columnKey }: { columnKey: keyof Course | 'departmentName' }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />
  }

  // Type display helper
  const getTypeLabel = (type: CourseType) => {
    const labels: Record<CourseType, string> = {
      UNDERGRADUATE: 'Undergraduate',
      POSTGRADUATE: 'Postgraduate',
      DIPLOMA: 'Diploma',
      PUC: 'PUC',
      SCHOOL: 'School'
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">Manage academic programs, courses, and curriculum structures.</p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) resetForm()
        }}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{currentCourse ? 'Edit Course' : 'Create New Course'}</SheetTitle>
              <SheetDescription>
                {currentCourse ? 'Update course details below.' : 'Add a new course to the system.'}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bachelor of Science in..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="B.Sc"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as CourseType })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
                      <SelectItem value="DIPLOMA">Diploma</SelectItem>
                      <SelectItem value="PUC">PUC</SelectItem>
                      <SelectItem value="SCHOOL">School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.departmentId} onValueChange={(val) => setFormData({ ...formData, departmentId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={formData.duration} onValueChange={(val) => setFormData({ ...formData, duration: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6 Months">6 Months</SelectItem>
                      <SelectItem value="1 Year">1 Year</SelectItem>
                      <SelectItem value="2 Years">2 Years</SelectItem>
                      <SelectItem value="3 Years">3 Years</SelectItem>
                      <SelectItem value="4 Years">4 Years</SelectItem>
                      <SelectItem value="5 Years">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="semesters">Total Semesters</Label>
                  <Input
                    id="semesters"
                    type="number"
                    min={1}
                    max={12}
                    value={formData.totalSemesters}
                    onChange={(e) => setFormData({ ...formData, totalSemesters: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min={0}
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxEnrollment">Max Enrollment</Label>
                  <Input
                    id="maxEnrollment"
                    type="number"
                    min={1}
                    value={formData.maxEnrollment}
                    onChange={(e) => setFormData({ ...formData, maxEnrollment: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as 'ACTIVE' | 'INACTIVE' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentCourse ? 'Save Changes' : 'Create Course'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(0)
            }}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val)
              setCurrentPage(0)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
              <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
              <SelectItem value="DIPLOMA">Diploma</SelectItem>
              <SelectItem value="PUC">PUC</SelectItem>
              <SelectItem value="SCHOOL">School</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(visibleColumns).filter(([key]) => key !== 'actions').map(([key, visible]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  className="capitalize"
                  checked={visible}
                  onCheckedChange={(value) =>
                    setVisibleColumns(prev => ({ ...prev, [key]: !!value }))
                  }
                >
                  {key === 'totalSemesters' ? 'Semesters' : key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.title && (
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('title')}>
                    Course Title <SortIcon columnKey="title" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.code && <TableHead>Code</TableHead>}
              {visibleColumns.type && <TableHead>Type</TableHead>}
              {visibleColumns.department && (
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('departmentName')}>
                    Department <SortIcon columnKey="departmentName" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.duration && <TableHead>Duration</TableHead>}
              {visibleColumns.totalSemesters && <TableHead>Semesters</TableHead>}
              {visibleColumns.status && <TableHead>Status</TableHead>}
              {visibleColumns.actions && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((course) => (
                <TableRow key={course.id}>
                  {visibleColumns.title && (
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {course.title}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.code && (
                    <TableCell>
                      <Badge variant="outline">{course.code}</Badge>
                    </TableCell>
                  )}
                  {visibleColumns.type && (
                    <TableCell>{getTypeLabel(course.type)}</TableCell>
                  )}
                  {visibleColumns.department && (
                    <TableCell>{course.department?.name || '-'}</TableCell>
                  )}
                  {visibleColumns.duration && (
                    <TableCell>{course.duration}</TableCell>
                  )}
                  {visibleColumns.totalSemesters && (
                    <TableCell className="text-center">{course.totalSemesters}</TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge variant={course.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(course)}>
                            <FileEdit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Object.values(visibleColumns).filter(Boolean).length}
                  className="h-24 text-center"
                >
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} course(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

