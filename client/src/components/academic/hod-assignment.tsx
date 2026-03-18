"use client"

import { useState, useEffect, useMemo } from "react"
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
import { getStaffList, getDepartments, assignHodToDepartment, getHodAssignments } from "@/app/actions/acdemics/main"
import { Staff, Department, ApiResponse, HodAssignmentData } from "@/types/academic"
import { Loader2, ShieldCheck } from "lucide-react"
import { Badge } from "../ui/badge"

const FormSchema = z.object({
    departmentId: z.string().min(1, {
        message: "Please select a department.",
    }),
    staffId: z.string().min(1, {
        message: "Please select a staff member.",
    }),
})

export function HodAssignment() {
    const [staff, setStaff] = useState<Staff[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [hodAssignments, setHodAssignments] = useState<HodAssignmentData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [refreshing, setRefreshing] = useState<boolean>(false)

    const fetchData = async () => {
        setRefreshing(true)
        try {
            const [staffData, deptData, assignments] = await Promise.all([
                getStaffList(),
                getDepartments(),
                getHodAssignments()
            ])

            setStaff(staffData)
            setDepartments(deptData)
            setHodAssignments(assignments)
        } catch {
            toast.error("Failed to fetch registry data")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            departmentId: "",
            staffId: ""
        }
    })

    // Filter out departments that already have an HOD
    const availableDepartments = useMemo(() => {
        const assignedDeptIds = new Set(hodAssignments.map(a => a.departmentId))
        return departments.filter(d => !assignedDeptIds.has(d.id))
    }, [departments, hodAssignments])

    // Filter out staff members who are already HODs
    const availableStaff = useMemo(() => {
        const assignedStaffIds = new Set(hodAssignments.map(a => a.staffId))
        return staff.filter(s => !assignedStaffIds.has(s.id))
    }, [staff, hodAssignments])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const res: ApiResponse = await assignHodToDepartment(data.departmentId, data.staffId)

        if (res.success) {
            toast.success(res.message)
            form.reset()
            fetchData()
        } else {
            toast.error(res.message)
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
                <CardTitle>HOD Assignment</CardTitle>
                <CardDescription>Appoint Departmental Heads for each department.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            {availableDepartments.map((d) => (
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Head of Department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableStaff.map((s) => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={refreshing} className="w-full">
                            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                            Assign HOD
                        </Button>
                    </form>
                </Form>

                <div className="pt-6 border-t">
                    <h4 className="text-sm font-bold mb-4">Current Leadership</h4>
                    <div className="space-y-2">
                        {hodAssignments.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic text-center py-4">No HODs assigned.</p>
                        ) : (
                            hodAssignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">{assignment.staff.name}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase">{assignment.department.name}</div>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-bold">HOD</Badge>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
