"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUp, BookOpen, Calendar, ShieldCheck, X, Loader2, CheckCircle2 } from "lucide-react"
import { savePYQ, formatFileSize, getFileExtension } from "@/lib/storage"

interface UploadPYQProps {
  onSuccess?: () => void
}

export function UploadPYQ({ onSuccess }: UploadPYQProps) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [year, setYear] = useState("")
  const [semester, setSemester] = useState("")
  const [examType, setExamType] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (15MB limit)
      if (file.size > 15 * 1024 * 1024) {
        setError("File size exceeds 15MB limit")
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError("File size exceeds 15MB limit")
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setTitle("")
    setSubject("")
    setYear("")
    setSemester("")
    setExamType("")
    setSelectedFile(null)
    setError(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError("Please enter a paper title")
      return
    }
    if (!subject) {
      setError("Please select a subject")
      return
    }
    if (!year) {
      setError("Please select an exam year")
      return
    }
    if (!semester) {
      setError("Please select a semester")
      return
    }
    if (!examType) {
      setError("Please select an exam type")
      return
    }
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Upload file to server
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("folderName", "pyq")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      // Save to localStorage
      const subjectLabels: Record<string, string> = {
        math: "Mathematics",
        physics: "Physics",
        cs: "Computer Science",
      }

      const typeLabels: Record<string, string> = {
        main: "Main Exam",
        sessional: "Sessional",
        backlog: "Backlog / Supplementary",
      }

      savePYQ({
        id: crypto.randomUUID(),
        title: title,
        subject: subjectLabels[subject] || subject,
        year: year,
        semester: `Sem ${semester}`,
        type: typeLabels[examType] || examType,
        fileUrl: result.url,
        fileName: result.fileName,
        date: new Date().toISOString().split("T")[0],
        size: formatFileSize(selectedFile.size),
      })

      setUploadSuccess(true)
      setTimeout(() => {
        resetForm()
        onSuccess?.()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md">
          <CardHeader>
            <CardTitle>PYQ Details</CardTitle>
            <CardDescription>Enter details about the question paper.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Name / Title</label>
              <Input
                placeholder="e.g., End Semester - Mathematics 1"
                className="bg-background/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="cs">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Year</label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Type</label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Exam</SelectItem>
                    <SelectItem value="sessional">Sessional</SelectItem>
                    <SelectItem value="backlog">Backlog / Supplementary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md">
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="pyq-file-input"
            />
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-muted rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/10 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Upload question paper</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF format highly recommended (Max 15MB)
                  </p>
                </div>
                <Button variant="secondary" size="sm" type="button">
                  Select File
                </Button>
              </div>
            ) : (
              <div className="border rounded-xl p-4 flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <FileUp className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • {getFileExtension(selectedFile.name)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-slate-900 border-none shadow-xl text-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold opacity-80 uppercase tracking-wider">
              Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <ShieldCheck className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                <p className="text-xs opacity-70">
                  Ensure all pages are scanned clearly and in order.
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <BookOpen className="h-4 w-4 text-blue-400 mt-1 shrink-0" />
                <p className="text-xs opacity-70">
                  Avoid uploading password-protected PDF files.
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <Calendar className="h-4 w-4 text-orange-400 mt-1 shrink-0" />
                <p className="text-xs opacity-70">
                  Label the paper with correct year and exam type for better indexing.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <p className="text-xs text-green-300">Upload successful!</p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit for Review"
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full mt-2 text-white/60"
                onClick={resetForm}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
