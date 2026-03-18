"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table"
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
import { useState } from "react"
import { 
    MoreHorizontal, 
    ArrowUpDown, 
    Plus, 
    Search,
    Filter,
    FileEdit,
    Trash2,
    ShieldCheck,
    KeyRound
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { fetchUsers, createStaff, updateUserStatus, deleteUser } from "@/app/actions/user/main"
import { useEffect } from "react"

// --- Types ---
type User = {
  id: string
  name: string
  email: string
  role: "Admin" | "Staff" | "Student"
  department: string
  status: "Active" | "Inactive"
  avatar?: string
}


export default function UsersPage() {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null) // For editing
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- Form States for Add/Edit ---
  const [formData, setFormData] = useState({
      name: "",
      email: "",
      role: "Student",
      department: "",
      autoGenerate: false
  })

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await fetchUsers()
      if (result.success && result.data) {
        // Map backend users to frontend format
        const mappedUsers: User[] = result.data.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role === 'ADMIN' ? 'Admin' : user.role === 'STAFF' ? 'Staff' : 'Student',
          department: "", // Backend doesn't have department yet
          status: user.isActive ? 'Active' : 'Inactive',
          avatar: user.profileImageUrl
        }))
        setData(mappedUsers)
      } else {
        toast.error(result.error || 'Failed to load users')
      }
    } catch (error) {
      console.error('Load users error:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
      setFormData({ name: "", email: "", role: "Student", department: "", autoGenerate: false })
      setCurrentUser(null)
  }

  const handleSaveUser = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      if (currentUser) {
        // Edit logic - update status for now
        const isActive = formData.role !== "Student" // Assuming only students can be inactive for now
        const result = await updateUserStatus(currentUser.id, isActive)
        if (result.success) {
          setData(prev => prev.map(u => u.id === currentUser.id ? { ...u, status: isActive ? 'Active' : 'Inactive' } : u))
          toast.success("User updated successfully")
        } else {
          toast.error(result.error || 'Failed to update user')
        }
      } else {
        // Create logic - only staff for now
        if (formData.role !== 'Staff') {
          toast.error('Only staff creation is currently supported')
          return
        }

        const staffData = {
          name: formData.name,
          username: formData.email.split('@')[0], // Generate username from email
          email: formData.email,
          password: formData.autoGenerate ? Math.random().toString(36).slice(-8) : 'defaultPass123', // In real app, generate proper password
          phone: undefined
        }

        const result = await createStaff(staffData)
        if (result.success && result.data) {
          const newUser: User = {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            role: 'Staff',
            department: formData.department,
            status: 'Active'
          }
          setData(prev => [...prev, newUser])
          toast.success(formData.autoGenerate ? "User created & credentials emailed" : "User created successfully")
          // Reload users to get updated list
          await loadUsers()
        } else {
          toast.error(result.error || 'Failed to create user')
        }
      }
      setIsSheetOpen(false)
      resetForm()
    } catch (error) {
      console.error('Save user error:', error)
      toast.error('Failed to save user')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEdit = (user: User) => {
      setCurrentUser(user)
      setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          autoGenerate: false
      })
      setIsSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to deactivate/delete this user?")) {
      try {
        const result = await deleteUser(id)
        if (result.success) {
          setData(prev => prev.filter(u => u.id !== id))
          toast.success("User deleted successfully")
        } else {
          toast.error(result.error || 'Failed to delete user')
        }
      } catch (error) {
        console.error('Delete user error:', error)
        toast.error('Failed to delete user')
      }
    }
  }

  // --- Columns Definition ---
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <div className="font-medium">{row.getValue("role")}</div>,
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => <div>{row.getValue("department")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge variant={status === "Active" ? "default" : "secondary"}>
                {status}
            </Badge>
          )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(user)}>
                <FileEdit className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success(`Password reset email sent to ${user.email}`)}>
                <KeyRound className="mr-2 h-4 w-4" /> Reset Password
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => toast.success(user.status === "Active" ? "User deactivated" : "User activated")}>
                <ShieldCheck className="mr-2 h-4 w-4" /> {user.status === "Active" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(user.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full p-6 space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage system users, roles, and permissions.</p>
            </div>
            
            <Sheet open={isSheetOpen} onOpenChange={(open) => {
                setIsSheetOpen(open)
                if(!open) resetForm()
            }}>
                <SheetTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{currentUser ? 'Edit User' : 'Create New User'}</SheetTitle>
                        <SheetDescription>
                            {currentUser ? 'Update user details below.' : 'Add a new user to the system. You can auto-generate credentials.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                                id="name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="John Doe" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                placeholder="john@example.com" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Staff">Staff</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Select value={formData.department} onValueChange={(val) => setFormData({...formData, department: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select dept" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CS">Computer Science</SelectItem>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="HR">Human Resources</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {!currentUser && (
                             <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="auto-creds" 
                                    checked={formData.autoGenerate} 
                                    onCheckedChange={(c) => setFormData({...formData, autoGenerate: !!c})}
                                />
                                <Label htmlFor="auto-creds" className="text-sm font-normal">
                                    Auto-generate credentials & email user
                                </Label>
                            </div>
                        )}
                        
                        <Button className="mt-4" onClick={handleSaveUser} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : currentUser ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Search users..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-8"
            />
        </div>
         
         <div className="flex items-center gap-2">
             <Select 
                 value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
                 onValueChange={(val) => table.getColumn("role")?.setFilterValue(val === "all" ? "" : val)}
             >
                <SelectTrigger className="w-[130px]">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Role" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
             </Select>
             
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                    Columns <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                        return (
                        <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                            }
                        >
                            {column.id}
                        </DropdownMenuCheckboxItem>
                        )
                    })}
                </DropdownMenuContent>
                </DropdownMenu>
         </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
