"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RefreshCw,
  User,
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  PiggyBank,
  AlertTriangle,
  Wifi,
  WifiOff,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { FinancialStatusService, type UserStatusDashboard } from "@/application/services/financial-status-service"
import { DEFAULT_USER_EMAIL } from "@/infrastructure/api/api-client"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DashboardView() {
  const [financialStatus, setFinancialStatus] = useState<UserStatusDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")
  const router = useRouter()

  const financialStatusService = new FinancialStatusService()

  const fetchFinancialStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    setConnectionStatus("checking")

    try {
      console.log(`Attempting to fetch financial status for: ${DEFAULT_USER_EMAIL}`)
      const status = await financialStatusService.execute(DEFAULT_USER_EMAIL)
      setFinancialStatus(status)
      setConnectionStatus("connected")
      console.log("Successfully fetched financial status:", status)
    } catch (error) {
      console.error("Error fetching financial status:", error)
      setConnectionStatus("failed")

      if (error instanceof Error) {
        if (error.message.includes("CORS Error")) {
          setError(
            `Connection Error: Cannot connect to API server. Please ensure:
1. API server is running at the configured URL
2. CORS is properly configured on the API server
3. Network connectivity is available

Technical details: ${error.message}`,
          )
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred while fetching financial status")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFinancialStatus()
  }, [])

  const handleRefresh = () => {
    fetchFinancialStatus(true)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Connection Error</p>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === "failed" ? (
              <WifiOff className="h-5 w-5 text-red-500" />
            ) : (
              <Wifi className="h-5 w-5 text-green-500" />
            )}
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Retrying..." : "Retry"}
            </Button>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Verify the API server is running at:{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  {process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.50.180:666"}
                </code>
              </li>
              <li>Check if you can access the API directly in your browser</li>
              <li>
                Ensure the API server has CORS configured to allow requests from:{" "}
                <code className="bg-yellow-100 px-1 rounded">
                  {typeof window !== "undefined" ? window.location.origin : "this domain"}
                </code>
              </li>
              <li>Verify network connectivity between your device and the API server</li>
              <li>Check firewall settings that might block the connection</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!financialStatus) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
              <p className="text-muted-foreground">No financial status data available.</p>
              <Button onClick={() => fetchFinancialStatus()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const {
    salary,
    savings,
    monthlyDebtPaymentAmount,
    monthlyFixedExpensesAmount,
    userDebtAccounts,
    almostCompletedDebts,
    userFixedExpenses,
  } = financialStatus

  const totalDebtBalance = userDebtAccounts.reduce((sum, account) => sum + (account.credit || 0), 0)
  const totalCreditLimit = userDebtAccounts.reduce((sum, account) => sum + account.credit, 0)
  const monthlyNetIncome = salary - monthlyDebtPaymentAmount - monthlyFixedExpensesAmount
  const totalMonthlyExpenses = monthlyDebtPaymentAmount + monthlyFixedExpensesAmount

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Your comprehensive financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">Connected</span>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Financial Overview - Redesigned for Better Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income vs Expenses Comparison */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Financial Overview
            </CardTitle>
            <CardDescription>Income vs Expenses breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Income */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Monthly Income</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Salary</span>
                    <span className="font-bold text-2xl text-green-600">${salary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Monthly Expenses</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Debt Payments</span>
                    <span className="font-medium text-red-600">${monthlyDebtPaymentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fixed Expenses</span>
                    <span className="font-medium text-red-600">${monthlyFixedExpensesAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total</span>
                      <span className="font-bold text-xl text-red-600">${totalMonthlyExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Net Income</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <span className={`font-bold text-2xl ${monthlyNetIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${monthlyNetIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{monthlyNetIncome >= 0 ? "Surplus" : "Deficit"}</div>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Expense Ratio</span>
                <span>{((totalMonthlyExpenses / salary) * 100).toFixed(1)}% of income</span>
              </div>
              <Progress value={(totalMonthlyExpenses / salary) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Debt: {((monthlyDebtPaymentAmount / salary) * 100).toFixed(1)}%</span>
                <span>Fixed: {((monthlyFixedExpensesAmount / salary) * 100).toFixed(1)}%</span>
                <span>Available: {((monthlyNetIncome / salary) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Savings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${savings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {savings > 0 ? `${(savings / salary).toFixed(1)} months of salary` : "No savings"}
            </p>
          </CardContent>
        </Card>

        {/* Emergency Fund Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {savings >= totalMonthlyExpenses * 6 ? (
                  <span className="text-green-600">✓ Covered</span>
                ) : (
                  <span className="text-yellow-600">Partial</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Target: ${(totalMonthlyExpenses * 6).toLocaleString()} (6 months expenses)
              </p>
              <Progress value={Math.min((savings / (totalMonthlyExpenses * 6)) * 100, 100)} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Accounts Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Debt Accounts ({userDebtAccounts.length})
            </CardTitle>
            <Button onClick={() => router.push("/debt-accounts")} variant="outline" size="sm">
              Manage All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Credit Limit</p>
                <p className="text-xl font-bold">${totalCreditLimit.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-xl font-bold text-blue-600">{userDebtAccounts.filter((acc) => acc.active).length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Monthly Payments</p>
                <p className="text-xl font-bold text-red-600">${monthlyDebtPaymentAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              {userDebtAccounts.slice(0, 3).map((account) => (
                <div key={account.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{account.name}</p>
                      <Badge variant={account.active ? "default" : "secondary"} className="text-xs">
                        {account.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {account.accountStatementType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.financialProvider?.name || "No Provider"} • Pay Day: {account.payDay}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">${account.credit.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Credit Limit</p>
                  </div>
                </div>
              ))}
              {userDebtAccounts.length > 3 && (
                <div className="text-center pt-2">
                  <Button onClick={() => router.push("/debt-accounts")} variant="ghost" size="sm">
                    View {userDebtAccounts.length - 3} more accounts
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Almost Completed Debts */}
      {almostCompletedDebts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Almost Completed Debts
            </CardTitle>
            <CardDescription>Debts that are close to being paid off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {almostCompletedDebts.map((debt, index) => (
                <div
                  key={`${debt.code}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{debt.description}</p>
                      {debt.code && (
                        <Badge variant="outline" className="text-xs">
                          {debt.code}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {debt.currentInstallment} of {debt.maxFinancingTerm} installments
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(debt.currentInstallment / debt.maxFinancingTerm) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-yellow-700">${debt.monthlyPayment.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">monthly payment</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed Expenses */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fixed Expenses ({userFixedExpenses.length})
            </CardTitle>
            <Button onClick={() => router.push("/fixed-expenses")} variant="outline" size="sm">
              Manage All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userFixedExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-medium truncate">{expense.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.fixedExpenseCatalog.name} • Pay Day: {expense.paymentDay}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${expense.monthlyCost.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {userFixedExpenses.length > 5 && (
              <div className="text-center pt-2">
                <Button onClick={() => router.push("/fixed-expenses")} variant="ghost" size="sm">
                  View {userFixedExpenses.length - 5} more expenses
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button onClick={() => router.push("/debt-accounts")} variant="outline" className="justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Accounts
            </Button>
            <Button onClick={() => router.push("/debts")} variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              View Debts
            </Button>
            <Button onClick={() => router.push("/fixed-expenses")} variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Fixed Expenses
            </Button>
            <Button onClick={() => router.push("/profile")} variant="outline" className="justify-start">
              <User className="h-4 w-4 mr-2" />
              Profile Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
