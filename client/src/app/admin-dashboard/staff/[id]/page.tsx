"use client"

import {
    Mail,
    Phone,
    MapPin,
    BookOpen,
    Users,
    Clock,
    Plus,
    MoreHorizontal
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { fetchUserById, assignSubjectToStaff } from "@/app/actions/user/main"
import { fetchSubjects } from "@/app/actions/subject/main"
import type { User } from "@/app/actions/user/types"
import type { Subject } from "@/app/actions/subject/types"
import { toast } from "sonner"

export default function StaffProfilePage() {
    const params = useParams()
    const id = params.id as string
    const [staff, setStaff] = useState<User | null>(null)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [assigning, setAssigning] = useState(false)
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            const [staffResult, subjectsResult] = await Promise.all([
                fetchUserById(id),
                fetchSubjects()
            ])

            if (staffResult.success && staffResult.data) {
                setStaff(staffResult.data)
            } else {
                toast.error(staffResult.error || "Failed to load staff details")
            }

            if (subjectsResult.success && subjectsResult.data) {
                setSubjects(subjectsResult.data)
            }
            setLoading(false)
        }
        if (id) loadData()
    }, [id])

    const handleAssignSubject = async () => {
        if (!selectedSubjectId) return
        setAssigning(true)
        const result = await assignSubjectToStaff(id, selectedSubjectId)
        if (result.success) {
            toast.success("Subject assigned successfully")
            // Refresh staff data
            const refreshResult = await fetchUserById(id)
            if (refreshResult.success && refreshResult.data) setStaff(refreshResult.data)
        } else {
            toast.error(result.error || "Failed to assign subject")
        }
        setAssigning(false)
    }

    if (loading) return <div className="flex items-center justify-center h-64">Loading staff details...</div>
    if (!staff) return <div className="flex items-center justify-center h-64">Staff not found</div>

    const assignments = staff.staffSubjects?.map(ss => ({
        id: ss.id,
        subject: ss.subject.name,
        code: ss.subject.code,
        class: staff.department?.name || "N/A", // Use department as placeholder for class if not explicitly stored
        hours: 4 // Placeholder
    })) || []

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                    <AvatarImage src="/avatars/01.png" alt={staff.name} />
                    <AvatarFallback className="text-2xl">{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{staff.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{staff.role}</span>
                        <span>•</span>
                        <span>{staff.department?.name || "No Department"}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" /> {staff.email}
                        </div>
                        <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" /> {staff.phone}
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> {staff.profile?.location || "N/A"}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit Profile</Button>
                    <Button variant="secondary">Contact</Button>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <Tabs defaultValue="classes" className="w-full">
                        <TabsList>
                            <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule</TabsTrigger>
                            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                        </TabsList>

                        <TabsContent value="classes" className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Assigned Subjects</h3>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Assign Class</Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Assign Subject</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Assign Subject</DialogTitle>
                                                <DialogDescription>
                                                    Assign a new subject to this faculty member.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="subject" className="text-right">Subject</Label>
                                                    <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
                                                        <SelectTrigger className="col-span-3">
                                                            <SelectValue placeholder="Select subject" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {subjects.map(subject => (
                                                                <SelectItem key={subject.id} value={subject.id}>
                                                                    {subject.code} - {subject.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="class" className="text-right">Class</Label>
                                                    <Select>
                                                        <SelectTrigger className="col-span-3">
                                                            <SelectValue placeholder="Select class (Coming Soon)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">Not available yet</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" onClick={handleAssignSubject} disabled={assigning || !selectedSubjectId}>
                                                    {assigning ? "Assigning..." : "Assign"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Subject Name</TableHead>
                                                <TableHead>Class/Section</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Hours/Week</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignments.map(assign => (
                                                <TableRow key={assign.id}>
                                                    <TableCell className="font-medium">
                                                        <div>{assign.subject}</div>
                                                        <div className="text-xs text-muted-foreground">{assign.code}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{assign.class}</Badge>
                                                    </TableCell>
                                                    <TableCell>Core</TableCell>
                                                    <TableCell>{assign.hours}h</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schedule" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Weekly Schedule</CardTitle>
                                    <CardDescription>Timetable view for current semester.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] flex items-center justify-center border-dashed border rounded-md m-4 bg-muted/20">
                                    <p className="text-muted-foreground">Timetable Visualization Placeholder</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workload Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">Total Hours</span>
                                </div>
                                <span className="font-bold">15h/week</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                        <BookOpen className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <span className="text-sm font-medium">Subjects</span>
                                </div>
                                <span className="font-bold">3</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium">Classes</span>
                                </div>
                                <span className="font-bold">3</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Bio</p>
                                <p>{staff.profile?.bio || "No bio available"}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Specialization</p>
                                <p>N/A</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Joined</p>
                                <p>{new Date(staff.createdAt).toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
