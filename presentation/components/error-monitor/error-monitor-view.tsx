"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AlertTriangle, X, Trash2, Play, Pause } from "lucide-react"

interface ErrorLog {
  id: string
  message: string
  stack?: string
  timestamp: Date
  type: "error" | "warning" | "info"
  source?: string
}

export function ErrorMonitorView() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isCapturing, setIsCapturing] = useState(true)

  useEffect(() => {
    if (!isCapturing) return

    // Capture console errors
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")

      addError({
        message,
        type: "error",
        stack: new Error().stack,
        source: "console.error",
      })
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")

      addError({
        message,
        type: "warning",
        source: "console.warn",
      })
      originalWarn.apply(console, args)
    }

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        type: "error",
        source: "unhandledrejection",
      })
    }

    // Capture global errors
    const handleError = (event: ErrorEvent) => {
      addError({
        message: event.message,
        type: "error",
        stack: event.error?.stack,
        source: `${event.filename}:${event.lineno}:${event.colno}`,
      })
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [isCapturing])

  const addError = (errorData: Omit<ErrorLog, "id" | "timestamp">) => {
    const newError: ErrorLog = {
      ...errorData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }

    setErrors((prev) => [newError, ...prev].slice(0, 100)) // Keep only last 100 errors
  }

  const clearErrors = () => {
    setErrors([])
  }

  const removeError = (id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id))
  }

  const getErrorIcon = (type: ErrorLog["type"]) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
    }
  }

  const getErrorBadgeVariant = (type: ErrorLog["type"]) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Error Monitor</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Error Monitor</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsCapturing(!isCapturing)}>
              {isCapturing ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isCapturing ? "Stop Capturing" : "Start Capturing"}
            </Button>
            <Button variant="outline" size="sm" onClick={clearErrors}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Error Log ({errors.length})
                </CardTitle>
                <CardDescription>
                  JavaScript errors and warnings from the application
                  {isCapturing ? " (Capturing)" : " (Paused)"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {errors.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">No errors captured yet</div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {errors.map((error) => (
                    <div key={error.id} className="flex items-start space-x-3 p-3 rounded border bg-card">
                      <div className="flex-shrink-0 mt-0.5">{getErrorIcon(error.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getErrorBadgeVariant(error.type)} className="text-xs">
                            {error.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{error.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm break-words mb-2">{error.message}</p>
                        {error.source && <p className="text-xs text-muted-foreground mb-2">Source: {error.source}</p>}
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">Stack trace</summary>
                            <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-all bg-muted p-2 rounded">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeError(error.id)} className="flex-shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
