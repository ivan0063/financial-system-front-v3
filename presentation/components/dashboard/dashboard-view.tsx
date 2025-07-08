"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, User, CreditCard, DollarSign, TrendingUp, Calendar, PiggyBank, AlertTriangle } from "lucide-react"
import { FinancialStatusService, type FinancialStatusResponse } from "@/application/services/financial-status-service"
import { DEFAULT_USER_EMAIL } from "@/infrastructure/api/api-client"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export function DashboardView() {
  const [financialStatus, setFinancialStatus] = useState<FinancialStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const financialStatusService = new FinancialStatusService()

  const fetchFinancialStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const status = await financialStatusService.execute(DEFAULT_USER_EMAIL)
      setFinancialStatus(status)
    } catch (error) {
      console.error("Error fetching financial status:", error)
      setError(error instanceof Error ? error.message : "Failed to load financial status")
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
          <Skeleton className="h-8 w-48" />
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
        <Card className="border-red-200">
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => fetchFinancialStatus()} variant="outline">
              Try Again
            </Button>
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
            <p className="text-muted-foreground">No financial status data available.</p>
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

  const totalDebtBalance = userDebtAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const totalCreditLimit = userDebtAccounts.reduce((sum, account) => sum + account.creditLimit, 0)
  const totalAvailableCredit = totalCreditLimit - totalDebtBalance
  const monthlyNetIncome = salary - monthlyDebtPaymentAmount - monthlyFixedExpensesAmount

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Status</h1>
          <p className="text-muted-foreground">Your comprehensive financial overview</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${salary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${savings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Debt Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${monthlyDebtPaymentAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly debt obligations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixed Expenses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${monthlyFixedExpensesAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly fixed costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Net Income Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">${salary.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${(monthlyDebtPaymentAmount + monthlyFixedExpensesAmount).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Net Monthly Income</p>
              <p className={`text-2xl font-bold ${monthlyNetIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${monthlyNetIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Accounts Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-xl font-bold text-red-600">${totalDebtBalance.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Credit Limit</p>
                <p className="text-xl font-bold">${totalCreditLimit.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Available Credit</p>
                <p className="text-xl font-bold text-green-600">${totalAvailableCredit.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              {userDebtAccounts.slice(0, 3).map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{account.accountName}</p>
                      <Badge variant={account.status === "Active" ? "default" : "secondary"}>{account.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.financialProvider} • {account.interestRate}% APR
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium text-red-600">${account.currentBalance.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      ${account.availableCredit.toLocaleString()} available
                    </p>
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
              {almostCompletedDebts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                  <div className="space-y-1">
                    <p className="font-medium">{debt.accountName}</p>
                    <p className="text-sm text-muted-foreground">
                      {((debt.currentBalance / debt.creditLimit) * 100).toFixed(1)}% of credit limit used
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-700">${debt.currentBalance.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">remaining</p>
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
          <div className="flex items-center justify-between">
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
                <div className="space-y-1">
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category} • Due: {new Date(expense.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${expense.amount.toLocaleString()}</p>
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
