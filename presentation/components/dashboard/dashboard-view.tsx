"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "../layout/header"
import { FinancialStatusService } from "@/application/services/financial-status-service"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import type { Debt } from "@/domain/entities/debt"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CreditCard,
  PiggyBank,
  Calendar,
  Target,
  Loader2,
} from "lucide-react"

interface FinancialStatus {
  salary: number
  savings: number
  monthlyDebtPaymentAmount: number
  monthlyFixedExpensesAmount: number
}

export function DashboardView() {
  const [financialStatus, setFinancialStatus] = useState<FinancialStatus | null>(null)
  const [almostCompletedDebts, setAlmostCompletedDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const financialStatusService = new FinancialStatusService()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load financial status
      const status = await financialStatusService.execute("jimm0063@gmail.com")
      setFinancialStatus(status)

      // Load almost completed debts (>80% completed)
      const allDebts = await debtRepository.findAll()
      const almostCompleted = allDebts.filter((debt) => {
        const completionPercentage = (debt.currentInstallment / debt.maxFinancingTerm) * 100
        return completionPercentage >= 80 && debt.active
      })
      setAlmostCompletedDebts(almostCompleted)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading dashboard...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const totalExpenses =
    (financialStatus?.monthlyDebtPaymentAmount || 0) + (financialStatus?.monthlyFixedExpensesAmount || 0)
  const netIncome = (financialStatus?.salary || 0) - totalExpenses
  const expenseRatio = financialStatus?.salary ? (totalExpenses / financialStatus.salary) * 100 : 0
  const emergencyFundTarget = totalExpenses * 6 // 6 months of expenses
  const emergencyFundProgress = financialStatus?.savings ? (financialStatus.savings / emergencyFundTarget) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Dashboard</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Overview of your financial status and debt progress
            </p>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${financialStatus?.salary?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">Your monthly salary</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{expenseRatio.toFixed(1)}% of income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <TrendingUp className={`h-4 w-4 ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${netIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">After all expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${financialStatus?.savings?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">Emergency fund</p>
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Expense Breakdown
              </CardTitle>
              <CardDescription>Monthly expense distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Debt Payments</span>
                  <span className="font-medium">
                    ${financialStatus?.monthlyDebtPaymentAmount?.toLocaleString() || "0"}
                  </span>
                </div>
                <Progress
                  value={
                    financialStatus?.salary
                      ? (financialStatus.monthlyDebtPaymentAmount / financialStatus.salary) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fixed Expenses</span>
                  <span className="font-medium">
                    ${financialStatus?.monthlyFixedExpensesAmount?.toLocaleString() || "0"}
                  </span>
                </div>
                <Progress
                  value={
                    financialStatus?.salary
                      ? (financialStatus.monthlyFixedExpensesAmount / financialStatus.salary) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Expenses</span>
                  <span>${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Expense Ratio</span>
                  <span>{expenseRatio.toFixed(1)}% of income</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Emergency Fund Status
              </CardTitle>
              <CardDescription>6-month expense target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Savings</span>
                  <span className="font-medium">${financialStatus?.savings?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Target (6 months)</span>
                  <span>${emergencyFundTarget.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(emergencyFundProgress, 100)} className="h-3" />
                <div className="text-center text-sm">
                  <span
                    className={`font-medium ${emergencyFundProgress >= 100 ? "text-green-600" : "text-orange-600"}`}
                  >
                    {emergencyFundProgress.toFixed(1)}% Complete
                  </span>
                </div>
              </div>

              {emergencyFundProgress < 100 && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    You need ${(emergencyFundTarget - (financialStatus?.savings || 0)).toLocaleString()} more to reach
                    your emergency fund goal.
                  </p>
                </div>
              )}

              {emergencyFundProgress >= 100 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">🎉 Congratulations! You've reached your emergency fund goal.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Almost Completed Debts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Almost Completed Debts
            </CardTitle>
            <CardDescription>Debts that are 80% or more completed</CardDescription>
          </CardHeader>
          <CardContent>
            {almostCompletedDebts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No debts are close to completion yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {almostCompletedDebts.map((debt) => {
                  const completionPercentage = (debt.currentInstallment / debt.maxFinancingTerm) * 100
                  const remainingAmount = debt.originalAmount - debt.monthlyPayment * debt.currentInstallment
                  const remainingInstallments = debt.maxFinancingTerm - debt.currentInstallment

                  return (
                    <div key={debt.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{debt.description}</h4>
                            <Badge variant="outline">Code: {debt.debtAccount?.code || "N/A"}</Badge>
                            <Badge variant="secondary">{completionPercentage.toFixed(1)}% Complete</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Original Amount: ${debt.originalAmount.toLocaleString()}</p>
                            <p>Monthly Payment: ${debt.monthlyPayment.toLocaleString()}</p>
                            <p>Remaining: ${Math.max(remainingAmount, 0).toLocaleString()}</p>
                            <p>Installments Left: {remainingInstallments}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {debt.currentInstallment} / {debt.maxFinancingTerm}
                          </span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
