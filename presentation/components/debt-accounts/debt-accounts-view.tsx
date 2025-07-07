"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { DebtAccountForm } from "./debt-account-form"
import { DebtAccountList } from "./debt-account-list"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { Plus } from "lucide-react"

export function DebtAccountsView() {
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Remove: const debtAccountRepository = new ApiDebtAccountRepository()
  // It's now imported as an instance

  useEffect(() => {
    loadDebtAccounts()
  }, [])

  const loadDebtAccounts = async () => {
    try {
      const accounts = await debtAccountRepository.findAll()
      setDebtAccounts(accounts)
    } catch (error) {
      console.error("Error loading debt accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccountCreated = () => {
    setShowForm(false)
    loadDebtAccounts()
  }

  const handleAccountDeleted = () => {
    loadDebtAccounts()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading debt accounts...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Debt Accounts</h2>
            <p className="text-muted-foreground">Manage your credit cards and debt accounts</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Debt Account</CardTitle>
              <CardDescription>Add a new credit card or debt account to track</CardDescription>
            </CardHeader>
            <CardContent>
              <DebtAccountForm onSuccess={handleAccountCreated} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <DebtAccountList debtAccounts={debtAccounts} onAccountDeleted={handleAccountDeleted} />
      </div>
    </div>
  )
}
