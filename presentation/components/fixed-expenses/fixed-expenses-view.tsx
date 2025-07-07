"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { FixedExpenseForm } from "./fixed-expense-form"
import { FixedExpenseList } from "./fixed-expense-list"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import { Plus } from "lucide-react"

export function FixedExpensesView() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadFixedExpenses()
  }, [])

  const loadFixedExpenses = async () => {
    try {
      const expenses = await fixedExpenseRepository.findAll()
      setFixedExpenses(expenses)
    } catch (error) {
      console.error("Error loading fixed expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseCreated = () => {
    setShowForm(false)
    loadFixedExpenses()
  }

  const handleExpenseDeleted = () => {
    loadFixedExpenses()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading fixed expenses...</div>
          </div>
        </div>
      </div>
    )
  }

  const totalMonthlyExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.monthlyCost, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Fixed Expenses</h2>
            <p className="text-muted-foreground">Manage your recurring monthly expenses</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>Total fixed expenses per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalMonthlyExpenses.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">
                {fixedExpenses.length} expense{fixedExpenses.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Fixed Expense</CardTitle>
              <CardDescription>Add a new recurring monthly expense</CardDescription>
            </CardHeader>
            <CardContent>
              <FixedExpenseForm onSuccess={handleExpenseCreated} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <FixedExpenseList fixedExpenses={fixedExpenses} onExpenseDeleted={handleExpenseDeleted} />
      </div>
    </div>
  )
}
