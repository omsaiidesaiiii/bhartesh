import { StaffStatsCards } from "@/components/staff-dashboard/stats-cards"
import { StaffQuickActions } from "@/components/staff-dashboard/quick-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeaturedEventsCarousel } from "@/components/dashboard/featured-events-carousel"
import { getStaffDashboardData } from "@/lib/dashboard-api"

export const dynamic = 'force-dynamic'

export default async function StaffDashboardPage() {
  const data = await getStaffDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Staff Dashboard</h1>
      </div>
      
      {/* Featured Events Carousel */}
      {data.featuredEvents && data.featuredEvents.length > 0 && (
        <FeaturedEventsCarousel events={data.featuredEvents} />
      )}
      
      <StaffStatsCards stats={data.stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-muted/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted/30 rounded-xl bg-muted/5">
                <div className="text-center">
                    <p className="font-medium text-lg">Activity & Attendance Analytics</p>
                    <p className="text-sm">Detailed charts and graphs will appear here</p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-muted/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {data.schedule.map((item: { subject: string; class: string; time: string; status: string }, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-muted/20">
                        <div className="space-y-1">
                            <p className="font-medium text-sm">{item.subject}</p>
                            <p className="text-xs text-muted-foreground">{item.class}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-xs font-semibold">{item.time}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                item.status === "Completed" ? "bg-green-100 text-green-700" :
                                item.status === "Ongoing" ? "bg-blue-100 text-blue-700" :
                                "bg-orange-100 text-orange-700"
                            }`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
                {data.schedule.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No classes scheduled for today</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      <StaffQuickActions />
    </div>
  )
}
