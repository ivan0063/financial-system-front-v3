"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import { debtManagementService } from "@/application/services/debt-management-service"
import type { Debt } from "@/domain/entities/debt"
import { Trash2, CreditCard, Calendar, DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DebtListProps {
  debts: Debt[]
  onDebtDeleted: () => void
}

export function DebtList({ debts, onDebtDeleted }: DebtListProps) {
  const [payingOff, setPayingOff] = useState<string | null>(null)
  const { toast } = useToast()

  const getDebtAccountInfo = (debt: Debt) => {
    if (!debt.debtAccount) {
      return {
        code: "Unknown",
        name: "Unknown Account",
        uri: "No URI available",
      }
    }

    // Handle different formats of debt account data
    if (typeof debt.debtAccount === "string") {
      // If it's a URI string like "/jpa/debtAccount/CARD001"
      const parts = debt.debtAccount.split("/")
      const code = parts[parts.length - 1] || "Unknown"
      return {
        code,
        name: `Account ${code}`,
        uri: debt.debtAccount,
      }
    }

    // If it's an object with properties
    return {
      code: debt.debtAccount.code || "Unknown",
      name: debt.debtAccount.name || `Account ${debt.debtAccount.code || "Unknown"}`,
      uri: debt.debtAccount.code ? `/jpa/debtAccount/${debt.debtAccount.code}` : "No URI",
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this debt?")) {
      return
    }

    try {
      await debtRepository.delete(id)
      onDebtDeleted()

      toast({
        title: "Success",
        description: "Debt deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting debt:", error)
      toast({
        title: "Error",
        description: "Failed to delete debt",
        variant: "destructive",
      })
    }
  }

  const handlePayOff = async (debtAccountCode: string) => {
    try {
      setPayingOff(debtAccountCode)

      const result = await debtManagementService.payOffDebts(debtAccountCode)

      toast({
        title: "Success",
        description: `Successfully paid off ${result.length} debts for account ${debtAccountCode}`,
      })

      onDebtDeleted() // Refresh the list
    } catch (error) {
      console.error("Error paying off debts:", error)
      toast({
        title: "Error",
        description: "Failed to pay off debts",
        variant: "destructive",
      })
    } finally {
      setPayingOff(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getInstallmentProgress = (current: number, max: number) => {
    const percentage = max > 0 ? (current / max) * 100 : 0
    return {
      percentage,
      isNearCompletion: percentage >= 80,
      isCompleted: current >= max,
    }
  }

  if (debts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No debts found. Create your first debt or upload a statement to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group debts by account
  const debtsByAccount = debts.reduce(
    (acc, debt) => {
      const accountInfo = getDebtAccountInfo(debt)
      const accountCode = accountInfo.code

      if (!acc[accountCode]) {
        acc[accountCode] = {
          accountInfo,
          debts: [],
        }
      }
      acc[accountCode].debts.push(debt)
      return acc
    },
    {} as Record<string, { accountInfo: any; debts: Debt[] }>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(debtsByAccount).map(([accountCode, { accountInfo, debts: accountDebts }]) => {
        const totalDebt = accountDebts.reduce((sum, debt) => sum + debt.originalAmount, 0)
        const totalMonthlyPayment = accountDebts.reduce((sum, debt) => sum + debt.monthlyPayment, 0)
        const activeDebts = accountDebts.filter((debt) => debt.active)

        return (
          <Card key={accountCode}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {accountInfo.name}
                  </CardTitle>
                  <CardDescription>
                    Account Code: {accountInfo.code} | URI: {accountInfo.uri}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Debt</div>
                    <div className="text-lg font-semibold">{formatCurrency(totalDebt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Monthly Payment</div>
                    <div className="text-lg font-semibold">{formatCurrency(totalMonthlyPayment)}</div>
                  </div>
                  {activeDebts.length > 0 && (
                    <Button
                      onClick={() => handlePayOff(accountCode)}
                      disabled={payingOff === accountCode}
                      variant="outline"
                    >
                      {payingOff === accountCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Paying Off...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Pay Off All
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountDebts.map((debt) => {
                    const progress = getInstallmentProgress(debt.currentInstallment, debt.maxFinancingTerm)

                    return (
                      <TableRow key={debt.id}>
                        <TableCell className="font-medium">{debt.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                            {formatDate(debt.operationDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                            {formatCurrency(debt.originalAmount)}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(debt.monthlyPayment)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {debt.currentInstallment} / {debt.maxFinancingTerm}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  progress.isCompleted
                                    ? "bg-green-500"
                                    : progress.isNearCompletion
                                      ? "bg-yellow-500"
                                      : "bg-blue-500"
                                }`}
                                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={debt.active ? "default" : "secondary"}>
                            {debt.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(debt.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
