"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, AlertCircle } from "lucide-react"
import { Header } from "../layout/header"
import { FixedExpenseForm } from "./fixed-expense-form"
import { FixedExpenseList } from "./fixed-expense-list"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import { useToast } from "@/hooks/use-toast"

export function FixedExpensesView() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Loading fixed expenses...")

      const data = await fixedExpenseRepository.findAll()
      console.log("📊 Loaded expenses:", data)

      // Ensure we always have an array
      const expensesArray = Array.isArray(data) ? data : []
      setExpenses(expensesArray)

      if (expensesArray.length === 0) {
        console.log("ℹ️ No fixed expenses found")
      }
    } catch (error) {
      console.error("❌ Error loading fixed expenses:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load fixed expenses"
      setError(errorMessage)
      setExpenses([]) // Ensure we have an empty array on error

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseCreated = () => {
    setShowForm(false)
    setEditingExpense(null)
    loadExpenses()

    toast({
      title: "Success",
      description: editingExpense ? "Fixed expense updated successfully" : "Fixed expense created successfully",
    })
  }

  const handleExpenseDeleted = () => {
    loadExpenses()

    toast({
      title: "Success",
      description: "Fixed expense deleted successfully",
    })
  }

  const handleEditExpense = (expense: FixedExpense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingExpense(null)
  }

  const handleAddExpense = () => {
    setEditingExpense(null)
    setShowForm(true)
  }

  // Calculate total monthly expenses safely
  const totalMonthlyExpenses = Array.isArray(expenses)
    ? expenses.reduce((sum, expense) => sum + (expense.monthlyCost || 0), 0)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <div className="text-lg">Loading fixed expenses...</div>
            </div>
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
          <Button onClick={handleAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Monthly Summary */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>Total fixed expenses per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalMonthlyExpenses.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
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

        {/* Expense List */}
        <FixedExpenseList
          expenses={expenses}
          onExpenseDeleted={handleExpenseDeleted}
          onExpenseEdit={handleEditExpense}
        />
      </div>
    </div>
  )
}
