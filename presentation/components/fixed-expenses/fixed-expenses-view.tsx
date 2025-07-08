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
  const [expenses, setExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const data = await fixedExpenseRepository.findAll()
      setExpenses(data)
    } catch (error) {
      console.error("Error loading fixed expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseCreated = () => {
    setShowForm(false)
    setEditingExpense(null)
    loadExpenses()
  }

  const handleExpenseDeleted = () => {
    loadExpenses()
  }

  const handleEditExpense = (expense: FixedExpense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingExpense(null)
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

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingExpense ? "Edit" : "Create New"} Fixed Expense</CardTitle>
              <CardDescription>
                {editingExpense ? "Update the expense information" : "Add a new recurring expense to track"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FixedExpenseForm expense={editingExpense} onClose={handleExpenseCreated} />
            </CardContent>
          </Card>
        )}

        <FixedExpenseList
          expenses={expenses}
          onExpenseDeleted={handleExpenseDeleted}
          onExpenseEdit={handleEditExpense}
        />
      </div>
    </div>
  )
}
