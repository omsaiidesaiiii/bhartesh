import { ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
       <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <ShieldAlert className="h-10 w-10 text-orange-600 dark:text-orange-400" />
       </div>
      <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
      <p className="text-muted-foreground text-center max-w-[500px]">
        You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <Button asChild>
        <Link href="/admin-dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
