import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, Users, Award, AlertCircle, PieChart, Download, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react"
import { ResultOverview } from "@/app/actions/exams/types"
import { toast } from "sonner"
import Papa from "papaparse"

interface ClassResultsSummaryProps {
  results?: ResultOverview[]
}

export function ClassResultsSummary({ results = [] }: ClassResultsSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  if (results.length === 0) {
    return (
      <Card className="bg-card/40 backdrop-blur-sm border-dashed border-2 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <PieChart className="h-10 w-10 mb-2 opacity-20" />
        <p>No results overview available yet.</p>
        <p className="text-xs">Individual classroom results will appear here once published.</p>
      </Card>
    )
  }

  const totalPages = Math.ceil(results.length / itemsPerPage)
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleExportAll = () => {
    try {
      const exportData = results.map(res => ({
        Subject: res.subject,
        Code: res.code,
        'Total Students': res.totalStudents,
        Passed: res.passed,
        Failed: res.failed,
        'Pass %': res.totalStudents > 0 ? ((res.passed / res.totalStudents) * 100).toFixed(2) + '%' : '0%',
        'Average Grade': res.avgGrade,
        Status: res.published ? 'Published' : 'Draft'
      }))

      const csv = Papa.unparse(exportData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `class_results_summary_${new Date().toLocaleDateString()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Results exported successfully")
    } catch (error) {
      toast.error("Failed to export results")
    }
  }

  const handleExportSingle = (res: ResultOverview) => {
    try {
      const exportData = [{
        Subject: res.subject,
        Code: res.code,
        'Total Students': res.totalStudents,
        Passed: res.passed,
        Failed: res.failed,
        'Pass %': res.totalStudents > 0 ? ((res.passed / res.totalStudents) * 100).toFixed(2) + '%' : '0%',
        'Average Grade': res.avgGrade,
        Status: res.published ? 'Published' : 'Draft'
      }]

      const csv = Papa.unparse(exportData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${res.subject.replace(/\s+/g, '_')}_detailed_report.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Report for ${res.subject} exported`)
    } catch (error) {
      toast.error("Failed to generate report")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card/30 p-4 rounded-xl backdrop-blur-sm border border-border/50">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            Performance Summary
          </h3>
          <p className="text-sm text-muted-foreground">Showing results for {results.length} subjects</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-background/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          onClick={handleExportAll}
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Export All to Excel
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px] w-full rounded-md pr-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-4">
          {currentResults.map((res, i) => {
            const passPercentage = res.totalStudents > 0 ? Math.round((res.passed / res.totalStudents) * 100) : 0
            return (
              <Card key={i} className="bg-card/40 backdrop-blur-sm border-none shadow-lg hover:shadow-xl hover:bg-card/60 transition-all cursor-default overflow-hidden group">
                <div className={`h-1.5 w-full ${res.published ? 'bg-green-500' : 'bg-orange-500'}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors">{res.subject}</CardTitle>
                      <CardDescription className="font-mono text-[10px] uppercase tracking-wider">{res.code}</CardDescription>
                    </div>
                    <Badge className={
                      res.published
                        ? 'bg-green-100 text-green-700 border-none hover:bg-green-200'
                        : 'bg-orange-100 text-orange-700 border-none hover:bg-orange-200'
                    }>
                      {res.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 bg-muted/20 p-2 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Avg Grade</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-xl font-bold">{res.avgGrade}</span>
                      </div>
                    </div>
                    <div className="space-y-1 bg-muted/20 p-2 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Students</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-xl font-bold">{res.totalStudents}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Award className="h-3 w-3" /> Pass Percentage
                      </span>
                      <span className={`font-bold ${passPercentage > 40 ? 'text-green-600' : 'text-red-600'}`}>
                        {passPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${passPercentage > 40 ? 'bg-blue-600' : 'bg-red-500'}`}
                        style={{ width: `${passPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tight gap-1 p-0 hover:bg-transparent"
                      onClick={() => handleExportSingle(res)}
                    >
                      <Download className="h-3 w-3" />
                      Generate Detailed Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {currentResults.length < 3 && (
             <Card className="border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center p-6 text-center text-muted-foreground opacity-60 h-[260px]">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Results are automatically generated</p>
                <p className="text-xs">More classes will appear here</p>
             </Card>
          )}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, results.length)}
            </span>{" "}
            of <span className="font-medium">{results.length}</span> classes
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

