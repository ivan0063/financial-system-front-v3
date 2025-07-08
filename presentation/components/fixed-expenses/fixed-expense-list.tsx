"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DollarSign, Calendar, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import type { FixedExpense } from "@/domain/entities/fixed-expense"

interface FixedExpenseListProps {
  expenses: FixedExpense[]
  onExpenseDeleted: () => void
  onExpenseEdit: (expense: FixedExpense) => void
}

export function FixedExpenseList({ expenses, onExpenseDeleted, onExpenseEdit }: FixedExpenseListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id)
      await fixedExpenseRepository.delete(id)
      onExpenseDeleted()
      toast({
        title: "Success",
        description: "Fixed expense deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting fixed expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete fixed expense",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Ensure expenses is always an array
  const safeExpenses = Array.isArray(expenses) ? expenses : []

  if (safeExpenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Fixed Expenses Found</h3>
          <p className="text-muted-foreground text-center">
            You don't have any fixed expenses yet. Create one to start tracking your recurring costs.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalMonthlyExpenses = safeExpenses.reduce((sum, expense) => sum + expense.monthlyCost, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Fixed Expenses</h3>
          <p className="text-sm text-muted-foreground">
            Total Monthly Cost: <span className="font-semibold">${totalMonthlyExpenses.toFixed(2)}</span>
          </p>
        </div>
        <Badge variant="secondary">
          {safeExpenses.length} expense{safeExpenses.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {safeExpenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{expense.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExpenseEdit(expense)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === expense.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Fixed Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{expense.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(expense.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Cost</p>
                    <p className="font-semibold">${expense.monthlyCost.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Day</p>
                    <p className="font-semibold">Day {expense.paymentDay}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant={expense.active ? "default" : "secondary"}>
                  {expense.active ? "Active" : "Inactive"}
                </Badge>
                {expense.fixedExpenseCatalog && (
                  <Badge variant="outline">
                    {expense.fixedExpenseCatalog.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FixedExpenseListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
