"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import { Trash2, Calendar, Edit, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FixedExpenseListProps {
  expenses: FixedExpense[]
  onExpenseDeleted: () => void
  onExpenseEdit?: (expense: FixedExpense) => void
}

export function FixedExpenseList({ expenses, onExpenseDeleted, onExpenseEdit }: FixedExpenseListProps) {
  const { toast } = useToast()

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this fixed expense?")) {
      return
    }

    try {
      await fixedExpenseRepository.delete(id)
      onExpenseDeleted()

      toast({
        title: "Success",
        description: "Fixed expense deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting fixed expense:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete fixed expense"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (expense: FixedExpense) => {
    if (onExpenseEdit) {
      onExpenseEdit(expense)
    }
  }

  // Ensure expenses is always an array
  const expenseList = Array.isArray(expenses) ? expenses : []

  if (expenseList.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No fixed expenses found. Create your first expense to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {expenseList.map((expense) => (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{expense.name}</CardTitle>
              <Badge variant={expense.active ? "default" : "secondary"}>{expense.active ? "Active" : "Inactive"}</Badge>
            </div>
            <CardDescription className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Due on day {expense.paymentDay}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${expense.monthlyCost.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">per month</span>
              </div>

              <div className="flex justify-end gap-2">
                {onExpenseEdit && (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(expense)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(expense.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
