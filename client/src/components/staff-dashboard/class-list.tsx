import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TimetableEntry } from "@/types/academic"
import { format } from "date-fns"

interface ClassListProps {
  timetable: TimetableEntry[]
}

export function ClassList({ timetable }: ClassListProps) {
  // Deduplicate classes by subject, section, and semester
  const uniqueClasses = Array.from(new Set(timetable.map(t => `${t.subjectId}-${t.section}-${t.semester}`)))
    .map(key => {
      return timetable.find(t => `${t.subjectId}-${t.section}-${t.semester}` === key)
    })
    .filter(Boolean) as TimetableEntry[]

  if (uniqueClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-md border bg-card text-muted-foreground">
        <p>No classes assigned yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueClasses.map((cls) => {
            const classSchedule = timetable
              .filter(t => t.subjectId === cls.subjectId && t.section === cls.section && t.semester === cls.semester)
              .map(t => t.dayOfWeek.slice(0, 3))
              .join(", ")

            return (
              <TableRow key={cls.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div>
                    <span className="block font-semibold">{cls.subject?.name}</span>
                    <span className="text-xs text-muted-foreground">{cls.subject?.code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{cls.section}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">Semester {cls.semester}</span>
                </TableCell>
                <TableCell>{cls.room || "N/A"}</TableCell>
                <TableCell>{classSchedule}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Active</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
