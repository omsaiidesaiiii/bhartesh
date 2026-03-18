"use client"

import React, { useState } from "react"
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  GraduationCap, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { generateCareerRoadmap } from "@/lib/gemini"
import { toast } from "sonner"
import Link from "next/link"

interface RoadmapItem {
  title: string
  description: string
  resources: { name: string; url: string }[]
}

interface RoadmapPhase {
  name: string
  items: RoadmapItem[]
}

interface RoadmapData {
  title: string
  description: string
  estimatedTime: string
  phases: RoadmapPhase[]
}

export default function CareerRoadmapPage() {
  const [goal, setGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<number[]>([0])

  // Load roadmap from local storage on mount
  React.useEffect(() => {
    const savedRoadmap = localStorage.getItem("ai_career_roadmap")
    if (savedRoadmap) {
      try {
        setRoadmap(JSON.parse(savedRoadmap))
      } catch (e) {
        console.error("Failed to parse saved roadmap", e)
      }
    }
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return

    setLoading(true)
    try {
      const data = await generateCareerRoadmap(goal)
      setRoadmap(data)
      setExpandedPhases([0]) // Expand first phase by default
      localStorage.setItem("ai_career_roadmap", JSON.stringify(data))
      toast.success("Roadmap generated successfully!")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to generate roadmap. Please check your API key.")
    } finally {
      setLoading(false)
    }
  }

  const clearRoadmap = () => {
    setRoadmap(null)
    setGoal("")
    localStorage.removeItem("ai_career_roadmap")
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const togglePhase = (index: number) => {
    setExpandedPhases((prev) => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/student/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">AI Career Roadmap</h1>
            <p className="text-muted-foreground max-w-xl">Tell us what you want to become, and our AI will chart a clear path with resources for you.</p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="rounded-[2rem] md:rounded-[2.5rem] border-none shadow-xl shadow-primary/5 dark:shadow-none bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-slate-950">
        <CardContent className="p-4 md:p-8">
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="e.g. Full Stack Web Developer..." 
                className="pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl border-primary/20 focus-visible:ring-primary bg-white"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
                type="submit" 
                size="lg" 
                className="h-12 md:h-14 px-8 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/95 shadow-lg shadow-primary/10 dark:shadow-none gap-2 w-full md:w-auto"
                disabled={loading || !goal.trim()}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 fill-current" />}
              {loading ? 'Generating...' : 'Generate Roadmap'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 md:py-20 space-y-4"
          >
            <div className="relative">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
            </div>
            <div className="text-center px-4">
                <p className="font-bold text-base md:text-lg text-foreground">Mapping your journey...</p>
                <p className="text-muted-foreground text-xs md:text-sm">Consulting our AI career advisors</p>
            </div>
          </motion.div>
        ) : roadmap ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Roadmap Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="md:col-span-2 rounded-3xl md:rounded-[2.5rem] overflow-hidden border-none shadow-lg bg-card transition-all hover:shadow-xl">
                    <CardHeader className="p-5 md:p-6 pb-4 md:pb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30 text-[10px] md:text-xs">Your Goal</Badge>
                            <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1 text-[10px] md:text-xs">
                                <Clock className="h-3 w-3" />
                                {roadmap.estimatedTime}
                            </Badge>
                        </div>
                        <CardTitle className="text-xl md:text-3xl font-bold line-clamp-2 md:line-clamp-none">{roadmap.title}</CardTitle>
                        <CardDescription className="text-sm md:text-base mt-2 line-clamp-3 md:line-clamp-none">{roadmap.description}</CardDescription>
                    </CardHeader>
                </Card>
                
                <Card className="rounded-3xl md:rounded-[2.5rem] border-none shadow-lg bg-primary text-primary-foreground">
                    <CardHeader className="p-5 md:p-6 pb-2 md:pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                            <Target className="h-5 w-5" />
                            Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 pt-0 md:pt-0 space-y-4">
                        <div className="flex items-center justify-between text-primary-foreground/90 text-xs md:text-sm">
                            <span>Phases</span>
                            <span className="font-bold">{roadmap.phases.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-primary-foreground/90 text-xs md:text-sm">
                            <span>Total Steps</span>
                            <span className="font-bold">{roadmap.phases.reduce((acc, p) => acc + p.items.length, 0)}</span>
                        </div>
                        <div className="pt-2 md:pt-4">
                            <div className="h-1.5 w-full bg-primary-foreground/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-foreground w-1/4 rounded-full" />
                            </div>
                            <p className="text-[10px] mt-2 text-primary-foreground/70 uppercase font-bold tracking-widest text-center">Ready to begin</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Phases */}
            <div className="space-y-6 relative before:absolute before:left-6 md:before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-primary/10 dark:before:bg-primary/20">
              {roadmap.phases.map((phase, phaseIdx) => (
                <div key={phaseIdx} className="relative pl-12 md:pl-16">
                  <button 
                    onClick={() => togglePhase(phaseIdx)}
                    className="absolute left-2.5 md:left-4 top-1 -translate-x-1/2 h-7 w-7 md:h-8 md:w-8 rounded-full bg-white border-2 border-primary dark:bg-slate-950 flex items-center justify-center z-10 transition-transform active:scale-95"
                  >
                    <span className="text-[10px] md:text-xs font-bold text-primary">{phaseIdx + 1}</span>
                  </button>

                  <div className="bg-white dark:bg-card border border-border/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <div 
                      className="p-4 md:p-5 flex items-center justify-between cursor-pointer select-none"
                      onClick={() => togglePhase(phaseIdx)}
                    >
                      <h3 className="text-base md:text-lg font-bold flex items-center gap-2 md:gap-3">
                        <span className="line-clamp-1">{phase.name}</span>
                        <Badge className="bg-primary/10 text-primary border-none pointer-events-none hidden sm:inline-flex">{phase.items.length} steps</Badge>
                      </h3>
                      {expandedPhases.includes(phaseIdx) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedPhases.includes(phaseIdx) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 md:p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {phase.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col">
                                <h4 className="text-sm md:text-base font-bold flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                  {item.title}
                                </h4>
                                <p className="text-xs md:text-sm text-muted-foreground flex-1 line-clamp-3 hover:line-clamp-none transition-all">
                                  {item.description}
                                </p>
                                
                                {item.resources && item.resources.length > 0 && (
                                  <div className="pt-2 space-y-2">
                                    <p className="text-[9px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Resources</p>
                                    <div className="flex flex-wrap gap-2">
                                      {item.resources.map((res, resIdx) => (
                                        <a 
                                            key={resIdx} 
                                            href={res.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1.5 rounded-lg md:rounded-xl bg-white dark:bg-slate-900 border border-primary/20 dark:border-primary/30 text-[10px] md:text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center gap-1.5"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          <span className="max-w-[100px] truncate">{res.name}</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 md:pt-8 text-center pb-4">
                <Button variant="outline" className="rounded-xl md:rounded-2xl gap-2 h-11 md:h-12 px-6 w-full md:w-auto" onClick={clearRoadmap}>
                    Generate Another Roadmap
                </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <GraduationCap className="h-12 w-12" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-bold">No Roadmap Generated Yet</h2>
                <p className="text-muted-foreground max-w-sm">Enter a career goal above to start your journey with AI-driven insights.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {['Full Stack Developer', 'Data Analyst', 'UI/UX Designer', 'Cloud Engineer'].map((suggestion) => (
                    <button 
                        key={suggestion}
                        onClick={() => setGoal(suggestion)}
                        className="px-4 py-2 rounded-full bg-slate-100 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
