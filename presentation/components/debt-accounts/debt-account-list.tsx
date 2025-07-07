"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { Trash2, Eye } from "lucide-react"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"

interface DebtAccountListProps {
  debtAccounts: DebtAccount[]
  onAccountDeleted: () => void
}

export function DebtAccountList({ debtAccounts, onAccountDeleted }: DebtAccountListProps) {
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({})
  const [accountStatuses, setAccountStatuses] = useState<Record<string, string>>({})
  const [loadingPayOff, setLoadingPayOff] = useState<Record<string, boolean>>({})

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this debt account?")) {
      return
    }

    try {
      await debtAccountRepository.delete(code)
      onAccountDeleted()
    } catch (error) {
      console.error("Error deleting debt account:", error)
    }
  }

  const handleViewStatus = async (code: string) => {
    setLoadingStatus({ ...loadingStatus, [code]: true })
    try {
      const status = await debtAccountRepository.getStatus(code)
      setAccountStatuses({ ...accountStatuses, [code]: status })
    } catch (error) {
      console.error("Error getting account status:", error)
    } finally {
      setLoadingStatus({ ...loadingStatus, [code]: false })
    }
  }

  const handlePayOff = async (code: string) => {
    if (!confirm("Are you sure you want to pay off all debts for this account? This action cannot be undone.")) {
      return
    }

    setLoadingPayOff({ ...loadingPayOff, [code]: true })
    try {
      const result = await debtRepository.payOffDebts(code)
      console.log("Pay off result:", result)
      alert(`Successfully paid off debts: ${result}`)
      onAccountDeleted() // Refresh the data
    } catch (error) {
      console.error("Error paying off debts:", error)
      alert(`Failed to pay off debts: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoadingPayOff({ ...loadingPayOff, [code]: false })
    }
  }

  if (debtAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No debt accounts found. Create your first account to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {debtAccounts.map((account) => (
        <Card key={account.code}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{account.name}</CardTitle>
              <Badge variant="secondary">{account.code}</Badge>
            </div>
            <CardDescription>
              Pay day: {account.payDay} | Credit: ${account.credit.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Statement Type:</span>
                <Badge variant="outline">{account.accountStatementType}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Status:</span>
                <Badge variant={account.active ? "default" : "destructive"}>
                  {account.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {accountStatuses[account.code] && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Status:</strong> {accountStatuses[account.code]}
                </div>
              )}

              <div className="flex space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewStatus(account.code)}
                  disabled={loadingStatus[account.code]}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {loadingStatus[account.code] ? "Loading..." : "Status"}
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handlePayOff(account.code)}
                  disabled={loadingPayOff[account.code]}
                >
                  {loadingPayOff[account.code] ? "Paying..." : "Pay Off"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(account.code)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
