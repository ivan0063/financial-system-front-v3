"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CreditCard, Calendar, DollarSign, Trash2, CheckCircle } from "lucide-react"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { DebtManagementService } from "@/application/services/debt-management-service"
import { useToast } from "@/hooks/use-toast"

interface DebtAccountListProps {
  debtAccounts: DebtAccount[]
  onDelete: (code: string) => void
  onRefresh: () => void
}

export function DebtAccountList({ debtAccounts, onDelete, onRefresh }: DebtAccountListProps) {
  const [payingOff, setPayingOff] = useState<string | null>(null)
  const { toast } = useToast()
  const debtManagementService = new DebtManagementService()

  const handlePayOff = async (debtAccountCode: string, accountName: string) => {
    setPayingOff(debtAccountCode)

    try {
      await debtManagementService.payOffDebts(debtAccountCode)

      toast({
        title: "Success",
        description: `All debts for ${accountName} have been paid off successfully.`,
        variant: "default",
      })

      // Refresh the data
      onRefresh()
    } catch (error) {
      console.error("Error paying off debts:", error)
      toast({
        title: "Error",
        description: `Failed to pay off debts for ${accountName}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setPayingOff(null)
    }
  }

  if (debtAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-medium">No debt accounts found</p>
            <p className="text-muted-foreground">Create your first debt account to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {debtAccounts.map((account) => (
        <Card key={account.code} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{account.name}</CardTitle>
                <CardDescription>Code: {account.code}</CardDescription>
              </div>
              <Badge variant="outline">{account.financialProvider?.name || "No Provider"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Pay Day
                </p>
                <p className="font-medium">{account.payDay}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Credit Limit
                </p>
                <p className="font-medium">${account.credit.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Statement Type</p>
              <Badge variant="secondary">{account.accountStatementType}</Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(account.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    disabled={payingOff === account.code}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {payingOff === account.code ? "Paying Off..." : "Pay Off"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pay Off All Debts</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to pay off all debts for "{account.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handlePayOff(account.code, account.name)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Pay Off Debts
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Debt Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{account.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(account.code)} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
