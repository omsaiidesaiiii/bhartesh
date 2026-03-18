"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useCallback } from "react"
import { Plus, Loader2 } from "lucide-react"
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
import { 
  fetchDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  type Department,
  type DepartmentStatus
} from "@/app/actions/setup/main"
import { DepartmentsDataTable } from "./departments-data-table"

export default function DepartmentsPage() {
  const [data, setData] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [currentDept, setCurrentDept] = useState<Department | null>(null)

  const [formData, setFormData] = useState({
      name: "",
      status: "ACTIVE" as DepartmentStatus
  })

  const loadDepartments = useCallback(async () => {
    setLoading(true)
    const result = await fetchDepartments()
    if (result.success && result.data) {
      setData(result.data)
    } else {
      toast.error(result.error || "Failed to load departments")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true
    
    const load = async () => {
      setLoading(true)
      const result = await fetchDepartments()
      if (mounted) {
        if (result.success && result.data) {
          setData(result.data)
        } else {
          toast.error(result.error || "Failed to load departments")
        }
        setLoading(false)
      }
    }
    
    load()
    
    return () => {
      mounted = false
    }
  }, [])

  const resetForm = () => {
      setFormData({ name: "", status: "ACTIVE" })
      setCurrentDept(null)
  }

  const handleSave = async () => {
      if (!formData.name.trim()) {
        toast.error("Department name is required")
        return
      }

      setSaving(true)
      
      if (currentDept) {
          const result = await updateDepartment(currentDept.id, formData)
          if (result.success) {
            toast.success("Department updated successfully")
            loadDepartments()
          } else {
            toast.error(result.error || "Failed to update department")
          }
      } else {
          const result = await createDepartment(formData)
          if (result.success) {
            toast.success("Department created successfully")
            loadDepartments()
          } else {
            toast.error(result.error || "Failed to create department")
          }
      }
      
      setSaving(false)
      setIsSheetOpen(false)
      resetForm()
  }
  
  const handleEdit = useCallback((dept: Department) => {
      setCurrentDept(dept)
      setFormData({
          name: dept.name,
          status: dept.status
      })
      setIsSheetOpen(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
      if(confirm("Are you sure you want to delete this department?")) {
          const result = await deleteDepartment(id)
          if (result.success) {
            toast.success("Department deleted successfully")
            loadDepartments()
          } else {
            toast.error(result.error || "Failed to delete department")
          }
      }
  }, [loadDepartments])

  return (
    <div className="w-full p-6 space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Department Management</h1>
                <p className="text-muted-foreground">Manage academic and administrative departments.</p>
            </div>
            
            <Sheet open={isSheetOpen} onOpenChange={(open) => {
                setIsSheetOpen(open)
                if(!open) resetForm()
            }}>
                <SheetTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Department
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{currentDept ? 'Edit Department' : 'Create New Department'}</SheetTitle>
                        <SheetDescription>
                            {currentDept ? 'Update department details below.' : 'Add a new department to the system.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Department Name</Label>
                            <Input 
                                id="name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="Computer Science" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(val: DepartmentStatus) => setFormData({...formData, status: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button className="mt-4" onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {currentDept ? 'Save Changes' : 'Create Department'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

      <DepartmentsDataTable 
        data={data} 
        loading={loading} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  )
}
