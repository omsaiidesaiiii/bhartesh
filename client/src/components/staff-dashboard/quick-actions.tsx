import {
  UserCheck,
  FilePlus,
  BookOpen,
  FileText,
  User,
  Settings,
  Lock,
  LogOut,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

const staffActions = [
  {
    label: "Mark Attendance",
    icon: UserCheck,
    variant: "default" as const,
    href: "/staff/attendance?tab=mark",
    bg: "bg-blue-600 hover:bg-blue-700",
    description: "Take daily roll call"
  },
  {
    label: "Create Assignment",
    icon: FilePlus,
    variant: "outline" as const,
    href: "/staff/assignments?tab=create",
    description: "Post new tasks"
  },
  {
    label: "Upload Notes",
    icon: BookOpen,
    variant: "outline" as const,
    href: "/staff/notes?tab=upload",
    description: "Share study materials"
  },
  {
    label: "Upload PYQ Papers",
    icon: FileText,
    variant: "outline" as const,
    href: "/staff/pyq?tab=upload",
    description: "Add past papers"
  },
]

const profileActions = [
  {
    label: "View Profile",
    icon: User,
    href: "/staff/profile",
    color: "text-blue-600"
  },
  {
    label: "Edit Details",
    icon: Settings,
    href: "/staff/profile?mode=edit",
    color: "text-slate-600"
  },
  {
    label: "Change Password",
    icon: Lock,
    href: "/staff/profile?mode=security",
    color: "text-orange-600"
  }
]

export function StaffQuickActions() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          <CardDescription>Common academic tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {staffActions.map((action) => (
            <Link key={action.label} href={action.href} className="group">
              <Button 
                variant={action.variant} 
                className={`w-full h-auto py-4 flex flex-col items-center justify-center gap-2 transition-all group-hover:scale-[1.02] ${action.variant === 'default' ? action.bg : ''}`}
              >
                <div className={`p-2 rounded-full ${action.variant === 'default' ? 'bg-white/20' : 'bg-muted'}`}>
                    <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold">{action.label}</p>
                    <p className="text-[10px] opacity-70 font-normal">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
