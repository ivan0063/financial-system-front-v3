"use client"

import { useState } from "react"
import { FinancialProviderList } from "./financial-provider-list"
import { FinancialProviderForm } from "./financial-provider-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

  return (
    <div className="space-y-6">
      <FinancialProviderList onAdd={handleAdd} onEdit={handleEdit} refreshTrigger={refreshTrigger} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Financial Provider" : "Create Financial Provider"}</DialogTitle>
          </DialogHeader>
          <FinancialProviderForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
