import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Calendar as CalendarIcon, Filter, Loader2 } from "lucide-react"
import { fetchMyAttendanceReport } from "@/app/actions/attendance/main"
import { getUserInfo } from "@/lib/session"
import { toast } from "sonner"

export function AttendanceHistory() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClass, setFilterClass] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    const res = await fetchMyAttendanceReport()
    if (res.success && res.data) {
      setHistory(res.data)
    } else {
      toast.error(res.error || "Failed to load history")
    }
    setLoading(false)
  }

  const filteredData = history.filter(h => {
    const matchesClass = filterClass === "all" || h.subject.name.includes(filterClass)
    const matchesSearch = h.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.section && h.section.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesClass && matchesSearch
  })

  // Get unique subject names for the filter
  const subjects = Array.from(new Set(history.map(h => h.subject.name)))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 w-[250px]"
            />
          </div>
          <Select defaultValue="all" onValueChange={setFilterClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {subjects.map(sub => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Showing {filteredData.length} records</span>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Class / Section</TableHead>
                  <TableHead>Students Marked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => {
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/20">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-blue-500" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{record.subject.name}</div>
                        <div className="text-xs text-muted-foreground">Semester {record.semester} ({record.section || 'All'})</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{record._count.records}</span> students
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`border-none font-normal italic ${record.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                          {record.status}
                        </Badge>
                        {record.isLocked && <Badge variant="outline" className="ml-2 border-red-200 text-red-600">Locked</Badge>}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <button className="text-sm font-medium text-blue-600 hover:underline">View Details</button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
