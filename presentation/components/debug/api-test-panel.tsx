"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { debtManagementService } from "@/application/services/debt-management-service"
import { Badge } from "@/components/ui/badge"

export function ApiTestPanel() {
  const [debtAccountCode, setDebtAccountCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")

  const testPayOffEndpoint = async () => {
    if (!debtAccountCode.trim()) {
      setError("Please enter a debt account code")
      return
    }

    setLoading(true)
    setError("")
    setResult("")

    try {
      const response = await debtManagementService.payOffDebts(debtAccountCode)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const testStatusEndpoint = async () => {
    if (!debtAccountCode.trim()) {
      setError("Please enter a debt account code")
      return
    }

    setLoading(true)
    setError("")
    setResult("")

    try {
      const response = await debtManagementService.getAccountStatus(debtAccountCode)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API Endpoint Tester</CardTitle>
        <CardDescription>Test debt management endpoints</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="debtAccountCode">Debt Account Code</Label>
          <Input
            id="debtAccountCode"
            value={debtAccountCode}
            onChange={(e) => setDebtAccountCode(e.target.value)}
            placeholder="Enter debt account code"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={testPayOffEndpoint} disabled={loading} size="sm">
            {loading ? "Testing..." : "Test Pay Off"}
          </Button>
          <Button onClick={testStatusEndpoint} disabled={loading} size="sm" variant="outline">
            {loading ? "Testing..." : "Test Status"}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <Label>Result:</Label>
            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
              <Badge variant="default" className="mb-2">
                Success
              </Badge>
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <Label>Error:</Label>
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
              <Badge variant="destructive" className="mb-2">
                Error
              </Badge>
              <pre className="whitespace-pre-wrap text-red-700">{error}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
