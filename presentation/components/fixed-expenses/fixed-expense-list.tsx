"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import { Trash2, Calendar } from "lucide-react"

interface FixedExpenseListProps {
  fixedExpenses: FixedExpense[]
  onExpenseDeleted: () => void
}

export function FixedExpenseList({ fixedExpenses, onExpenseDeleted }: FixedExpenseListProps) {
  // Remove: const fixedExpenseRepository = new ApiFixedExpenseRepository()
  // It's now imported as an instance

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this fixed expense?")) {
      return
    }

    try {
      await fixedExpenseRepository.delete(id)
      onExpenseDeleted()
    } catch (error) {
      console.error("Error deleting fixed expense:", error)
    }
  }

  if (fixedExpenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No fixed expenses found. Create your first expense to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fixedExpenses.map((expense) => (
        <Card key={expense.id}>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${expense.monthlyCost.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">per month</span>
              </div>

              <div className="flex justify-end mt-4">
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
