import React from "react"
import Link from "next/link"
import { 
  CheckCircle2, 
  BookOpen, 
  Award, 
  FileText, 
  ChevronRight,
  Sparkles,
  Compass
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeaturedEventsCarousel } from "@/components/dashboard/featured-events-carousel"
import { getStudentDashboardData, StudentDashboardData } from "@/lib/dashboard-api"

export const dynamic = 'force-dynamic'

type ActionItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  value: string;
}

export default async function StudentDashboard() {
  const data: StudentDashboardData = await getStudentDashboardData();

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Attendance': CheckCircle2,
    'Assignments': FileText,
    'Subjects': BookOpen,
    'Internal Marks': Award,
  };

  const mainActions: ActionItem[] = data.stats.map((stat) => ({
    label: stat.label,
    icon: iconMap[stat.label] || CheckCircle2,
    iconColor: "text-primary",
    value: stat.value
  }))

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Header */}
      <section className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Hey, {data.name.split(' ')[0]} 👋</h2>
            <p className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <Avatar className="h-12 w-12 border border-border shadow-sm">
            <AvatarImage src="" />
            <AvatarFallback>{data.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </section>

      {/* Featured Events Carousel */}
      {data.featuredEvents && data.featuredEvents.length > 0 && (
        <section>
          <FeaturedEventsCarousel events={data.featuredEvents} />
        </section>
      )}

      {/* Career Roadmap Quick Action */}
      <section>
        <Link href="/student/roadmap" className="block p-6 rounded-[2.5rem] bg-primary hover:bg-primary/95 transition-all cursor-pointer shadow-xl shadow-primary/10 dark:shadow-none group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Sparkles className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Powered</span>
              </div>
              <h3 className="text-xl font-bold text-primary-foreground">Career Roadmap</h3>
              <p className="text-primary-foreground/80 text-sm">Generate your personalized career path</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </Link>
      </section>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {mainActions.map((action, i) => (
            <div key={i} className="p-5 rounded-3xl bg-card border border-border/50 active:scale-95 transition-all cursor-pointer shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <action.icon className={`h-4 w-4 ${action.iconColor} stroke-[2.5]`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{action.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{action.value}</p>
            </div>
        ))}
      </section>


      {/* Upcoming Deadlines */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Upcoming Exams</h3>
        <div className="space-y-3">
            {data.upcomingExams.map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-card border border-border active:bg-muted/50 transition-colors cursor-pointer shadow-sm">
                    <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{task.date}</span>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
            ))}
            {data.upcomingExams.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No upcoming exams</p>
            )}
        </div>
      </section>
    </div>
  )
}

