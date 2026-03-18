import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, School } from "lucide-react"

interface SubjectMappingProps {
  subjects: any[]
}

export function SubjectMapping({ subjects }: SubjectMappingProps) {
  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground col-span-full">
        <p>No subjects assigned yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subjects.map((mapping, idx) => (
        <Card key={idx} className="bg-card hover:bg-muted/5 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-lg font-bold mt-2">{mapping.subject?.name}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <School className="h-3 w-3" /> {mapping.subject?.department?.name}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold">Code:</span> {mapping.subject?.code}
              </div>
              <div className="pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
                <span>Credits: {mapping.subject?.credits || "N/A"}</span>
                <span className="text-green-600 font-medium italic">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
