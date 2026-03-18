"use client"

import * as React from "react"
import {
  Building2,
  Settings,
  Shield,
  Save,
  Upload,
  Moon,
  Sun,
  Monitor
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// --- Mock Data for Preferences ---
const initialInstitute = {
    name: "Tech University",
    email: "admin@techuni.edu",
    phone: "+1 (555) 000-0000",
    address: "123 Innovation Drive, Tech Valley, CA 94043",
    logo: "/placeholder-logo.png"
}

const initialPermissions = [
    { feature: "Manage Students", admin: true, staff: true, student: false },
    { feature: "Manage Staff", admin: true, staff: false, student: false },
    { feature: "Create Assignments", admin: true, staff: true, student: false },
    { feature: "View Grades", admin: true, staff: true, student: true },
    { feature: "Publish Results", admin: true, staff: false, student: false },
    { feature: "System Settings", admin: true, staff: false, student: false },
]

export default function SettingsPage() {
    const [institute, setInstitute] = React.useState(initialInstitute);
    const [permissions, setPermissions] = React.useState(initialPermissions);
    
    // System switches
    const [allowRegistration, setAllowRegistration] = React.useState(true);
    const [maintenanceMode, setMaintenanceMode] = React.useState(false);

    const handlePermissionChange = (index: number, role: 'admin' | 'staff' | 'student') => {
        const newPerms = [...permissions];
        newPerms[index][role] = !newPerms[index][role];
        setPermissions(newPerms);
    }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Settings & Configuration</h1>
           <p className="text-muted-foreground">Manage institute profile, system preferences, and access controls.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button>
                <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
        </div>
      </div>

      <Tabs defaultValue="institute" className="space-y-4">
        <TabsList>
            <TabsTrigger value="institute"><Building2 className="w-4 h-4 mr-2"/> Institute Profile</TabsTrigger>
            <TabsTrigger value="system"><Settings className="w-4 h-4 mr-2"/> System Settings</TabsTrigger>
            <TabsTrigger value="access"><Shield className="w-4 h-4 mr-2"/> Access Control</TabsTrigger>
        </TabsList>

        {/* Institute Profile Tab */}
        <TabsContent value="institute" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update your institute&apos;s details and branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border">
                            <AvatarImage src={institute.logo} />
                            <AvatarFallback>Logo</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" /> Upload Logo
                            </Button>
                            <p className="text-xs text-muted-foreground">Recommended size: 512x512px. Max 2MB.</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Institute Name</Label>
                            <Input id="name" value={institute.name} onChange={(e) => setInstitute({...institute, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Official Email</Label>
                            <Input id="email" value={institute.email} onChange={(e) => setInstitute({...institute, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Contact Phone</Label>
                            <Input id="phone" value={institute.phone} onChange={(e) => setInstitute({...institute, phone: e.target.value})} />
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={institute.address} onChange={(e) => setInstitute({...institute, address: e.target.value})} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>System Preferences</CardTitle>
                    <CardDescription>Configure global system behaviors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                             <Label className="text-base">Allow Student Registration</Label>
                             <p className="text-sm text-muted-foreground">If disabled, only admins can create student accounts.</p>
                         </div>
                         <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} />
                     </div>
                     <Separator />
                     <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                             <Label className="text-base text-destructive">Maintenance Mode</Label>
                             <p className="text-sm text-muted-foreground">Disable access for all non-admin users.</p>
                         </div>
                         <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                     <div className="flex flex-col gap-2 p-2 border rounded-md cursor-pointer hover:border-primary">
                         <div className="h-20 bg-slate-100 rounded-md flex items-center justify-center">
                             <Sun className="h-6 w-6 text-slate-900" />
                         </div>
                         <div className="text-center font-medium">Light</div>
                     </div>
                     <div className="flex flex-col gap-2 p-2 border rounded-md cursor-pointer hover:border-primary">
                         <div className="h-20 bg-slate-950 rounded-md flex items-center justify-center">
                             <Moon className="h-6 w-6 text-slate-50" />
                         </div>
                         <div className="text-center font-medium">Dark</div>
                     </div>
                     <div className="flex flex-col gap-2 p-2 border border-primary bg-primary/5 rounded-md cursor-pointer">
                         <div className="h-20 bg-slate-200 rounded-md flex items-center justify-center">
                             <Monitor className="h-6 w-6 text-slate-700" />
                         </div>
                         <div className="text-center font-medium">System</div>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Role Permissions Matrix</CardTitle>
                    <CardDescription>Define what each role can access and modify.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Feature / Module</TableHead>
                                <TableHead className="text-center">Admin</TableHead>
                                <TableHead className="text-center">Staff</TableHead>
                                <TableHead className="text-center">Student</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((perm, index) => (
                                <TableRow key={perm.feature}>
                                    <TableCell className="font-medium">{perm.feature}</TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox checked={perm.admin} disabled onCheckedChange={() => handlePermissionChange(index, 'admin')} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox checked={perm.staff} onCheckedChange={() => handlePermissionChange(index, 'staff')} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox checked={perm.student} onCheckedChange={() => handlePermissionChange(index, 'student')} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-4">
                     <p className="text-sm text-muted-foreground w-full">
                         * Admin permissions are generally locked for safety.
                     </p>
                </CardFooter>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
