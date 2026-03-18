import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUp, Calendar as CalendarIcon, Info, Loader2 } from "lucide-react"
import { fetchDepartments, fetchSubjects, createAssignment } from "@/lib/assignments-api"
import { toast } from "sonner"

interface CreateAssignmentProps {
  onSuccess: () => void
}

export function CreateAssignment({ onSuccess }: CreateAssignmentProps) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    semester: "",
    departmentId: "",
    subjectId: ""
  })

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    if (formData.departmentId) {
      loadSubjects(formData.departmentId, formData.semester ? parseInt(formData.semester) : undefined)
    }
  }, [formData.departmentId, formData.semester])

  async function loadDepartments() {
    const res = await fetchDepartments()
    if (res.success) setDepartments(res.data || [])
  }

  async function loadSubjects(deptId: string, sem?: number) {
    const res = await fetchSubjects(deptId, sem)
    if (res.success) setSubjects(res.data || [])
  }

  async function handleSubmit() {
    if (!formData.title || !formData.dueDate || !formData.semester || !formData.departmentId) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    const result = await createAssignment({
      ...formData,
      subjectId: formData.subjectId || undefined,
      semester: parseInt(formData.semester),
    })

    if (result.success) {
      toast.success("Assignment published successfully")
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        semester: "",
        departmentId: "",
        subjectId: ""
      })
      onSuccess()
    } else {
      toast.error(result.error || "Failed to publish assignment")
    }
    setLoading(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md">
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Enter the title and instructions for the students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment Title *</label>
              <Input
                placeholder="e.g. Introduction to Thermal Physics"
                className="bg-background/50"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instructions (Optional)</label>
              <Textarea
                placeholder="Detail what students need to do..."
                className="min-h-[200px] bg-background/50 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 flex gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <p className="font-semibold">Note:</p>
                <p>Students will see this assignment and should submit their work in hard copy as instructed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department *</label>
              <Select onValueChange={(val) => setFormData({ ...formData, departmentId: val })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Semester *</label>
              <Select onValueChange={(val) => setFormData({ ...formData, semester: val })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject (Optional)</label>
              <Select onValueChange={(val) => setFormData({ ...formData, subjectId: val })} disabled={!formData.departmentId}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name} ({sub.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date *</label>
              <div className="relative">
                <Input
                  type="date"
                  className="bg-background/50 pl-10"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Publish Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
