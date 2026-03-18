"use client"

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
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Search, Filter, Calendar, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPYQs, deletePYQ, type PYQItem } from "@/lib/storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PYQListProps {
  refreshKey?: number
}

export function PYQList({ refreshKey }: PYQListProps) {
  const [pyqData, setPyqData] = useState<PYQItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [yearFilter, setYearFilter] = useState("all")

  useEffect(() => {
    loadPYQs()
  }, [refreshKey])

  const loadPYQs = () => {
    const storedPyqs = getPYQs()
    setPyqData(storedPyqs)
  }

  const handleDelete = (id: string) => {
    deletePYQ(id)
    loadPYQs()
  }

  const handleView = (fileUrl: string) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank")
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (fileUrl) {
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = fileName || "download"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Filter data based on search and year
  const filteredData = pyqData.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesYear = yearFilter === "all" || paper.year === yearFilter
    return matchesSearch && matchesYear
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search question papers..."
              className="pl-9 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[130px] bg-background/50">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 dark:bg-blue-900/20"
          >
            {filteredData.length} Papers
          </Badge>
          <Badge variant="outline">Official</Badge>
        </div>
      </div>

      <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-6">Paper Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Exam Type</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No question papers found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((paper) => (
                <TableRow key={paper.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-white/5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block">{paper.title}</span>
                        {paper.size && (
                          <span className="text-xs text-muted-foreground">{paper.size}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {paper.subject}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{paper.semester}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {paper.year}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        paper.type === "Main Exam"
                          ? "bg-green-100 text-green-700 border-none"
                          : paper.type === "Sessional"
                          ? "bg-blue-100 text-blue-700 border-none"
                          : "bg-orange-100 text-orange-700 border-none"
                      }
                    >
                      {paper.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => handleView(paper.fileUrl)}
                        disabled={!paper.fileUrl}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600"
                        onClick={() => handleDownload(paper.fileUrl, paper.fileName)}
                        disabled={!paper.fileUrl}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question Paper</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{paper.title}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(paper.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
