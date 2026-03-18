import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react"

import { Exam } from "@/app/actions/exams/types"

export function ExamSchedule({ exams = [] }: { exams?: Exam[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  if (exams.length === 0) {
    return (
      <div className="p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center text-muted-foreground">
        <Calendar className="h-10 w-10 mb-2 opacity-20" />
        <p>No exams scheduled yet.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(exams.length / itemsPerPage)
  const currentExams = exams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-6">Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Exam Type</TableHead>
              <TableHead className="text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExams.map((schedule) => (
              <TableRow key={schedule.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="pl-6 ">
                  <div className="flex flex-col">
                    <span className="font-semibold">{schedule.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{schedule.code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    {new Date(schedule.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Clock className="h-3.5 w-3.5 text-orange-500" />
                    {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    {schedule.room}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal capitalize bg-background/50">
                    {schedule.type.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Badge className={
                    schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                      schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                        'bg-red-100 text-red-700 hover:bg-red-200'
                  }>
                    {schedule.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground italic">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, exams.length)}
            </span>{" "}
            of <span className="font-medium">{exams.length}</span> exams
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

