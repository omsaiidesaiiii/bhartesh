import { Card, CardContent } from "@/components/ui/card"
import { TimetableEntry } from "@/types/academic"
import { format } from "date-fns"

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
const timeSlots = ["09:00", "10:30", "12:00", "14:00", "15:30"]

interface ClassTimetableProps {
  timetable: TimetableEntry[]
}

export function ClassTimetable({ timetable }: ClassTimetableProps) {
  if (timetable.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <p>No schedule available yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-7 border-b bg-muted/30">
          <div className="p-4 font-semibold text-center border-r">Time</div>
          {days.map((day) => (
            <div key={day} className="p-4 font-semibold text-center border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {timeSlots.map((slot) => (
          <div key={slot} className="grid grid-cols-7 border-b last:border-b-0">
            <div className="p-4 text-sm font-medium text-center bg-muted/10 border-r">{slot}</div>
            {days.map((day) => {
              const session = timetable.find((d) => {
                const sessionTime = format(new Date(d.startTime), "HH:mm")
                return d.dayOfWeek === day && sessionTime === slot
              })
              
              return (
                <div key={`${day}-${slot}`} className="p-2 border-r last:border-r-0 min-h-[100px]">
                  {session ? (
                    <Card className="h-full bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm">
                      <CardContent className="p-3">
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{session.subject?.name}</p>
                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400">Class: {session.section}</p>
                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400">Room: {session.room || "N/A"}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                       <span className="text-[10px] text-muted-foreground/30">---</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
