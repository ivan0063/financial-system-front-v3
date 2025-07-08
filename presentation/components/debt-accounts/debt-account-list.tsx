"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Edit, Trash2, CreditCard, Calendar, DollarSign } from "lucide-react"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import { useToast } from "@/hooks/use-toast"

interface DebtAccountListProps {
  debtAccounts: DebtAccount[]
  onAccountDeleted: () => void
  onAccountEdit?: (account: DebtAccount) => void
}

export function DebtAccountList({ debtAccounts, onAccountDeleted, onAccountEdit }: DebtAccountListProps) {
  const [deletingAccount, setDeletingAccount] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (account: DebtAccount) => {
    setDeletingAccount(account.code)
    try {
      await debtAccountRepository.delete(account.code)
      toast({
        title: "Success",
        description: "Debt account deleted successfully",
      })
      onAccountDeleted()
    } catch (error) {
      console.error("Error deleting debt account:", error)
      toast({
        title: "Error",
        description: "Failed to delete debt account",
        variant: "destructive",
      })
    } finally {
      setDeletingAccount(null)
    }
  }

  if (debtAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-center">No debt accounts found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {debtAccounts.map((account) => (
        <Card key={account.code} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{account.name}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {account.code}
                  </Badge>
                  <Badge variant={account.active ? "default" : "secondary"} className="text-xs">
                    {account.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {account.accountStatementType}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Credit Limit:
                  </span>
                  <span className="font-medium">${account.credit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Pay Day:
                  </span>
                  <span className="font-medium">{account.payDay}</span>
                </div>
                {account.financialProvider && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium text-xs truncate max-w-[120px]">{account.financialProvider.name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {onAccountEdit && (
                  <Button variant="outline" size="sm" onClick={() => onAccountEdit(account)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingAccount === account.code}
                      className="flex-1 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deletingAccount === account.code ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Debt Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{account.name}"? This action cannot be undone and will also
                        delete all associated debts.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(account)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
