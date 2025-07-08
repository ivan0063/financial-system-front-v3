"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Header } from "../layout/header"
import { FixedExpenseCatalogList } from "./fixed-expense-catalog-list"
import { FixedExpenseCatalogForm } from "./fixed-expense-catalog-form"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"

export function FixedExpenseCatalogsView() {
  const [showForm, setShowForm] = useState(false)
  const [editingCatalog, setEditingCatalog] = useState<FixedExpenseCatalog | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreate = () => {
    setEditingCatalog(null)
    setShowForm(true)
  }

  const handleEdit = (catalog: FixedExpenseCatalog) => {
    setEditingCatalog(catalog)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingCatalog(null)
    setRefreshTrigger((prev) => prev + 1) // Trigger refresh
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCatalog(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Fixed Expense Catalogs</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Manage categories for your fixed expenses</p>
          </div>
        </div>

        <FixedExpenseCatalogList onEdit={handleEdit} onCreate={handleCreate} refreshTrigger={refreshTrigger} />

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="mx-4 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCatalog ? "Edit Fixed Expense Catalog" : "Create Fixed Expense Catalog"}
              </DialogTitle>
            </DialogHeader>
            <FixedExpenseCatalogForm catalog={editingCatalog} onSuccess={handleSuccess} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
