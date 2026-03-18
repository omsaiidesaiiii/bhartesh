import {
  Users,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  LucideIcon,
  Megaphone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const iconMap: Record<string, LucideIcon> = {
  Users,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Megaphone,
}

interface StatItem {
  title: string
  value: string
  icon: string
  description: string
  color?: string
}

export function StaffStatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon] || Users
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color || 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
