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
import { Edit, Eye, MoreHorizontal, Users, Calendar, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Assignment, deleteAssignment } from "@/lib/assignments-api"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

interface AssignmentListProps {
  assignments: Assignment[]
  onRefresh: () => void
}

export function AssignmentList({ assignments, onRefresh }: AssignmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    setDeletingId(id)
    const result = await deleteAssignment(id)
    if (result.success) {
      toast.success("Assignment removed successfully")
      onRefresh()
    } else {
      toast.error(result.error || "Failed to delete assignment")
    }
    setDeletingId(null)
  }

  return (
    <div className="rounded-md border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="pl-6">Title</TableHead>
            <TableHead>Semester / Dept</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No assignments found.
              </TableCell>
            </TableRow>
          ) : assignments.map((asn) => (
            <TableRow key={asn.id} className="hover:bg-muted/10 transition-colors">
              <TableCell className="pl-6">
                <div className="font-semibold">{asn.title}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{asn.subject?.name || "No Subject"}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">Sem {asn.semester}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {asn.dueDate ? format(new Date(asn.dueDate), 'MMM dd, yyyy') : 'No Date'}
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-700 border-none">
                  Published
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(asn.id)} disabled={deletingId === asn.id}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuItem>View Submission Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(asn.id)}>Delete Assignment</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
