"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { FixedExpenseCatalogList } from "./fixed-expense-catalog-list"
import { FixedExpenseCatalogForm } from "./fixed-expense-catalog-form"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"

export function FixedExpenseCatalogsView() {
  const [selectedCatalog, setSelectedCatalog] = useState<FixedExpenseCatalog | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (catalog: FixedExpenseCatalog) => {
    setSelectedCatalog(catalog)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedCatalog(null)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedCatalog(null)
  }

  const handleFormSuccess = () => {
    // Trigger refresh of the list component
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Fixed Expense Catalogs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Fixed Expense Catalogs</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <FixedExpenseCatalogList onEdit={handleEdit} onCreate={handleCreate} refreshTrigger={refreshTrigger} />
          </div>
          <div className="col-span-3">
            {isFormOpen && (
              <FixedExpenseCatalogForm
                catalog={selectedCatalog}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
