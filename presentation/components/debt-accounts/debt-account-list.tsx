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
import { useToast } from "@/hooks/use-toast"
import { Trash2, CreditCard, Calendar, Percent, DollarSign, CheckCircle, Loader2 } from "lucide-react"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { DebtManagementService } from "@/application/services/debt-management-service"

interface DebtAccountListProps {
  debtAccounts: DebtAccount[]
  onDelete: (code: string) => void
  onRefresh: () => void
}

export function DebtAccountList({ debtAccounts, onDelete, onRefresh }: DebtAccountListProps) {
  const [deletingAccount, setDeletingAccount] = useState<string | null>(null)
  const [payingOffAccount, setPayingOffAccount] = useState<string | null>(null)
  const { toast } = useToast()
  const debtManagementService = new DebtManagementService()

  const handleDelete = async (code: string) => {
    setDeletingAccount(code)
    try {
      await onDelete(code)
      toast({
        title: "Success",
        description: "Debt account deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete debt account",
        variant: "destructive",
      })
    } finally {
      setDeletingAccount(null)
    }
  }

  const handlePayOff = async (debtAccountCode: string, accountName: string) => {
    setPayingOffAccount(debtAccountCode)
    try {
      await debtManagementService.payOffDebt(debtAccountCode)
      toast({
        title: "Success",
        description: `Debt account "${accountName}" has been paid off successfully!`,
      })
      onRefresh() // Refresh the data to show updated status
    } catch (error) {
      console.error("Error paying off debt:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pay off debt account",
        variant: "destructive",
      })
    } finally {
      setPayingOffAccount(null)
    }
  }

  if (debtAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No debt accounts found</h3>
          <p className="text-muted-foreground text-center">
            Create your first debt account to start managing your debts.
          </p>
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
              <Badge variant={account.status === "Active" ? "default" : "secondary"}>{account.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Credit Limit</span>
                </div>
                <p className="text-lg font-semibold">${account.credit.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Pay Day</span>
                </div>
                <p className="text-lg font-semibold">{account.payDay}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Interest Rate</span>
              </div>
              <p className="text-lg font-semibold">{account.interestRate}%</p>
            </div>

            <div className="flex gap-2 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    disabled={payingOffAccount === account.code || account.status !== "Active"}
                  >
                    {payingOffAccount === account.code ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Paying Off...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Pay Off
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pay Off Debt Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to pay off the debt account "{account.name}"? This action will mark all
                      associated debts as paid and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handlePayOff(account.code, account.name)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Pay Off Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deletingAccount === account.code}>
                    {deletingAccount === account.code ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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
                    <AlertDialogAction
                      onClick={() => handleDelete(account.code)}
                      className="bg-red-600 hover:bg-red-700"
                    >
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
