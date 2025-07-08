"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { CreditCard, Calendar, DollarSign, Trash2, Building2, MoreVertical, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface DebtAccountListProps {
  debtAccounts: DebtAccount[]
  onAccountDeleted: () => void
}

export function DebtAccountList({ debtAccounts, onAccountDeleted }: DebtAccountListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (account: DebtAccount) => {
    setDeletingId(account.code)
    try {
      await debtAccountRepository.delete(account.code)
      toast({
        title: "Success",
        description: `Debt account "${account.name}" has been deleted`,
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
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MANUAL: "Manual",
      MERCADO_PAGO: "Mercado Pago",
      RAPPI: "Rappi",
      UNIVERSAL: "Universal",
    }
    return labels[type] || type
  }

  if (debtAccounts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Your Debt Accounts</h3>
        <Badge variant="secondary" className="text-xs">
          {debtAccounts.length} account{debtAccounts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {debtAccounts.map((account) => (
          <Card key={account.code} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <CreditCard className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{account.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <span className="truncate">{account.code}</span>
                    </CardDescription>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </DropdownMenuItem>
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
                            disabled={deletingId === account.code}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === account.code ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>Credit Limit</span>
                  </div>
                  <div className="font-medium">{formatCurrency(account.credit)}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Pay Day</span>
                  </div>
                  <div className="font-medium">Day {account.payDay}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Building2 className="h-3 w-3" />
                  <span>Financial Provider</span>
                </div>
                <div className="text-sm font-medium truncate">{account.financialProvider?.name || "Not specified"}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {getStatementTypeLabel(account.accountStatementType)}
                </Badge>
                <Badge variant={account.active ? "default" : "secondary"} className="text-xs">
                  {account.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
