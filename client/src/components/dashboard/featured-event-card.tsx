"use client"

import { useState } from "react"
import { Calendar, ChevronRight, PartyPopper, CalendarDays, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FeaturedEvent } from "@/lib/dashboard-api"

interface FeaturedEventCardProps {
    event: FeaturedEvent
}

const eventTypeConfig = {
    EVENT: { 
        label: "Event", 
        icon: PartyPopper,
        gradient: "from-blue-600/80 via-blue-500/60 to-transparent"
    },
    HOLIDAY: { 
        label: "Holiday", 
        icon: CalendarDays,
        gradient: "from-green-600/80 via-green-500/60 to-transparent"
    },
    EXAM: { 
        label: "Exam", 
        icon: BookOpen,
        gradient: "from-red-600/80 via-red-500/60 to-transparent"
    },
}

const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"

export function FeaturedEventCard({ event }: FeaturedEventCardProps) {
    const [detailsOpen, setDetailsOpen] = useState(false)
    const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig] || eventTypeConfig.EVENT
    const Icon = config.icon

    const isDescriptionLong = event.description && event.description.length > 80
    const truncatedDescription = isDescriptionLong 
        ? event.description?.substring(0, 80) + "..." 
        : event.description

    return (
        <>
            <div 
                className="relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setDetailsOpen(true)}
            >
                {/* Background Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={event.attachmentUrl || DEFAULT_EVENT_IMAGE}
                    alt={event.title}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                        <Badge 
                            variant="secondary" 
                            className="bg-white/20 backdrop-blur-sm text-white border-0 text-[10px] font-bold uppercase tracking-wider"
                        >
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                        </Badge>
                        <span className="text-white/70 text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {event.date}
                        </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 line-clamp-2">
                        {event.title}
                    </h3>
                    
                    {/* Description */}
                    {event.description && (
                        <div className="flex items-end gap-2">
                            <p className="text-white/80 text-sm line-clamp-2 flex-1">
                                {truncatedDescription}
                            </p>
                            {isDescriptionLong && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-white/90 hover:text-white hover:bg-white/10 shrink-0 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDetailsOpen(true)
                                    }}
                                >
                                    View Details
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
                    {/* Header Image */}
                    {event.attachmentUrl && (
                        <div className="relative h-48 w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={event.attachmentUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <Badge 
                                    variant="secondary" 
                                    className="bg-white/20 backdrop-blur-sm text-white border-0 text-[10px] font-bold uppercase tracking-wider mb-2"
                                >
                                    <Icon className="h-3 w-3 mr-1" />
                                    {config.label}
                                </Badge>
                                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                            </div>
                        </div>
                    )}
                    
                    <div className="p-6">
                        {!event.attachmentUrl && (
                            <DialogHeader className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                        <Icon className="h-3 w-3 mr-1" />
                                        {config.label}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-xl">{event.title}</DialogTitle>
                            </DialogHeader>
                        )}
                        
                        <div className="space-y-4">
                            {/* Date */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                                    <p className="font-medium">{event.date}</p>
                                </div>
                            </div>
                            
                            {/* Description */}
                            {event.description && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
                                    <p className="text-sm text-foreground/80 leading-relaxed">{event.description}</p>
                                </div>
                            )}
                            
                            {/* View Attachment Link */}
                            {event.attachmentUrl && (
                                <div className="pt-2">
                                    <a 
                                        href={event.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                                    >
                                        View Full Image
                                        <ChevronRight className="h-4 w-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
