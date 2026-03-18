"use client"

import { useState, useEffect, useMemo } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Department, Staff } from "@/types/academic"
import { getDepartments, getStaffList } from "@/app/actions/acdemics/main"
import { Loader2, Search, Users2, Mail, BookOpen, GraduationCap, Building } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AcademicDirectory() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [staff, setStaff] = useState<Staff[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [filterDeptId, setFilterDeptId] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState<string>("")

    useEffect(() => {
        async function loadData() {
            try {
                const [deptsData, staffData] = await Promise.all([
                    getDepartments(),
                    getStaffList()
                ])
                setDepartments(deptsData || [])
                setStaff(staffData as Staff[] || [])
            } catch (error) {
                console.error("Failed to load directory data", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const filteredStaff = useMemo(() => {
        return staff.filter(s => {
            const matchesDept = filterDeptId === "all" || s.department?.id === filterDeptId || s.departmentId === filterDeptId
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesDept && matchesSearch
        })
    }, [staff, filterDeptId, searchQuery])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24 bg-white/40 backdrop-blur-md rounded-[3rem]">
                <Loader2 className="h-12 w-12 animate-spin text-primary/60" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Academic Directory</CardTitle>
                        <CardDescription>Directory of faculty members and department staff.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or department..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterDeptId} onValueChange={setFilterDeptId}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        No faculty matches found.
                    </div>
                ) : (
                    filteredStaff.map(staff => (
                        <Card key={staff.id}>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}`} />
                                    <AvatarFallback>{staff.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{staff.name}</CardTitle>
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
                                        {staff.department?.name || "FACULTY"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {staff.email}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Specialization</p>
                                        <div className="flex flex-wrap gap-1">
                                            {staff.staffSubjects && staff.staffSubjects.length > 0 ? (
                                                staff.staffSubjects.map(ss => (
                                                    <Badge key={ss.subject.id} variant="secondary" className="text-[9px]">
                                                        {ss.subject.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-[10px] italic text-muted-foreground">General Academics</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
