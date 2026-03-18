"use client"

import React from "react"
import { 
  Bell, 
  BookOpen, 
  Award, 
  Calendar, 
  Info,
  CheckCircle2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const notifications = [
  {
    id: 1,
    title: "Mid-Term Examination Schedule Out",
    description: "The schedule for Mid-Term examinations for Semester 5 is now available in the downloads section.",
    category: "Academic",
    time: "2 hours ago",
    icon: Calendar,
    color: "text-primary",
    bg: "bg-primary/10",
    isNew: true
  },
  {
    id: 2,
    title: "Project Submission Deadline Extended",
    description: "The deadline for the Quantum Mechanics project has been extended to Dec 25. Please check updated rubrics.",
    category: "Exams",
    time: "5 hours ago",
    icon: Award,
    color: "text-destructive",
    bg: "bg-destructive/10",
    isNew: true
  },
  {
    id: 3,
    title: "Guest Lecture: AI in Healthcare",
    description: "Join us for an insightful guest session by Dr. Sarah J. on the impact of AI in modern medicine.",
    category: "Events",
    time: "Yesterday",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
    isNew: false
  },
  {
    id: 4,
    title: "System Update Complete",
    description: "The campus ERP has been updated successfully. You can now access new fee payment options.",
    category: "System",
    time: "2 days ago",
    icon: Info,
    color: "text-muted-foreground",
    bg: "bg-muted",
    isNew: false
  }
]

export default function StudentNotificationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Notices</h2>
            <p className="text-muted-foreground text-sm font-medium">Stay updated with latest campus alerts.</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="h-5 w-5" />
        </div>
      </section>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-2xl border border-border/50 w-full flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="all" className="flex-1 rounded-xl font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground text-xs">
                All
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex-1 rounded-xl font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground text-xs">
                Academic
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1 rounded-xl font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground text-xs">
                Events
            </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 outline-none">
            {notifications.map((item) => (
                <div key={item.id} className={`p-5 rounded-3xl bg-card border border-border shadow-sm relative active:bg-muted/50 transition-colors cursor-pointer ${item.isNew ? 'ring-1 ring-primary/20' : ''}`}>
                    <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">{item.time}</span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground leading-snug">{item.title}</h3>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                        {item.isNew && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                        )}
                    </div>
                </div>
            ))}
        </TabsContent>

        <TabsContent value="academic" className="space-y-4 outline-none">
            {notifications.filter(n => n.category === 'Academic' || n.category === 'Exams').map((item) => (
                <div key={item.id} className="p-5 rounded-3xl bg-card border border-border shadow-sm relative active:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">{item.time}</span>
                            </div>
                            <h3 className="text-sm font-bold text-foreground leading-snug">{item.title}</h3>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </TabsContent>
      </Tabs>

      <section className="bg-muted rounded-3xl p-6 border border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-muted-foreground">No archival notices</p>
        </div>
        <button className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1.5 rounded-full bg-card border border-border">
            Past Records
        </button>
      </section>
    </div>
  )
}

