"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Header } from "../layout/header"
import { DebtList } from "./debt-list"
import { DebtForm } from "./debt-form"
import { StatementUploadModal } from "./statement-upload-modal"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { Debt } from "@/domain/entities/debt"
import { Plus, Upload, Loader2 } from "lucide-react"

export function DebtsView() {
  const [showForm, setShowForm] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  useEffect(() => {
    loadDebtAccounts()
  }, [])

  const loadDebtAccounts = async () => {
    try {
      setLoadingAccounts(true)
      const accounts = await debtAccountRepository.findAll()
      setDebtAccounts(accounts.filter((account) => account.active))
    } catch (error) {
      console.error("Error loading debt accounts:", error)
      setDebtAccounts([])
    } finally {
      setLoadingAccounts(false)
    }
  }

  const handleAdd = () => {
    setEditingDebt(null)
    setShowForm(true)
  }

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingDebt(null)
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingDebt(null)
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
  }

  if (loadingAccounts) {
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Debts</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your debt obligations and payments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setShowUploadModal(true)} variant="outline" className="flex-1 sm:flex-none">
              <Upload className="h-4 w-4 mr-2" />
              Upload Statement
            </Button>
            <Button
              onClick={handleAdd}
              className="flex-1 sm:flex-none"
              disabled={!debtAccounts || debtAccounts.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </div>
        </div>

        {(!debtAccounts || debtAccounts.length === 0) && (
          <Card className="mb-6 sm:mb-8">
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-3 text-center">
              <p className="text-muted-foreground">
                No debt accounts found. You need to create a debt account before adding debts.
              </p>
              <Button variant="outline" size="sm" onClick={() => (window.location.href = "/debt-accounts")}>
                Create Debt Account
              </Button>
            </CardContent>
          </Card>
        )}

        <DebtList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="mx-4 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDebt ? "Edit Debt" : "Create Debt"}</DialogTitle>
            </DialogHeader>
            <DebtForm
              debt={editingDebt}
              debtAccounts={debtAccounts}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>

        <StatementUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          debtAccounts={debtAccounts}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  )
}
