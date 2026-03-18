"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
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
import { createSubject, getDepartments } from "@/app/actions/acdemics/main"
import { Plus } from "lucide-react"
import { Department } from "@/types/academic"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    credits: z.string().min(1, "Credits is required"),
    semester: z.string().min(1, "Semester is required"),
    departmentId: z.string().min(1, "Department is required"),
})

type FormData = z.infer<typeof formSchema>

export function CreateSubjectDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])

    useEffect(() => {
        if (open) {
            getDepartments().then(setDepartments)
        }
    }, [open])

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            credits: "3",
            semester: "1",
            departmentId: "",
        },
    })

    async function onSubmit(values: FormData) {
        setLoading(true)
        const parsedValues = {
            ...values,
            credits: parseInt(values.credits, 10),
            semester: parseInt(values.semester, 10),
        }
        const res = await createSubject(parsedValues)
        setLoading(false)

        if (res.success) {
            toast.success(res.message)
            setOpen(false)
            form.reset()
        } else {
            toast.error(res.message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Subject</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Data Structures" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. CS101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="credits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credits</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="semester"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Semester</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="departmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Creating..." : "Create Subject"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
