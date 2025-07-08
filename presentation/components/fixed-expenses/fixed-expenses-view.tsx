"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Header } from "../layout/header"
import { FixedExpenseForm } from "./fixed-expense-form"
import { FixedExpenseList } from "./fixed-expense-list"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import { Plus, AlertTriangle } from 'lucide-react'

export function FixedExpensesView() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fixedExpenseRepository.findAll()
      
      // Ensure we always have an array
      setExpenses(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error loading fixed expenses:", err)
      setError("Failed to load fixed expenses. Please try again.")
      setExpenses([])
      toast({
        title: "Error",
        description: "Failed to load fixed expenses",
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
      description: "Fixed expense created successfully",
    })
  }

  const handleExpenseUpdated = () => {
    setShowForm(false)
    setEditingExpense(null)
    loadExpenses()
    toast({
      title: "Success",
      description: "Fixed expense updated successfully",
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

  const handleCancelForm = () => {
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadExpenses}>
              Refresh
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingExpense ? "Edit Fixed Expense" : "Create New Fixed Expense"}
              </CardTitle>
              <CardDescription>
                {editingExpense 
                  ? "Update the details of your fixed expense" 
                  : "Add a new recurring monthly expense"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FixedExpenseForm
                expense={editingExpense}
                onSuccess={editingExpense ? handleExpenseUpdated : handleExpenseCreated}
                onCancel={handleCancelForm}
              />
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
