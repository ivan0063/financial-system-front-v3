"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { DebtAccountForm } from "./debt-account-form"
import { DebtAccountList } from "./debt-account-list"
import { StatementUploadModal } from "../debts/statement-upload-modal"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { Plus, Upload, Loader2 } from "lucide-react"

export function DebtAccountsView() {
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

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

  const handleStatementUploaded = () => {
    loadDebtAccounts()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading debt accounts...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Debt Accounts</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your debt accounts and credit cards</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(true)}
              disabled={debtAccounts.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Statement
            </Button>
            <Button onClick={() => setShowForm(true)} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {debtAccounts.length === 0 && !showForm && (
          <Card className="mb-6 sm:mb-8">
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-3 text-center">
              <p className="text-muted-foreground">
                No debt accounts found. Create your first debt account to get started.
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create First Account
              </Button>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Create New Debt Account</CardTitle>
              <CardDescription>Add a new debt account to track your debts</CardDescription>
            </CardHeader>
            <CardContent>
              <DebtAccountForm onSuccess={handleAccountCreated} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <DebtAccountList debtAccounts={debtAccounts} onAccountDeleted={handleAccountDeleted} />

        <StatementUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          debtAccounts={debtAccounts}
          onSuccess={handleStatementUploaded}
        />
      </div>
    </div>
  )
}
