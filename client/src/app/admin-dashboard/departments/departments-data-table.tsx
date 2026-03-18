"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  FileEdit,
  Trash2,
  Building2,
  Eye,
  Loader2,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Department } from "@/app/actions/setup/main"

interface Props {
  data: Department[]
  loading: boolean
  onEdit: (dept: Department) => void
  onDelete: (id: string) => void
}

type SortKey = "name" | "status" | "createdAt"

export function DepartmentsDataTable({
  data,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [visibleCols, setVisibleCols] = useState({
    name: true,
    status: true,
    createdAt: true,
    users: true,
  })

  const PAGE_SIZE = 5

  const filteredData = useMemo(() => {
    return data
      .filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [data, search, sortKey, sortOrder])

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE)

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredData.slice(start, start + PAGE_SIZE)
  }, [filteredData, page])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  return (
    <>
      {/* Search & Column Toggle */}
      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(visibleCols).map(([key, val]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={val}
                onCheckedChange={(v) =>
                  setVisibleCols((p) => ({ ...p, [key]: !!v }))
                }
              >
                {key}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleCols.name && (
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("name")}>
                    Name <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleCols.status && <TableHead>Status</TableHead>}
              {visibleCols.createdAt && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Created <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleCols.users && <TableHead>Users</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  Loading departments...
                </TableCell>
              </TableRow>
            ) : paginatedData.length ? (
              paginatedData.map((dept) => (
                <TableRow key={dept.id}>
                  {visibleCols.name && (
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {dept.name}
                    </TableCell>
                  )}
                  {visibleCols.status && (
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          dept.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {dept.status}
                      </span>
                    </TableCell>
                  )}
                  {visibleCols.createdAt && (
                    <TableCell>
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </TableCell>
                  )}
                  {visibleCols.users && (
                    <TableCell>{dept._count?.users ?? 0}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin-dashboard/departments/${dept.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(dept)}>
                          <FileEdit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(dept.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </>
  )
}
