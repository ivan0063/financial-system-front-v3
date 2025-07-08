"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  const [deletingDebt, setDeletingDebt] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this debt?")) {
      return
    }

    setDeletingDebt(id)
    try {
      await debtRepository.delete(id)
      onDebtDeleted()
    } catch (error) {
      console.error("Error deleting debt:", error)
      alert("Failed to delete debt. Please try again.")
    } finally {
      setDeletingDebt(null)
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

  const getDebtAccountInfo = (debt: Debt) => {
    // Try to get account info from the debt's debtAccount property
    if (debt.debtAccount?.code) {
      const account = debtAccounts.find((acc) => acc.code === debt.debtAccount?.code)
      return {
        code: debt.debtAccount.code,
        name: account?.name || debt.debtAccount.code,
        uri: debt.debtAccount.uri || `/jpa/debtAccount/${debt.debtAccount.code}`,
      }
    }

    // Fallback: try to extract from URI if available
    if (debt.debtAccount?.uri) {
      const codeMatch = debt.debtAccount.uri.match(/\/debtAccount\/(.+)$/)
      const code = codeMatch ? codeMatch[1] : "unknown"
      const account = debtAccounts.find((acc) => acc.code === code)
      return {
        code,
        name: account?.name || code,
        uri: debt.debtAccount.uri,
      }
    }

    // Last resort
    return {
      code: "unknown",
      name: "Unknown Account",
      uri: "N/A",
    }
  }

  // Group debts by account
  const debtsByAccount = debts.reduce(
    (acc, debt) => {
      const accountInfo = getDebtAccountInfo(debt)
      const accountCode = accountInfo.code
      if (!acc[accountCode]) {
        acc[accountCode] = {
          debts: [],
          accountInfo,
        }
      }
      acc[accountCode].debts.push(debt)
      return acc
    },
    {} as Record<string, { debts: Debt[]; accountInfo: { code: string; name: string; uri: string } }>,
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
      {Object.entries(debtsByAccount).map(([accountCode, { debts: accountDebts, accountInfo }]) => (
        <Card key={accountCode}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{accountInfo.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      Account Code: <span className="font-mono">{accountInfo.code}</span>
                    </p>
                    <p>
                      URI: <span className="font-mono text-xs">{accountInfo.uri}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {accountDebts.length} debt{accountDebts.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-lg font-semibold">
                    ${accountDebts.reduce((sum, debt) => sum + debt.originalAmount, 0).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePayOff(accountCode)}
                  disabled={loadingPayOff[accountCode] || accountCode === "unknown"}
                >
                  {loadingPayOff[accountCode] ? "Processing..." : "Pay Off All"}
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Monthly Payment</TableHead>
                  <TableHead className="text-center">Installments</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountDebts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.description}</TableCell>
                    <TableCell>{debt.operationDate}</TableCell>
                    <TableCell className="text-right font-medium">${debt.originalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${debt.monthlyPayment.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      {debt.currentInstallment}/{debt.maxFinancingTerm}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={debt.active ? "default" : "secondary"}>
                        {debt.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(debt.id)}
                        disabled={deletingDebt === debt.id}
                      >
                        {deletingDebt === debt.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ))}
    </div>
  )
}
