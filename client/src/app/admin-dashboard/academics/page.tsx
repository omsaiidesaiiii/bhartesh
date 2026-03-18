"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar as CalendarIcon, Clock, Layers, Edit, BookOpen, GraduationCap, Users } from "lucide-react"
import { IconUsers } from "@tabler/icons-react"
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StaffAssignment } from "@/components/academic/staff-assignment"
import { HodAssignment } from "@/components/academic/hod-assignment"
import { TimetableManager } from "@/components/academic/timetable-manager"
import { AcademicDirectory } from "@/components/academic/academic-directory"
import { AcademicYear, AcademicEvent, Department } from "@/types/academic"
import { getAcademicYears, getEvents, getDepartments } from "@/app/actions/acdemics/main"
import { toast } from "sonner"
import { CreateAcademicYearDialog } from "@/components/academic/create-year-dialog"
import { CreateEventDialog } from "@/components/academic/create-event-dialog"
import { CreateSubjectDialog } from "@/components/academic/create-subject-dialog"
import type { DayButtonProps } from "react-day-picker"

export default function AcademicsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Data State
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
    const [events, setEvents] = useState<AcademicEvent[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Fetch Data
    useEffect(() => {
        async function loadData() {
            try {
                const [yearsData, eventsData, deptsData] = await Promise.all([
                    getAcademicYears(),
                    getEvents(),
                    getDepartments()
                ])
                setAcademicYears(yearsData || [])
                setEvents(eventsData || [])
                setDepartments(deptsData || [])
            } catch (error) {
                toast.error("Failed to load academic data")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Create a map of dates to events for quick lookup
    const eventsByDate = useMemo(() => {
        const map = new Map<string, AcademicEvent[]>();
        events.forEach(event => {
            const dateKey = new Date(event.date).toDateString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(event);
        });
        return map;
    }, [events]);

    // Custom DayButton component with tooltip
    const CustomDayButton = (props: DayButtonProps) => {
        const { day, ...buttonProps } = props;
        const dateKey = day.date.toDateString();
        const dayEvents = eventsByDate.get(dateKey);

        if (dayEvents && dayEvents.length > 0) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button {...buttonProps}>{day.date.getDate()}</button>
                        </TooltipTrigger>
                        <TooltipContent 
                            side="top" 
                            className="max-w-[200px] bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl"
                        >
                            <div className="space-y-1">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                            event.type === 'HOLIDAY' ? 'bg-amber-400' :
                                            event.type === 'EXAM' ? 'bg-blue-400' : 'bg-red-400'
                                        }`} />
                                        <span className="text-xs font-medium">{event.title}</span>
                                    </div>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return <button {...buttonProps}>{day.date.getDate()}</button>;
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Academic Operations</h1>
                    <p className="text-muted-foreground">Manage institutional structure, scheduling, and faculty assignments.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                        <Users className="h-3 w-3" /> {departments.length} Departments
                    </div>
                </div>
            </div>

            <Tabs defaultValue="structure" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="structure">Structure</TabsTrigger>
                    <TabsTrigger value="timetable">Timetable</TabsTrigger>
                    <TabsTrigger value="faculty">Assignments</TabsTrigger>
                    <TabsTrigger value="directory">Directory</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{departments.length}</div>
                                <p className="text-xs text-muted-foreground">Active academic units</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Academic Years</CardTitle>
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{academicYears.length}</div>
                                <p className="text-xs text-muted-foreground">Terms configured</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-12 items-start">
                        {/* Years Section */}
                        <Card className="md:col-span-12 lg:col-span-7">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Academic Sessions</CardTitle>
                                        <CardDescription>Track active and upcoming academic periods</CardDescription>
                                    </div>
                                    <CreateAcademicYearDialog />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50/30">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="pl-8 font-black text-[11px] uppercase tracking-widest text-slate-400">Term Label</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-400">Duration</TableHead>
                                            <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-400">System Status</TableHead>
                                            <TableHead className="text-right pr-8 font-black text-[11px] uppercase tracking-widest text-slate-400">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {academicYears.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No academic years configured.</TableCell>
                                            </TableRow>
                                        ) : (
                                            academicYears.map(year => (
                                                <TableRow key={year.id}>
                                                    <TableCell className="font-medium">{year.name}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={year.status === "ACTIVE" ? "default" : "secondary"}>
                                                            {year.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">Edit</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Dept/HOD Section */}
                        <div className="md:col-span-12 lg:col-span-5 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Departmental Heads</CardTitle>
                                    <CardDescription>Academic leadership across units</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {departments.length === 0 ? (
                                            <div className="p-6 text-center text-muted-foreground italic">No departments found.</div>
                                        ) : (
                                            departments.map(dept => (
                                                <div key={dept.id} className="flex items-center justify-between p-4">
                                                    <div>
                                                        <div className="font-medium">{dept.name}</div>
                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">HOD</div>
                                                    </div>
                                                    <div className="text-right">
                                                        {dept.hod?.staff?.name ? (
                                                            <div className="text-sm font-semibold text-primary">{dept.hod.staff.name}</div>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[9px] font-bold">VACANT</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-primary/10">
                                <CardContent className="p-6 flex flex-col gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            Subject Library
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Manage institutional course modules.</p>
                                    </div>
                                    <CreateSubjectDialog />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- Timetable Tab --- */}
                <TabsContent value="timetable" className="m-0 border-none outline-none">
                    <TimetableManager />
                </TabsContent>

                {/* --- Faculty & Subjects Tab --- */}
                <TabsContent value="faculty" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
                        <div className="lg:col-span-2">
                            <StaffAssignment />
                        </div>
                        <div className="lg:col-span-1">
                            <HodAssignment />
                        </div>
                    </div>
                </TabsContent>

                {/* --- Directory Tab --- */}
                <TabsContent value="directory" className="m-0 border-none outline-none">
                    <AcademicDirectory />
                </TabsContent>

                {/* --- Calendar Tab --- */}
                <TabsContent value="calendar" className="space-y-4">
                    {/* Calendar Legend */}
                    <div className="flex flex-wrap items-center gap-4 px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-xs text-muted-foreground">Event</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-xs text-muted-foreground">Holiday</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-xs text-muted-foreground">Exam</span>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12 items-start">
                        <Card className="md:col-span-12 lg:col-span-8 overflow-hidden border-0 shadow-xl">
                            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                            <CalendarIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Academic Calendar</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {events.length} events scheduled
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">
                                            {new Date().toLocaleString('default', { month: 'long' })}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date().getFullYear()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-6 bg-gradient-to-b from-slate-50/50 to-white">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    modifiers={{
                                        event: events.filter(e => e.type === "EVENT").map(e => new Date(e.date)),
                                        holiday: events.filter(e => e.type === "HOLIDAY").map(e => new Date(e.date)),
                                        exam: events.filter(e => e.type === "EXAM").map(e => new Date(e.date)),
                                    }}
                                    modifiersClassNames={{
                                        event: "!bg-red-500 !text-white hover:!bg-red-600 font-bold",
                                        holiday: "!bg-amber-500 !text-white hover:!bg-amber-600 font-bold",
                                        exam: "!bg-blue-500 !text-white hover:!bg-blue-600 font-bold",
                                    }}
                                    className="rounded-xl border-0 shadow-sm bg-white w-full"
                                    classNames={{
                                        months: "relative flex flex-col sm:flex-row gap-4 w-full justify-center",
                                        month: "space-y-4 w-full",
                                        month_caption: "flex justify-center pt-2 relative items-center mb-4",
                                        caption_label: "text-lg font-semibold text-foreground",
                                        nav: "flex items-center gap-1",
                                        button_previous: "absolute left-2 h-9 w-9 bg-slate-100 hover:bg-slate-200 rounded-lg p-0 opacity-70 hover:opacity-100 transition-all inline-flex items-center justify-center border-0 z-10",
                                        button_next: "absolute right-2 h-9 w-9 bg-slate-100 hover:bg-slate-200 rounded-lg p-0 opacity-70 hover:opacity-100 transition-all inline-flex items-center justify-center border-0 z-10",
                                        month_grid: "w-full border-collapse",
                                        weekdays: "grid grid-cols-7",
                                        weekday: "text-muted-foreground font-semibold text-xs uppercase tracking-wider h-10 flex items-center justify-center",
                                        week: "grid grid-cols-7 mt-1",
                                        day: "h-12 w-full text-center text-sm p-1 relative flex items-center justify-center",
                                        day_button: "h-10 w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center",
                                        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg",
                                        today: "bg-slate-100 text-slate-900 font-bold ring-2 ring-primary/20 rounded-lg",
                                        outside: "text-muted-foreground opacity-30",
                                        disabled: "text-muted-foreground opacity-50",
                                        hidden: "invisible",
                                    }}
                                    components={{
                                        DayButton: CustomDayButton,
                                    }}
                                />
                            </CardContent>
                        </Card>

                        <div className="md:col-span-12 lg:col-span-4 space-y-4">
                            {/* Selected Date Info */}
                            {date && (
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-medium uppercase tracking-wider opacity-80">
                                                    Selected Date
                                                </div>
                                                <div className="text-3xl font-bold mt-1">
                                                    {date.getDate()}
                                                </div>
                                                <div className="text-sm opacity-90">
                                                    {date.toLocaleString('default', { weekday: 'long', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-6xl font-black opacity-20">
                                                {date.toLocaleString('default', { month: 'short' })}
                                            </div>
                                        </div>
                                        {events.filter(e => {
                                            const eventDate = new Date(e.date);
                                            return eventDate.toDateString() === date.toDateString();
                                        }).length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
                                                    Events on this day
                                                </div>
                                                {events.filter(e => {
                                                    const eventDate = new Date(e.date);
                                                    return eventDate.toDateString() === date.toDateString();
                                                }).map(event => (
                                                    <div key={event.id} className="text-sm font-medium flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            event.type === 'HOLIDAY' ? 'bg-amber-400' :
                                                            event.type === 'EXAM' ? 'bg-blue-400' : 'bg-red-400'
                                                        }`} />
                                                        {event.title}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border-0 shadow-lg overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            Upcoming Events
                                        </CardTitle>
                                        <Badge variant="secondary" className="font-bold">
                                            {events.length}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="divide-y p-0">
                                    {events.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-muted-foreground">No events scheduled</p>
                                        </div>
                                    ) : (
                                        events.slice(0, 4).map(event => (
                                            <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors">
                                                <div className={`p-3 rounded-xl text-center min-w-[3.5rem] ${
                                                    event.type === 'HOLIDAY' ? 'bg-amber-100 text-amber-700' :
                                                    event.type === 'EXAM' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                                    </div>
                                                    <div className="text-xl font-black">
                                                        {new Date(event.date).getDate()}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm truncate">{event.title}</div>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-[9px] uppercase tracking-wider mt-1 border-0 ${
                                                            event.type === 'HOLIDAY' ? 'bg-amber-100 text-amber-700' :
                                                            event.type === 'EXAM' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        {event.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div className="p-3 bg-slate-50/50 border-t">
                                        <Link href="/admin-dashboard/events">
                                            <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                                                View All Events
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                            <CreateEventDialog />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
