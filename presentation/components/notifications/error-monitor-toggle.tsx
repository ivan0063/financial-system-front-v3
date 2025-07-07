"use client"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ErrorMonitorToggleProps {
  errorCount: number
  onToggle: () => void
}

export function ErrorMonitorToggle({ errorCount, onToggle }: ErrorMonitorToggleProps) {
  if (errorCount === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Button variant="outline" size="sm" onClick={onToggle} className="bg-red-50 border-red-200 hover:bg-red-100">
        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
        <span className="text-red-700">Errors</span>
        <Badge variant="destructive" className="ml-2">
          {errorCount}
        </Badge>
      </Button>
    </div>
  )
}
