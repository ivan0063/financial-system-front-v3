"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import type { Debt } from "@/domain/entities/debt"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { Trash2, CreditCard } from "lucide-react"

interface DebtListProps {
  debts: Debt[]
  debtAccounts: DebtAccount[]
  onDebtDeleted: () => void
}

export function DebtList({ debts, debtAccounts, onDebtDeleted }: DebtListProps) {
  const [loadingPayOff, setLoadingPayOff] = useState<Record<string, boolean>>({})

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this debt?")) {
      return
    }

    try {
      await debtRepository.delete(id)
      onDebtDeleted()
    } catch (error) {
      console.error("Error deleting debt:", error)
    }
  }

  const handlePayOff = async (debtAccountCode: string) => {
    if (!confirm("Are you sure you want to pay off all debts for this account? This action cannot be undone.")) {
      return
    }

    setLoadingPayOff({ ...loadingPayOff, [debtAccountCode]: true })
    try {
      const result = await debtRepository.payOffDebts(debtAccountCode)
      console.log("Pay off result:", result)

      // Show success message
      alert(`Successfully paid off debts: ${result}`)

      onDebtDeleted() // Refresh the list
    } catch (error) {
      console.error("Error paying off debts:", error)
      alert(`Failed to pay off debts: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoadingPayOff({ ...loadingPayOff, [debtAccountCode]: false })
    }
  }

  const getDebtAccountName = (code: string) => {
    const account = debtAccounts.find((acc) => acc.code === code)
    return account ? account.name : code
  }

  // Group debts by account
  const debtsByAccount = debts.reduce(
    (acc, debt) => {
      const accountCode = debt.debtAccount?.code || "unknown"
      if (!acc[accountCode]) {
        acc[accountCode] = []
      }
      acc[accountCode].push(debt)
      return acc
    },
    {} as Record<string, Debt[]>,
  )

  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No debts found. Create your first debt to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(debtsByAccount).map(([accountCode, accountDebts]) => (
        <Card key={accountCode}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {getDebtAccountName(accountCode)}
                </CardTitle>
                <CardDescription>
                  {accountDebts.length} debt{accountDebts.length !== 1 ? "s" : ""} • Total: $
                  {accountDebts.reduce((sum, debt) => sum + debt.originalAmount, 0).toFixed(2)}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => handlePayOff(accountCode)} disabled={loadingPayOff[accountCode]}>
                {loadingPayOff[accountCode] ? "Processing..." : "Pay Off All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accountDebts.map((debt) => (
                <Card key={debt.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{debt.description}</CardTitle>
                    <CardDescription>{debt.operationDate}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span className="font-medium">${debt.originalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">${debt.monthlyPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Installments:</span>
                      <span className="font-medium">
                        {debt.currentInstallment}/{debt.maxFinancingTerm}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant={debt.active ? "default" : "secondary"}>
                        {debt.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(debt.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
