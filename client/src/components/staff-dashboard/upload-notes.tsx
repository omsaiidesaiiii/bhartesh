"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUp, BookOpen, Layers, Info, X, Loader2, CheckCircle2 } from "lucide-react"
import { saveNote, formatFileSize, getFileExtension } from "@/lib/storage"

interface UploadNotesProps {
  onSuccess?: () => void
}

export function UploadNotes({ onSuccess }: UploadNotesProps) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [semester, setSemester] = useState("")
  const [visibility, setVisibility] = useState<"current" | "all">("current")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (20MB limit for notes)
      if (file.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit")
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
      if (file.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit")
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
    setSemester("")
    setVisibility("current")
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
      setError("Please enter a title for the notes")
      return
    }
    if (!subject) {
      setError("Please select a subject")
      return
    }
    if (!semester) {
      setError("Please select a semester")
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
      formData.append("folderName", "notes")

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

      saveNote({
        id: crypto.randomUUID(),
        title: title,
        subject: subjectLabels[subject] || subject,
        semester: `Sem ${semester}`,
        format: getFileExtension(selectedFile.name),
        size: formatFileSize(selectedFile.size),
        date: new Date().toISOString().split("T")[0],
        fileUrl: result.url,
        fileName: result.fileName,
        visibility: visibility,
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
            <CardTitle>Note Details</CardTitle>
            <CardDescription>
              Provide details about the study material you are uploading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title of Notes</label>
              <Input
                placeholder="e.g., Quantum Mechanics Lecture 1"
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
            </div>
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 flex gap-3 mt-4">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <p className="font-semibold">Format Note:</p>
                <p>Supported formats: PDF, PPT, DOCX. Max size 20MB per file.</p>
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
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="notes-file-input"
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
                  <p className="font-medium">Upload study materials</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag and drop your PDF, PPT or DOC sets here
                  </p>
                </div>
                <Button variant="secondary" size="sm" type="button">
                  Select Files
                </Button>
              </div>
            ) : (
              <div className="border rounded-xl p-4 flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      getFileExtension(selectedFile.name) === "PDF"
                        ? "bg-red-50 dark:bg-red-900/20"
                        : getFileExtension(selectedFile.name) === "PPT" ||
                          getFileExtension(selectedFile.name) === "PPTX"
                        ? "bg-orange-50 dark:bg-orange-900/20"
                        : "bg-blue-50 dark:bg-blue-900/20"
                    }`}
                  >
                    <FileUp
                      className={`h-5 w-5 ${
                        getFileExtension(selectedFile.name) === "PDF"
                          ? "text-red-600"
                          : getFileExtension(selectedFile.name) === "PPT" ||
                            getFileExtension(selectedFile.name) === "PPTX"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    />
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
        <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md">
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Accessible to:</label>
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    visibility === "current"
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                      : "bg-muted/20 border-transparent hover:border-muted"
                  }`}
                  onClick={() => setVisibility("current")}
                >
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Current Class Students</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    visibility === "all"
                      ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                      : "bg-muted/20 border-transparent hover:border-muted"
                  }`}
                  onClick={() => setVisibility("all")}
                >
                  <Layers className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">All Semester Students</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600 dark:text-green-400">Upload successful!</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Publish Notes"
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full mt-2"
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
