"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Edit, Trash2, AlertCircle, DollarSign } from "lucide-react"
import type { Debt } from "@/domain/entities/debt"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import { useToast } from "@/hooks/use-toast"

interface DebtListProps {
  onEdit: (debt: Debt) => void
  refreshTrigger?: number
}

export function DebtList({ onEdit, refreshTrigger }: DebtListProps) {
  const [debts, setDebts] = useState<Debt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadDebts()
  }, [refreshTrigger])

  const loadDebts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const debtData = await debtRepository.findAll()
      setDebts(Array.isArray(debtData) ? debtData : [])
    } catch (error) {
      console.error("Error loading debts:", error)
      setError("Failed to load debts")
      setDebts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (debt: Debt) => {
    if (!confirm(`Are you sure you want to delete "${debt.description}"?`)) {
      return
    }

    setDeletingId(debt.id)
    try {
      await debtRepository.delete(debt.id)
      toast({
        title: "Success",
        description: "Debt deleted successfully",
      })
      await loadDebts() // Refresh the list
    } catch (error) {
      console.error("Error deleting debt:", error)
      toast({
        title: "Error",
        description: "Failed to delete debt",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading debts...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadDebts} variant="outline" className="mt-4 bg-transparent">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Debts ({debts.length})
        </CardTitle>
        <CardDescription>Manage your debt obligations</CardDescription>
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No debts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {debts.map((debt) => {
              const completionPercentage = (debt.currentInstallment / debt.maxFinancingTerm) * 100
              const remainingAmount = debt.originalAmount - debt.monthlyPayment * debt.currentInstallment
              const remainingInstallments = debt.maxFinancingTerm - debt.currentInstallment

              return (
                <div key={debt.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{debt.description}</h4>
                        <Badge variant={debt.active ? "default" : "secondary"}>
                          {debt.active ? "Active" : "Inactive"}
                        </Badge>
                        {debt.debtAccount && <Badge variant="outline">Account: {debt.debtAccount.code}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Operation Date: {debt.operationDate}</p>
                        <p>Original Amount: {formatCurrency(debt.originalAmount)}</p>
                        <p>Monthly Payment: {formatCurrency(debt.monthlyPayment)}</p>
                        <p>Remaining: {formatCurrency(Math.max(remainingAmount, 0))}</p>
                        <p>
                          Installments: {debt.currentInstallment} / {debt.maxFinancingTerm}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(debt)}
                        disabled={deletingId === debt.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(debt)}
                        disabled={deletingId === debt.id}
                      >
                        {deletingId === debt.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{completionPercentage.toFixed(1)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(completionPercentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{remainingInstallments} installments remaining</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
