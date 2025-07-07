"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialStatusService } from "@/application/services/financial-status-service"
import { DEFAULT_USER_EMAIL } from "@/infrastructure/api/api-client"
import { TrendingUp, User } from "lucide-react"

export function DashboardView() {
  const [financialStatus, setFinancialStatus] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const financialStatusService = new FinancialStatusService()

  useEffect(() => {
    const loadFinancialStatus = async () => {
      try {
        const status = await financialStatusService.execute(DEFAULT_USER_EMAIL)
        setFinancialStatus(status)
      } catch (error) {
        console.error("Error loading financial status:", error)
        setError("Failed to load financial status")
      } finally {
        setLoading(false)
      }
    }

    loadFinancialStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading financial status...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card className="border-red-200">
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Financial Status</h2>
        <p className="text-muted-foreground">Your current financial overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Financial Overview</CardTitle>
            </div>
            <CardDescription>Financial status for {DEFAULT_USER_EMAIL}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {financialStatus || "No financial status data available"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Current user details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-muted-foreground">{DEFAULT_USER_EMAIL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className="text-sm text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated:</span>
                <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/debt-accounts"
                className="flex items-center justify-center p-3 text-sm font-medium rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Debt Accounts
              </a>
              <a
                href="/debts"
                className="flex items-center justify-center p-3 text-sm font-medium rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Manage Debts
              </a>
              <a
                href="/fixed-expenses"
                className="flex items-center justify-center p-3 text-sm font-medium rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Fixed Expenses
              </a>
              <a
                href="/profile"
                className="flex items-center justify-center p-3 text-sm font-medium rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Profile
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
