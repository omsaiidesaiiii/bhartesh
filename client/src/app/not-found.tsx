import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
             <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin-dashboard">Return to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
