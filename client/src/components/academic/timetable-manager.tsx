"use client"

import { useState, useEffect, useMemo } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Trash2, Loader2, Edit2, X, FilterX, Building, User } from "lucide-react"
import { getDepartments, getStaffList, getSubjects, createTimetableEntry, getTimetable, updateTimetableEntry, deleteTimetableEntry } from "@/app/actions/acdemics/main"
import { Department, Staff, Subject, TimetableEntry, ApiResponse } from "@/types/academic"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

export function TimetableManager() {
    const [entries, setEntries] = useState<TimetableEntry[]>([])

    // Data State
    const [departments, setDepartments] = useState<Department[]>([])
    const [staffList, setStaffList] = useState<Staff[]>([])
    const [subjectsList, setSubjectsList] = useState<Subject[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [, setFetchingEntries] = useState<boolean>(false)

    // View Filters
    const [viewSemester, setViewSemester] = useState<string>("")
    const [viewSection, setViewSection] = useState<string>("")

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [departmentId, setDepartmentId] = useState<string>("")
    const [day, setDay] = useState<string>("MONDAY")
    const [startTime, setStartTime] = useState<string>("09:00")
    const [endTime, setEndTime] = useState<string>("10:00")
    const [subjectId, setSubjectId] = useState<string>("")
    const [staffId, setStaffId] = useState<string>("")
    const [room, setRoom] = useState<string>("")
    const [semester, setSemester] = useState<string>("")
    const [section, setSection] = useState<string>("")

    useEffect(() => {
        async function fetchData() {
            try {
                const [depts, staff] = await Promise.all([
                    getDepartments(),
                    getStaffList()
                ])
                setDepartments(depts)
                setStaffList(staff)
            } catch {
                toast.error("Failed to fetch initial data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Fetch subjects and existing timetable when department changes
    useEffect(() => {
        if (departmentId) {
            async function loadDeptData() {
                setFetchingEntries(true)
                try {
                    const [subs, currentEntries] = await Promise.all([
                        getSubjects(departmentId),
                        getTimetable({ departmentId })
                    ])
                    setSubjectsList(subs)
                    setEntries(currentEntries)
                } catch {
                    toast.error("Failed to fetch department data")
                } finally {
                    setFetchingEntries(false)
                }
            }
            loadDeptData()
        }
    }, [departmentId])

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const matchesSem = !viewSemester || entry.semester?.toString() === viewSemester
            const matchesSec = !viewSection || entry.section === viewSection
            return matchesSem && matchesSec
        })
    }, [entries, viewSemester, viewSection])

    // Available faculty for the selected subject
    const availableFaculty = useMemo(() => {
        if (!subjectId) return staffList
        const selectedSubject = subjectsList.find(s => s.id === subjectId)
        if (!selectedSubject?.teachers) return []
        const teacherIds = new Set(selectedSubject.teachers.map(t => t.staff.id))
        return staffList.filter(s => teacherIds.has(s.id))
    }, [subjectId, subjectsList, staffList])

    const handleEdit = (entry: TimetableEntry) => {
        setEditingId(entry.id)
        setDay(entry.dayOfWeek)
        setSubjectId(entry.subject?.id || "")
        setStaffId(entry.staff?.id || "")
        setRoom(entry.room || "")
        setSemester(entry.semester?.toString() || "")
        setSection(entry.section || "")

        // Extract time from ISO strings
        const start = new Date(entry.startTime)
        const end = new Date(entry.endTime)
        setStartTime(`${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`)
        setEndTime(`${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`)

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const resetForm = () => {
        setEditingId(null)
        setSubjectId("")
        setStaffId("")
        setRoom("")
        setSemester("")
        setSection("")
        setStartTime("09:00")
        setEndTime("10:00")
    }

    const deleteEntry = async (id: string) => {
        if (!confirm("Are you sure you want to delete this slot?")) return
        const res: ApiResponse = await deleteTimetableEntry(id)
        if (res.success) {
            toast.success(res.message)
            setEntries(entries.filter(e => e.id !== id))
        } else {
            toast.error(res.message)
        }
    }

    const handleSubmit = async () => {
        if (!departmentId || !subjectId || !staffId || !day || !startTime || !endTime) {
            toast.error("Please fill all required fields")
            return
        }

        const date = new Date()
        const start = new Date(date)
        const [sH, sM] = startTime.split(":").map(Number)
        start.setHours(sH, sM, 0, 0)

        const end = new Date(date)
        const [eH, eM] = endTime.split(":").map(Number)
        end.setHours(eH, eM, 0, 0)

        const payload = {
            departmentId,
            subjectId,
            staffId,
            dayOfWeek: day,
            startTime: start,
            endTime: end,
            room,
            semester: semester ? Number(semester) : undefined,
            section: section || undefined
        }

        let res: ApiResponse
        if (editingId) {
            res = await updateTimetableEntry(editingId, payload)
        } else {
            res = await createTimetableEntry(payload)
        }

        if (res.success) {
            toast.success(res.message)
            const updatedEntries = await getTimetable({ departmentId })
            setEntries(updatedEntries)
            resetForm()
        } else {
            toast.error(res.message)
        }
    }

    const clearFilters = () => {
        setViewSemester("")
        setViewSection("")
    }

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Timetable Management</CardTitle>
                            <CardDescription>Configure and manage department academic schedules.</CardDescription>
                        </div>
                        {editingId && (
                            <Button variant="outline" size="sm" onClick={resetForm}>
                                <X className="h-4 w-4 mr-2" /> Cancel Edit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Primary Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-slate-50/50">
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={departmentId} onValueChange={setDepartmentId} disabled={!!editingId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Input System */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 border p-4 rounded-md">

                        <div className="space-y-2">
                            <Label>Day</Label>
                            <Select value={day} onValueChange={setDay}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {weekDays.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Input type="number" placeholder="5" value={semester} onChange={e => setSemester(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Section</Label>
                            <Input type="text" placeholder="A" value={section} onChange={e => setSection(e.target.value.toUpperCase())} />
                        </div>

                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select value={subjectId} onValueChange={setSubjectId} disabled={!departmentId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectsList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Faculty</Label>
                            <Select value={staffId} onValueChange={setStaffId} disabled={!subjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableFaculty.length > 0 ? (
                                        availableFaculty.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                                    ) : (
                                        <SelectItem value="null" disabled>N/A</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Room</Label>
                            <Input placeholder="Room 101" value={room} onChange={e => setRoom(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit}>
                            {editingId ? "Update Slot" : "Add Slot"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Display System */}
            <Tabs defaultValue="grid" className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <TabsList>
                        <TabsTrigger value="grid">Grid View</TabsTrigger>
                        <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <Select value={viewSemester} onValueChange={setViewSemester}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={viewSection} onValueChange={setViewSection}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["A", "B", "C", "D"].map(s => <SelectItem key={s} value={s}>Div {s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {(viewSemester || viewSection) && (
                                <Button variant="ghost" size="icon" onClick={clearFilters}>
                                    <FilterX className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <TabsContent value="grid">
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <div className="min-w-[800px]">
                                <div className="grid grid-cols-7 border-b bg-slate-50/50">
                                    <div className="p-4 text-center border-r font-semibold text-xs text-muted-foreground">Time</div>
                                    {weekDays.map(day => (
                                        <div key={day} className="p-4 text-center border-r font-semibold text-xs text-muted-foreground uppercase">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 min-h-[400px]">
                                    <div className="bg-slate-50/20 border-r flex flex-col items-center justify-center p-4">
                                        <span className="text-[10px] text-muted-foreground font-black rotate-[-90deg]">SCHEDULE</span>
                                    </div>
                                    {weekDays.map(day => (
                                        <div key={day} className="border-r p-2 flex flex-col gap-2 min-h-[100px]">
                                            {filteredEntries
                                                .filter(e => e.dayOfWeek === day)
                                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                                .map(entry => (
                                                    <div key={entry.id} className="p-3 rounded-lg border bg-white shadow-sm space-y-2 group">
                                                        <div className="flex justify-between items-start">
                                                            <div className="text-[9px] font-bold text-muted-foreground">
                                                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                                            </div>
                                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="h-5 w-5"><Edit2 className="h-2 w-2" /></Button>
                                                                <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} className="h-5 w-5"><Trash2 className="h-2 w-2" /></Button>
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-xs uppercase truncate">{entry.subject?.name}</div>
                                                        <div className="flex flex-col gap-1 text-[10px] text-muted-foreground font-medium">
                                                            <div className="flex items-center gap-1"><User className="w-3 h-3" /> {entry.staff?.name}</div>
                                                            <div className="flex items-center gap-1"><Building className="w-3 h-3" /> {entry.room || "Field"}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="list" className="m-0">
                    <Card className="border-slate-100 shadow-xl rounded-3xl overflow-hidden bg-white">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-100">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[120px] font-black text-xs uppercase text-slate-400 pl-8">Timeline</TableHead>
                                    <TableHead className="font-black text-xs uppercase text-slate-400">Academic Target</TableHead>
                                    <TableHead className="font-black text-xs uppercase text-slate-400">Faculty/Location</TableHead>
                                    <TableHead className="w-[100px] font-black text-xs uppercase text-slate-400 text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEntries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-20 italic">No schedules match the active filters.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEntries.map(entry => (
                                        <TableRow key={entry.id} className="group hover:bg-slate-50/80 transition-all border-slate-50">
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] uppercase">
                                                    {entry.dayOfWeek}
                                                </Badge>
                                                <div className="mt-1 text-xs font-medium text-muted-foreground">
                                                    {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold">{entry.subject?.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-primary">{entry.subject?.code}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">Sem {entry.semester} • Div {entry.section}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{entry.staff?.name}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">LOC: {entry.room || "N/A"}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
