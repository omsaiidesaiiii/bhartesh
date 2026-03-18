"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Trash2, ExternalLink, Image as ImageIcon, CalendarDays, PartyPopper, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { AcademicEvent } from "@/types/academic"
import { getEvents, deleteEvent } from "@/app/actions/events/main"
import { CreateEventDialog } from "@/components/academic/create-event-dialog"

const eventTypeConfig = {
    EVENT: { 
        label: "Event", 
        variant: "default" as const,
        icon: PartyPopper,
        color: "text-blue-600 bg-blue-50"
    },
    HOLIDAY: { 
        label: "Holiday", 
        variant: "secondary" as const,
        icon: CalendarDays,
        color: "text-green-600 bg-green-50"
    },
    EXAM: { 
        label: "Exam", 
        variant: "destructive" as const,
        icon: BookOpen,
        color: "text-red-600 bg-red-50"
    },
}

export default function EventsPage() {
    const [events, setEvents] = useState<AcademicEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        loadEvents()
    }, [])

    async function loadEvents() {
        setLoading(true)
        try {
            const data = await getEvents()
            setEvents(data)
        } catch {
            toast.error("Failed to load events")
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        setDeleting(id)
        const res = await deleteEvent(id)
        setDeleting(null)

        if (res.success) {
            toast.success(res.message)
            setEvents(events.filter(e => e.id !== id))
            if (selectedEvent?.id === id) {
                setDetailsOpen(false)
                setSelectedEvent(null)
            }
        } else {
            toast.error(res.message)
        }
    }

    function openEventDetails(event: AcademicEvent) {
        setSelectedEvent(event)
        setDetailsOpen(true)
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    function formatShortDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date())

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
                    <p className="text-muted-foreground">Manage academic events, holidays, and exams</p>
                </div>
                <CreateEventDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                        <p className="text-xs text-muted-foreground">All scheduled events</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                        <PartyPopper className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                        <p className="text-xs text-muted-foreground">Future events</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Holidays</CardTitle>
                        <CalendarDays className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.filter(e => e.type === "HOLIDAY").length}</div>
                        <p className="text-xs text-muted-foreground">Scheduled holidays</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exams</CardTitle>
                        <BookOpen className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.filter(e => e.type === "EXAM").length}</div>
                        <p className="text-xs text-muted-foreground">Scheduled exams</p>
                    </CardContent>
                </Card>
            </div>

            {/* Events Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Events</CardTitle>
                    <CardDescription>View and manage all academic events</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No events found</h3>
                            <p className="text-muted-foreground mb-4">Get started by creating your first event</p>
                            <CreateEventDialog />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Event</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Attachment</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map(event => {
                                    const config = eventTypeConfig[event.type]
                                    const Icon = config.icon
                                    const isPast = new Date(event.date) < new Date()
                                    
                                    return (
                                        <TableRow 
                                            key={event.id} 
                                            className={`cursor-pointer ${isPast ? 'opacity-60' : ''}`}
                                            onClick={() => openEventDetails(event)}
                                        >
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${config.color}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{event.title}</div>
                                                        {event.description && (
                                                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                                {event.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={config.variant}>{config.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatShortDate(event.date)}
                                                    {isPast && (
                                                        <Badge variant="outline" className="ml-2 text-[9px]">Past</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {event.attachmentUrl ? (
                                                    <a 
                                                        href={event.attachmentUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                                                    >
                                                        <ImageIcon className="h-4 w-4" />
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(event.id)
                                                    }}
                                                    disabled={deleting === event.id}
                                                >
                                                    <Trash2 className={`h-4 w-4 ${deleting === event.id ? 'animate-spin' : 'text-destructive'}`} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Event Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {(() => {
                                        const config = eventTypeConfig[selectedEvent.type]
                                        const Icon = config.icon
                                        return (
                                            <>
                                                <div className={`p-2 rounded-lg ${config.color}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                {selectedEvent.title}
                                            </>
                                        )
                                    })()}
                                </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Type</p>
                                        <Badge variant={eventTypeConfig[selectedEvent.type].variant}>
                                            {eventTypeConfig[selectedEvent.type].label}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                                    </div>
                                </div>
                                
                                {selectedEvent.description && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm">{selectedEvent.description}</p>
                                    </div>
                                )}
                                
                                {selectedEvent.attachmentUrl && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Attachment</p>
                                        <div className="border rounded-lg overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={selectedEvent.attachmentUrl} 
                                                alt="Event attachment"
                                                className="w-full max-h-[300px] object-contain bg-slate-50"
                                            />
                                            <div className="p-2 border-t bg-slate-50/50">
                                                <a 
                                                    href={selectedEvent.attachmentUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-primary hover:underline text-sm justify-center"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Open in new tab
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(selectedEvent.id)}
                                        disabled={deleting === selectedEvent.id}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Event
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
