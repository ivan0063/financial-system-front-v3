"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { FinancialStatusService } from "@/application/services/financial-status-service"
import { DEFAULT_USER_EMAIL } from "@/infrastructure/api/api-client"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import { CreditCard, DollarSign, FileText, TrendingUp } from "lucide-react"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"

export function DashboardView() {
  const [financialStatus, setFinancialStatus] = useState<string>("")
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([])
  const [totalDebts, setTotalDebts] = useState<number>(0)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)

  const financialStatusService = new FinancialStatusService()
  // const debtAccountRepository = new ApiDebtAccountRepository()
  // const debtRepository = new ApiDebtRepository()
  // const fixedExpenseRepository = new ApiFixedExpenseRepository()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [status, accounts, debts, expenses] = await Promise.all([
          financialStatusService.execute(DEFAULT_USER_EMAIL),
          debtAccountRepository.findAll(),
          debtRepository.findAll(),
          fixedExpenseRepository.findAll(),
        ])

        setFinancialStatus(status)
        setDebtAccounts(accounts)
        setTotalDebts(debts.length)
        setFixedExpenses(expenses)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const totalDebtAmount = debtAccounts.reduce((sum, account) => sum + account.credit, 0)
  const totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.monthlyCost, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your financial status and debt management</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debt Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{debtAccounts.length}</div>
              <p className="text-xs text-muted-foreground">Active debt accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debts</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDebts}</div>
              <p className="text-xs text-muted-foreground">Individual debt items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalDebtAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total credit available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fixed Expenses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalFixedExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Monthly fixed costs</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Financial Status</CardTitle>
              <CardDescription>Current financial overview for {DEFAULT_USER_EMAIL}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{financialStatus || "No financial status available"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Debt Accounts</CardTitle>
              <CardDescription>Your most recently created debt accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {debtAccounts.slice(0, 5).map((account) => (
                  <div key={account.code} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">Pay day: {account.payDay}</div>
                    </div>
                    <div className="text-sm font-medium">${account.credit.toFixed(2)}</div>
                  </div>
                ))}
                {debtAccounts.length === 0 && (
                  <div className="text-sm text-muted-foreground">No debt accounts found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
