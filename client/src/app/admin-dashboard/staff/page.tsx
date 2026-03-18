"use client"

import { useState, useEffect } from "react"
import {
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Briefcase,
  Users,
  GraduationCap,
  Building2,
  BookOpen
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { fetchStaff, fetchStaffStats, type StaffStats, createStaff, type CreateStaffData, fetchStaffWorkload, StaffWorkload  } from "@/app/actions/user/main"
import type { User } from "@/app/actions/user/types"
import { fetchDepartments, type Department } from "@/app/actions/setup/main"
import { toast } from "sonner"

export default function StaffPage() {
  const [staffData, setStaffData] = useState<User[]>([])
  const [stats, setStats] = useState<StaffStats | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [workloadData, setWorkloadData] = useState<StaffWorkload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [staffRes, statsRes, deptRes, workloadRes] = await Promise.all([
        fetchStaff(),
        fetchStaffStats(),
        fetchDepartments(),
        fetchStaffWorkload()
      ])

      if (staffRes.success && staffRes.data) {
        setStaffData(staffRes.data.users)
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      }

      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data)
      }

      if (workloadRes.success && workloadRes.data) {
        setWorkloadData(workloadRes.data)
      } else if (workloadRes.error) {
        toast.error("Failed to load workload data: " + workloadRes.error)
      }

      if (!staffRes.success && !deptRes.success && !workloadRes.success) {
        setError("Failed to load data from server")
      }
    } catch {
      setError("An error occurred while fetching data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateStaffData = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string || undefined,
      departmentId: formData.get('departmentId') as string || undefined,
    }

    console.log('DEBUG: Submitting staff data:', { ...data, password: '[REDACTED]' });

    setCreating(true)
    const result = await createStaff(data)
    if (result.success) {
      toast.success("Staff member created successfully")
      setOpen(false)
      loadData() // Refresh list
    } else {
      toast.error(result.error || "Failed to create staff member")
    }
    setCreating(false)
  }

  if (loading && staffData.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading staff...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error: {error}</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage faculty, assignments, and workload.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff member</DialogTitle>
                <DialogDescription>
                  Create a new staff account with system credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" placeholder="Full Name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">Username</Label>
                  <Input id="username" name="username" placeholder="jdoe" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input id="phone" name="phone" placeholder="+1234567890" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" title="Password" className="text-right">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="departmentId" className="text-right">Department</Label>
                  <div className="col-span-3">
                    <Select name="departmentId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Staff"}</Button>
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
              Total Staff
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeStaff || 0} active staff
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Departments
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.departments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faculty on Leave
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inactiveStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently away
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Workload
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgWorkload || 0}h</div>
            <p className="text-xs text-muted-foreground">
              Per week average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="workload">Workload Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffData.map((staff: User) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={staff.profileImageUrl || "/avatars/default.png"} alt={staff.name} />
                          <AvatarFallback>{staff.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{staff.name}</span>
                          <span className="text-xs text-muted-foreground">{staff.username || staff.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge variant={staff.isActive ? "default" : "secondary"}>
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
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
                              <Link href={`/admin-dashboard/staff/${staff.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Assign Subject</DropdownMenuItem>
                            <DropdownMenuItem>Assign Class</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{dept.name}</CardTitle>
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{dept._count?.users || 0} Staff Members</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>HOD: {dept.hod?.staff.name || 'Not Assigned'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{dept._count?.subjects || 0} Subjects</span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href={`/admin-dashboard/departments/${dept.id}`}>
                      View Department
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {departments.length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                No departments found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workload Distribution</CardTitle>
              <CardDescription>Overview of weekly hours assigned to faculty.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Assigned Subjects</TableHead>
                    <TableHead>Weekly Classes</TableHead>
                    <TableHead>Weekly Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workloadData.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.subjectsCount}</TableCell>
                      <TableCell>{staff.weeklyClassesCount}</TableCell>
                      <TableCell>{staff.weeklyHours} hrs</TableCell>
                      <TableCell>
                        <Badge variant={staff.isActive ? "default" : "secondary"}>
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {workloadData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No workload data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
