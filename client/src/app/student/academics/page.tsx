"use client"

import React, { useState } from "react"
import { 
  Book, 
  FileText, 
  Download, 
  Search,
  Filter,
  Archive,
  GraduationCap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const subjects = [
  "Quantum Mechanics",
  "Advanced Data Structures",
  "Numerical Analysis",
  "Digital Electronics",
  "Eng. Mathematics"
]

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]

const notesData = [
  { id: 1, title: "Quantum Tunneling Basics", subject: "Quantum Mechanics", sem: "5", type: "PDF", size: "2.4 MB", date: "Oct 20, 2024" },
  { id: 2, title: "B-Tree Optimization", subject: "Advanced Data Structures", sem: "5", type: "PDF", size: "1.2 MB", date: "Nov 02, 2024" },
  { id: 3, title: "Newton-Raphson Method", subject: "Numerical Analysis", sem: "5", type: "PDF", size: "0.8 MB", date: "Sep 28, 2024" },
  { id: 4, title: "Vector Calculus Notes", subject: "Eng. Mathematics", sem: "3", type: "PDF", size: "3.5 MB", date: "Aug 15, 2024" },
]

const pyqData = [
  { id: 1, title: "End-Sem Exam 2023", subject: "Quantum Mechanics", sem: "5", type: "PDF", size: "1.1 MB", year: "2023" },
  { id: 2, title: "Mid-Sem Exam 2022", subject: "Advanced Data Structures", sem: "5", type: "PDF", size: "0.9 MB", year: "2022" },
  { id: 3, title: "Annual Exam 2021", subject: "Numerical Analysis", sem: "5", type: "PDF", size: "1.5 MB", year: "2021" },
  { id: 4, title: "Entrance Mock Paper", subject: "Digital Electronics", sem: "3", type: "PDF", size: "1.2 MB", year: "2023" },
]

export default function StudentAcademicsPage() {
  const [activeTab, setActiveTab] = useState("notes")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [semFilter, setSemFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filterContent = (data: any[]) => {
    return data.filter(item => {
      const matchesSubject = subjectFilter === "all" || item.subject === subjectFilter;
      const matchesSem = semFilter === "all" || item.sem === semFilter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSem && matchesSearch;
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <section>
        <h2 className="text-2xl font-black text-foreground tracking-tight italic">Knowledge Vault</h2>
        <p className="text-muted-foreground text-sm font-medium">Access study notes and past examination papers.</p>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-2xl border border-border/50 w-full flex">
            <TabsTrigger value="notes" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex gap-2 items-center justify-center text-muted-foreground">
                <Book className="h-4 w-4" /> Notes
            </TabsTrigger>
            <TabsTrigger value="pyqs" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex gap-2 items-center justify-center text-muted-foreground">
                <Archive className="h-4 w-4" /> Papers
            </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search titles..." 
                    className="pl-11 h-12 rounded-2xl bg-card border border-border shadow-sm focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-fit min-w-[120px] h-9 rounded-full border border-border bg-card shadow-sm font-bold text-[11px] ring-0 focus:ring-1 focus:ring-primary gap-2">
                        <Filter className="h-3 w-3 text-muted-foreground" /><SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-border shadow-xl">
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={semFilter} onValueChange={setSemFilter}>
                    <SelectTrigger className="w-fit min-w-[100px] h-9 rounded-full border border-border bg-card shadow-sm font-bold text-[11px] ring-0 focus:ring-1 focus:ring-primary gap-2">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" /><SelectValue placeholder="Sem" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-border shadow-xl">
                        <SelectItem value="all">All Sems</SelectItem>
                        {semesters.map(s => <SelectItem key={s} value={s}>Sem {s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <TabsContent value="notes" className="space-y-4 outline-none">
            <div className="grid gap-3">
                {filterContent(notesData).map((item) => (
                    <div key={item.id} className="p-4 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all">
                        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-foreground truncate">{item.title}</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">{item.subject} • {item.size}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="pyqs" className="space-y-4 outline-none">
            <div className="grid gap-3">
                {filterContent(pyqData).map((item) => (
                    <div key={item.id} className="p-4 rounded-3xl bg-card border border-border shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Archive className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-foreground truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">{item.subject} • {item.size}</p>
                                <span className="text-[10px] text-primary font-black px-1.5 py-0.5 bg-primary/10 rounded-md tracking-tighter">{item.year}</span>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-primary bg-primary/10 hover:bg-primary/20 transition-all">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

