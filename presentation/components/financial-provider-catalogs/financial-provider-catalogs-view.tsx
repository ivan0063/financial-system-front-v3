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
import { FinancialProviderCatalogList } from "./financial-provider-catalog-list"
import { FinancialProviderCatalogForm } from "./financial-provider-catalog-form"
import type { FinancialProviderCatalog } from "@/domain/entities/financial-provider-catalog"

export function FinancialProviderCatalogsView() {
  const [selectedCatalog, setSelectedCatalog] = useState<FinancialProviderCatalog | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (catalog: FinancialProviderCatalog) => {
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
              <BreadcrumbPage>Financial Provider Catalogs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Financial Provider Catalogs</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <FinancialProviderCatalogList onEdit={handleEdit} onCreate={handleCreate} />
          </div>
          <div className="col-span-3">
            {isFormOpen && <FinancialProviderCatalogForm catalog={selectedCatalog} onClose={handleFormClose} />}
          </div>
        </div>
      </div>
    </div>
  )
}
