"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStaffList, getSubjects, assignSubjectToStaff, getDepartments } from "@/app/actions/acdemics/main"
import { Staff, Subject, ApiResponse, Department } from "@/types/academic"
import { Loader2, Plus } from "lucide-react"

const FormSchema = z.object({
    departmentId: z.string().min(1, {
        message: "Please select a department.",
    }),
    staffId: z.string().min(1, {
        message: "Please select a staff member.",
    }),
    subjectId: z.string().min(1, {
        message: "Please select a subject.",
    }),
})

export function StaffAssignment() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [staff, setStaff] = useState<Staff[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [fetchingOptions, setFetchingOptions] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const depts = await getDepartments()
                setDepartments(depts)
            } catch {
                toast.error("Failed to fetch departments")
            } finally {
                setLoading(false)
            }
        }
        fetchInitialData()
    }, [])

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            departmentId: "",
            staffId: "",
            subjectId: ""
        }
    })

    const selectedDeptId = form.watch("departmentId")

    useEffect(() => {
        if (selectedDeptId) {
            async function fetchDeptOptions() {
                setFetchingOptions(true)
                try {
                    const [staffData, subjectsData] = await Promise.all([
                        getStaffList(selectedDeptId),
                        getSubjects(selectedDeptId)
                    ])
                    setStaff(staffData)
                    setSubjects(subjectsData)
                    form.setValue("staffId", "")
                    form.setValue("subjectId", "")
                } catch {
                    toast.error("Failed to fetch department options")
                } finally {
                    setFetchingOptions(false)
                }
            }
            fetchDeptOptions()
        } else {
            setStaff([])
            setSubjects([])
        }
    }, [selectedDeptId, form])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsSubmitting(true)
        try {
            const res: ApiResponse = await assignSubjectToStaff(data.staffId, data.subjectId)
            if (res.success) {
                toast.success(res.message)
                form.reset({ departmentId: selectedDeptId, staffId: "", subjectId: "" })
            } else {
                toast.error(res.message)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Staff Subject Assignment</CardTitle>
                <CardDescription>Assign faculty members to specific subject modules.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="staffId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Faculty Member</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDeptId || fetchingOptions}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={fetchingOptions ? "Loading..." : "Select Faculty"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {staff.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="subjectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject Module</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDeptId || fetchingOptions}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={fetchingOptions ? "Loading..." : "Select Subject"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {subjects.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting || !selectedDeptId} className="w-full">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Assign Subject
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
