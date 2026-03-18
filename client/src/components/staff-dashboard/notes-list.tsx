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
import { FileText, Download, Edit, Trash2, FileType, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getNotes, deleteNote, type NoteItem } from "@/lib/storage"
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

interface NotesListProps {
  refreshKey?: number
}

export function NotesList({ refreshKey }: NotesListProps) {
  const [notesData, setNotesData] = useState<NoteItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadNotes()
  }, [refreshKey])

  const loadNotes = () => {
    const storedNotes = getNotes()
    setNotesData(storedNotes)
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
    loadNotes()
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

  const handleView = (fileUrl: string) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank")
    }
  }

  // Filter data based on search
  const filteredData = notesData.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 dark:bg-blue-900/20"
          >
            {filteredData.length} Notes
          </Badge>
          <Badge variant="outline">All Formats</Badge>
        </div>
      </div>

      <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-6">File Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No notes found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((note) => (
                <TableRow key={note.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          note.format === "PDF"
                            ? "bg-red-50 text-red-600"
                            : note.format === "PPT" || note.format === "PPTX"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-blue-50 text-blue-600"
                        } dark:bg-white/5`}
                      >
                        <FileType className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{note.title}</p>
                        <p className="text-[10px] text-muted-foreground">{note.size}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {note.subject}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{note.semester}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted/30">
                      {note.format}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{note.date}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => handleDownload(note.fileUrl, note.fileName)}
                        disabled={!note.fileUrl}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600"
                        onClick={() => handleView(note.fileUrl)}
                        disabled={!note.fileUrl}
                      >
                        <Edit className="h-4 w-4" />
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
                            <AlertDialogTitle>Delete Note</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{note.title}"? This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(note.id)}
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
