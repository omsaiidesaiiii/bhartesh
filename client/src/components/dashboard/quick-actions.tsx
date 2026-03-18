import {
  UserPlus,
  FileText,
  Building,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

const actions = [
  {
    label: "Add Student",
    icon: UserPlus,
    variant: "default" as const,
    href: "/admin-dashboard/users",
  },
  {
    label: "Add Staff",
    icon: UserPlus, 
    variant: "outline" as const,
    href: "/admin-dashboard/users",
  },
  {
    label: "Create Notice",
    icon: FileText,
    variant: "outline" as const,
    href: undefined,
  },
  {
    label: "Add Department",
    icon: Building,
    variant: "secondary" as const,
    href: "/admin-dashboard/departments",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {actions.map((action) => {
          const ButtonComponent = (
            <Button key={action.label} variant={action.variant} className="flex-1 min-w-[150px]">
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          )

          return action.href ? (
            <Link key={action.label} href={action.href} className="flex-1 min-w-[150px] flex">
               <Button variant={action.variant} className="w-full">
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ) : (
            ButtonComponent
          )
        })}
          <Button variant="ghost" className="flex-1 min-w-[150px]">
            <PlusCircle className="mr-2 h-4 w-4" />
            More Actions
          </Button>
      </CardContent>
    </Card>
  )
}
