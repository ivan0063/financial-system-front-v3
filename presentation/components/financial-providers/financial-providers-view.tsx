"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Header } from "../layout/header"
import { FinancialProviderList } from "./financial-provider-list"
import { FinancialProviderForm } from "./financial-provider-form"
import type { FinancialProvider } from "@/domain/entities/financial-provider"

export function FinancialProvidersView() {
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<FinancialProvider | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingProvider(null)
    setShowForm(true)
  }

  const handleEdit = (provider: FinancialProvider) => {
    setEditingProvider(provider)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingProvider(null)
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProvider(null)
  }

  const handleProviderDeleted = () => {
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Providers</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your financial institutions and service providers
            </p>
          </div>
        </div>

        <FinancialProviderList onAdd={handleAdd} onEdit={handleEdit} refreshTrigger={refreshTrigger} />

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="mx-4 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProvider ? "Edit Financial Provider" : "Create Financial Provider"}</DialogTitle>
            </DialogHeader>
            <FinancialProviderForm provider={editingProvider} onSuccess={handleSuccess} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
