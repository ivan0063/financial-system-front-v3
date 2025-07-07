"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

interface ErrorLog {
  id: string
  message: string
  stack?: string
  timestamp: Date
  type: "error" | "warning" | "info"
  source?: string
}

export function ErrorNotificationSystem() {
  const [errorCount, setErrorCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Capture console errors
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      setErrorCount((prev) => prev + 1)
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      setErrorCount((prev) => prev + 1)
      originalWarn.apply(console, args)
    }

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrorCount((prev) => prev + 1)
    }

    // Capture global errors
    const handleError = (event: ErrorEvent) => {
      setErrorCount((prev) => prev + 1)
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [])

  // Only show the notification badge if there are errors
  if (errorCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link href="/error-monitor">
        <Button variant="outline" className="bg-red-50 border-red-200 hover:bg-red-100">
          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-red-700">View Errors</span>
          <Badge variant="destructive" className="ml-2">
            {errorCount}
          </Badge>
        </Button>
      </Link>
    </div>
  )
}
