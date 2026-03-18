"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Building2, Loader2 } from "lucide-react"
import { useState, useEffect, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchDepartmentById, type Department } from "@/app/actions/setup/main"
import { toast } from "sonner"

export default function DepartmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [dept, setDept] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let isMounted = true
    
    async function loadDepartment() {
      if (!params.id || typeof params.id !== 'string') {
        setLoading(false)
        return
      }
      
      const result = await fetchDepartmentById(params.id)
      
      if (!isMounted) return
      
      startTransition(() => {
        if (result.success && result.data) {
          setDept(result.data)
        } else {
          toast.error(result.error || "Failed to load department")
        }
        setLoading(false)
      })
    }
    
    loadDepartment()
    
    return () => {
      isMounted = false
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!dept) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Department not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
           <h1 className="text-2xl font-bold tracking-tight">{dept.name}</h1>
           <p className="text-muted-foreground">
             Status: <span className={dept.status === "ACTIVE" ? "text-green-600" : "text-gray-500"}>{dept.status}</span>
           </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dept.users?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Assigned to this department</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Created At
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(dept.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Updated
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(dept.updatedAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>About Department</CardTitle>
                    <CardDescription>General information and details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        The Department of {dept.name} is dedicated to excellence in education and research.
                    </p>
                     <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                            <span className="font-semibold">Department ID:</span> {dept.id}
                        </div>
                        <div>
                            <span className="font-semibold">Status:</span> {dept.status}
                        </div>
                         <div>
                            <span className="font-semibold">Created:</span> {new Date(dept.createdAt).toLocaleString()}
                        </div>
                         <div>
                            <span className="font-semibold">Updated:</span> {new Date(dept.updatedAt).toLocaleString()}
                        </div>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>
         <TabsContent value="users">
             <Card>
                <CardHeader>
                    <CardTitle>Users in Department</CardTitle>
                    <CardDescription>{dept.users?.length || 0} users assigned</CardDescription>
                </CardHeader>
                <CardContent>
                    {dept.users && dept.users.length > 0 ? (
                      <div className="space-y-2">
                        {dept.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <span className="text-xs bg-muted px-2 py-1 rounded">{user.role}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No users assigned to this department.</p>
                    )}
                </CardContent>
             </Card>
         </TabsContent>
      </Tabs>

    </div>
  )
}
