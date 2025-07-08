"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Calendar, DollarSign, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { debtAccountRepository } from "../../../infrastructure/repositories/api-debt-account-repository"
import { debtManagementService } from "../../../application/services/debt-management-service"
import type { DebtAccount } from "../../../domain/entities/debt-account"

export function DebtAccountList() {
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [payingOff, setPayingOff] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchDebtAccounts()
  }, [])

  const fetchDebtAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      const accounts = await debtAccountRepository.findAll()
      setDebtAccounts(accounts)
    } catch (err) {
      console.error("Error fetching debt accounts:", err)
      setError("Failed to load debt accounts. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePayOff = async (debtAccountCode: string) => {
    try {
      setPayingOff(debtAccountCode)

      const paidOffDebts = await debtManagementService.payOffDebts(debtAccountCode)

      toast({
        title: "Debts Paid Off Successfully",
        description: `${paidOffDebts.length} debt(s) have been marked as paid off for account ${debtAccountCode}.`,
        variant: "default",
      })

      // Refresh the debt accounts list
      await fetchDebtAccounts()
    } catch (err) {
      console.error("Error paying off debts:", err)
      toast({
        title: "Payment Failed",
        description: "Failed to pay off debts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPayingOff(null)
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "MERCADO_PAGO":
        return "bg-blue-100 text-blue-800"
      case "RAPPI":
        return "bg-orange-100 text-orange-800"
      case "UNIVERSAL":
        return "bg-green-100 text-green-800"
      case "MANUAL":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <DebtAccountListSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDebtAccounts} className="mt-4 bg-transparent" variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Debt Accounts</h2>
          <p className="text-muted-foreground">Manage your debt accounts and payments</p>
        </div>
        <Button onClick={fetchDebtAccounts} variant="outline">
          Refresh
        </Button>
      </div>

      {debtAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Debt Accounts Found</h3>
            <p className="text-muted-foreground text-center">
              You don't have any debt accounts yet. Create one to start managing your debts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {debtAccounts.map((account) => (
            <Card key={account.code} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <Badge variant="secondary" className={getAccountTypeColor(account.accountStatementType)}>
                    {account.accountStatementType.replace("_", " ")}
                  </Badge>
                </div>
                <CardDescription>Account Code: {account.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Credit Limit</p>
                      <p className="font-semibold">${account.credit.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pay Day</p>
                      <p className="font-semibold">Day {account.payDay}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {account.active ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Inactive</span>
                      </>
                    )}
                  </div>

                  <Button
                    onClick={() => handlePayOff(account.code)}
                    disabled={payingOff === account.code || !account.active}
                    size="sm"
                    variant="outline"
                  >
                    {payingOff === account.code ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Paying Off...
                      </>
                    ) : (
                      "Pay Off Debts"
                    )}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Created: {new Date(account.createdAt).toLocaleDateString()}</p>
                  <p>Updated: {new Date(account.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function DebtAccountListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-28" />
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
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
