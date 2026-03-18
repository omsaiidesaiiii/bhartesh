"use client"

import * as React from "react"
import {
  Bell,
  AlertTriangle,
  Info,
  Shield,
  LogIn,
  MoreVertical,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// --- Mock Data ---
const notifications = [
    { id: 1, title: "System Maintenance Scheduled", message: "Server maintenance on Saturday at 2 AM.", type: "system", time: "2 hours ago", read: false },
    { id: 2, title: "New Staff Account Created", message: "Dr. Emily Blunt has been added to Physics Dept.", type: "user", time: "5 hours ago", read: true },
    { id: 3, title: "Exam Results Published", message: "BCA Sem 5 results are now live.", type: "academic", time: "1 day ago", read: true },
    { id: 4, title: "Security Alert", message: "Multiple failed login attempts detected for user 'admin'.", type: "alert", time: "2 days ago", read: false },
];

const activityLogs = [
    { id: 1, user: "Admin", action: "Updated Settings", target: "System Prefs", time: "10:30 AM", date: "Today" },
    { id: 2, user: "Dr. Sarah", action: "Uploaded Component", target: "CS102 Syllabus", time: "09:15 AM", date: "Today" },
    { id: 3, user: "Admin", action: "Deleted User", target: "Student #2023", time: "04:45 PM", date: "Yesterday" },
    { id: 4, user: "System", action: "Auto-Backup", target: "Database", time: "02:00 AM", date: "Yesterday" },
];

const loginHistory = [
    { id: 1, user: "Admin", ip: "192.168.1.1", location: "Campus Network", time: "Just now", status: "Success" },
    { id: 2, user: "Dr. Sarah", ip: "172.16.0.45", location: "Staff WiFi", time: "35 mins ago", status: "Success" },
    { id: 3, user: "Student_01", ip: "45.2.1.99", location: "External", time: "2 hours ago", status: "Failed" },
    { id: 4, user: "Admin", ip: "192.168.1.5", location: "Campus Network", time: "Yesterday", status: "Success" },
];

export default function NotificationsPage() {
    const [, setActiveTab] = React.useState("notifications");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Notifications & Logs</h1>
           <p className="text-muted-foreground">Monitor system alerts, user activity, and login attempts.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">Mark all read</Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unread Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Logins Today</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">145</div>
                  <p className="text-xs text-muted-foreground">Unique users</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-green-500">99.9%</div>
                  <p className="text-xs text-muted-foreground">Uptime this week</p>
              </CardContent>
          </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4"/> Notifications</TabsTrigger>
            <TabsTrigger value="activity" className="gap-2"><Activity className="h-4 w-4"/> Activity Logs</TabsTrigger>
            <TabsTrigger value="logins" className="gap-2"><Shield className="h-4 w-4"/> Login History</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
             <Card>
                 <CardHeader>
                     <CardTitle>System Notifications</CardTitle>
                     <CardDescription>Recent alerts and important updates.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-0">
                     <ScrollArea className="h-[400px]">
                         <div className="divide-y">
                             {notifications.map(note => (
                                 <div key={note.id} className={`p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors ${!note.read ? 'bg-muted/20' : ''}`}>
                                     <div className={`mt-1 h-2 w-2 rounded-full ${!note.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                     <div className={`p-2 rounded-full bg-accent ${note.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : ''}`}>
                                         {note.type === 'alert' ? <AlertTriangle className="h-4 w-4" /> : 
                                          note.type === 'system' ? <Info className="h-4 w-4" /> :
                                          note.type === 'user' ? <LogIn className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                                     </div>
                                     <div className="flex-1 space-y-1">
                                         <p className="font-medium leading-none">{note.title}</p>
                                         <p className="text-sm text-muted-foreground">{note.message}</p>
                                         <p className="text-xs text-muted-foreground">{note.time}</p>
                                     </div>
                                     <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                 </div>
                             ))}
                         </div>
                     </ScrollArea>
                 </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                         <CardTitle>User Activity</CardTitle>
                         <CardDescription>Audit trail of actions performed within the system.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Date & Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activityLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback>{log.user[0]}</AvatarFallback>
                                        </Avatar>
                                        {log.user}
                                    </TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.target}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {log.date} at {log.time}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="logins" className="space-y-4">
            <Card>
                <CardHeader>
                     <CardTitle>Login Sessions</CardTitle>
                     <CardDescription>Recent sign-in attempts and their status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                         <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loginHistory.map(login => (
                                <TableRow key={login.id}>
                                    <TableCell className="font-medium">{login.user}</TableCell>
                                    <TableCell className="font-mono text-xs">{login.ip}</TableCell>
                                    <TableCell>{login.location}</TableCell>
                                    <TableCell>
                                        <Badge variant={login.status === "Success" ? "secondary" : "destructive"}>
                                            {login.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{login.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
