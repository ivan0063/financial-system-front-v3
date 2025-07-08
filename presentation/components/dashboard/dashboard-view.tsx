"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, CreditCard, TrendingUp, AlertTriangle, PiggyBank, Calendar, Target } from "lucide-react"
import {
  financialStatusService,
  type UserStatusDashboard,
} from "../../../application/services/financial-status-service"
import { DEFAULT_USER_EMAIL } from "../../../infrastructure/api/api-client"

export function DashboardView() {
  const [dashboardData, setDashboardData] = useState<UserStatusDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await financialStatusService.getUserFinancialStatus(DEFAULT_USER_EMAIL)
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>No dashboard data available.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const availableIncome =
    dashboardData.salary - dashboardData.monthlyDebtPaymentAmount - dashboardData.monthlyFixedExpensesAmount
  const debtToIncomeRatio =
    dashboardData.salary > 0 ? (dashboardData.monthlyDebtPaymentAmount / dashboardData.salary) * 100 : 0
  const expenseToIncomeRatio =
    dashboardData.salary > 0 ? (dashboardData.monthlyFixedExpensesAmount / dashboardData.salary) * 100 : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial status and debt management</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.salary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Your monthly income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.savings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total savings amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Debt Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.monthlyDebtPaymentAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{debtToIncomeRatio.toFixed(1)}% of income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${availableIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">After debts and expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Debt-to-Income Ratio</CardTitle>
            <CardDescription>Recommended to keep below 36%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Debt Payments</span>
                <span>{debtToIncomeRatio.toFixed(1)}%</span>
              </div>
              <Progress value={debtToIncomeRatio} className="h-2" max={100} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Fixed Expenses</span>
                <span>{expenseToIncomeRatio.toFixed(1)}%</span>
              </div>
              <Progress value={expenseToIncomeRatio} className="h-2" max={100} />
            </div>
            {debtToIncomeRatio > 36 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your debt-to-income ratio is above the recommended 36%. Consider debt consolidation or payment
                  strategies.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Fixed Expenses</CardTitle>
            <CardDescription>Total: ${dashboardData.monthlyFixedExpensesAmount.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.userFixedExpenses.length > 0 ? (
                dashboardData.userFixedExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{expense.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Day {expense.paymentDay}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">${expense.monthlyCost.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No fixed expenses recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Accounts and Almost Completed Debts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Debt Accounts</CardTitle>
            <CardDescription>{dashboardData.userDebtAccounts.length} active account(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.userDebtAccounts.length > 0 ? (
                dashboardData.userDebtAccounts.map((account) => (
                  <div key={account.code} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Code: {account.code} • Pay Day: {account.payDay}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${account.credit.toLocaleString()}</div>
                      <Badge variant="secondary" className="text-xs">
                        {account.accountStatementType}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No debt accounts found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Almost Completed Debts</CardTitle>
            <CardDescription>Debts nearing completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.almostCompletedDebts.length > 0 ? (
                dashboardData.almostCompletedDebts.map((debt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{debt.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {debt.currentInstallment} of {debt.maxFinancingTerm} payments
                      </div>
                      <Progress value={(debt.currentInstallment / debt.maxFinancingTerm) * 100} className="h-2 mt-2" />
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-medium">${debt.monthlyPayment.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">monthly</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">No debts nearing completion</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
