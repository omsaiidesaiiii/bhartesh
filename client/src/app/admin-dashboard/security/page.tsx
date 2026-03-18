"use client"

import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Search,
  Download} from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// --- Mock Data ---

const loginHistory = [
    { id: 1, user: "admin@uni.edu", ip: "192.168.1.10", device: "Chrome / Windows", location: "New York, USA", time: "2024-12-19 10:30 AM", status: "Success" },
    { id: 2, user: "sarah.w@uni.edu", ip: "172.16.5.22", device: "Safari / macOS", location: "Campus Network", time: "2024-12-19 09:15 AM", status: "Success" },
    { id: 3, user: "student.04@uni.edu", ip: "45.2.1.99", device: "Firefox / Linux", location: "London, UK", time: "2024-12-19 08:45 AM", status: "Failed" },
    { id: 4, user: "admin@uni.edu", ip: "192.168.1.10", device: "Chrome / Windows", location: "New York, USA", time: "2024-12-18 04:20 PM", status: "Success" },
    { id: 5, user: "unknown@attacker.com", ip: "102.33.1.5", device: "Unknown", location: "Unknown proxy", time: "2024-12-18 02:00 AM", status: "Failed - Blocked" },
];

const passwordResets = [
    { id: 1, user: "Dr. James Carter", reason: "Forgot Password", method: "Email Link", time: "2024-12-18 11:00 AM", status: "Completed" },
    { id: 2, user: "Student Alex", reason: "Expired", method: "Admin Reset", time: "2024-12-17 03:30 PM", status: "Completed" },
    { id: 3, user: "Lab Assistant Mike", reason: "Suspicious Activity", method: "Force Reset", time: "2024-12-16 09:00 AM", status: "Pending" },
];

const failedAttempts = [
    { id: 1, user: "student.04@uni.edu", ip: "45.2.1.99", reason: "Invalid Password", count: 3, time: "2024-12-19 08:45 AM" },
    { id: 2, user: "unknown@attacker.com", ip: "102.33.1.5", reason: "User Not Found", count: 15, time: "2024-12-18 02:00 AM" },
    { id: 3, user: "sarah.w@uni.edu", ip: "172.16.5.22", reason: "MFA Timeout", count: 1, time: "2024-12-15 10:00 AM" },
];

const securityLogs = [
    { id: 1, action: "Role Changed", target: "Dr. Sarah Wilson", executor: "Admin", details: "Promoted to HOD", time: "2024-12-19 12:00 PM", severity: "Medium" },
    { id: 2, action: "Settings Update", target: "System", executor: "Admin", details: "Enabled 2FA globally", time: "2024-12-18 09:00 AM", severity: "High" },
    { id: 3, action: "User Suspended", target: "Student #442", executor: "System", details: "Multiple policy violations", time: "2024-12-17 04:45 PM", severity: "High" },
];

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Security & Audit</h1>
           <p className="text-muted-foreground">Monitor access, analyze threats, and review system integrity.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export Logs
            </Button>
            <Button variant="destructive">
                <ShieldAlert className="mr-2 h-4 w-4" /> Security Checkup
            </Button>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Password Resets</CardTitle>
            <KeyRound className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <ShieldAlert className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Low</div>
            <p className="text-xs text-muted-foreground">System secure</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="login-history" className="space-y-4">
        <TabsList>
            <TabsTrigger value="login-history">Login History</TabsTrigger>
            <TabsTrigger value="failed-attempts">Failed Attempts</TabsTrigger>
            <TabsTrigger value="password-resets">Password Resets</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="login-history" className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by user or IP..." className="pl-8 max-w-sm" />
                </div>
                 <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User / Email</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loginHistory.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.user}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                                    <TableCell>{log.device}</TableCell>
                                    <TableCell>{log.location}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status.includes("Success") ? "outline" : "destructive"}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{log.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="failed-attempts" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Suspicious Activity</CardTitle>
                    <CardDescription>Accounts with multiple failed login attempts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Target User</TableHead>
                                <TableHead>Source IP</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Attempt Count</TableHead>
                                <TableHead>Last Attempt</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {failedAttempts.map(attempt => (
                                <TableRow key={attempt.id}>
                                    <TableCell className="font-medium">{attempt.user}</TableCell>
                                    <TableCell className="font-mono text-xs">{attempt.ip}</TableCell>
                                    <TableCell>{attempt.reason}</TableCell>
                                    <TableCell>
                                        <Badge variant={attempt.count > 5 ? "destructive" : "secondary"}>
                                            {attempt.count} attempts
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{attempt.time}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline">Block IP</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="password-resets" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Reset Requests</CardTitle>
                    <CardDescription>Log of all password reset initiations.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {passwordResets.map(reset => (
                                <TableRow key={reset.id}>
                                    <TableCell className="font-medium">{reset.user}</TableCell>
                                    <TableCell>{reset.reason}</TableCell>
                                    <TableCell>{reset.method}</TableCell>
                                    <TableCell>
                                         <Badge variant={reset.status === "Completed" ? "default" : "outline"}>
                                            {reset.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{reset.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>System Modification Logs</CardTitle>
                    <CardDescription>Critical changes made to system configuration or users.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Executor</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {securityLogs.map(audit => (
                                <TableRow key={audit.id}>
                                    <TableCell className="font-medium">{audit.action}</TableCell>
                                    <TableCell>{audit.target}</TableCell>
                                    <TableCell>{audit.executor}</TableCell>
                                    <TableCell>{audit.details}</TableCell>
                                    <TableCell>
                                         <Badge variant={audit.severity === "High" ? "destructive" : "outline"}>
                                            {audit.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{audit.time}</TableCell>
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
