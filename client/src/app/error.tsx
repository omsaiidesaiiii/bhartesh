"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
             <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="text-muted-foreground max-w-[500px]">
            We encountered an unexpected error. Please try again or contact support if the issue persists.
          </p>
          <div className="flex gap-2">
              <Button onClick={() => reset()}>Try Again</Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>Go Home</Button>
          </div>
      </div>
    </div>
  )
}
