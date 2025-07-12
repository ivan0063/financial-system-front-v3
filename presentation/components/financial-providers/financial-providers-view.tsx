"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { FinancialProviderForm } from "./financial-provider-form"
import { FinancialProviderList } from "./financial-provider-list"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { Plus, Loader2 } from "lucide-react"

export function FinancialProvidersView() {
  const [financialProviders, setFinancialProviders] = useState<FinancialProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<FinancialProvider | null>(null)

  useEffect(() => {
    loadFinancialProviders()
  }, [])

  const loadFinancialProviders = async () => {
    try {
      const providers = await financialProviderRepository.findAll()
      setFinancialProviders(providers)
    } catch (error) {
      console.error("Error loading financial providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderCreated = () => {
    setShowForm(false)
    setEditingProvider(null)
    loadFinancialProviders()
  }

  const handleProviderDeleted = () => {
    loadFinancialProviders()
  }

  const handleProviderEdit = (provider: FinancialProvider) => {
    setEditingProvider(provider)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProvider(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading financial providers...
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Providers</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your financial institutions and providers
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>

        {financialProviders.length === 0 && !showForm && (
          <Card className="mb-6 sm:mb-8">
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-3 text-center">
              <p className="text-muted-foreground">
                No financial providers found. Create your first financial provider to get started.
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create First Provider
              </Button>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                {editingProvider ? "Edit Financial Provider" : "Create New Financial Provider"}
              </CardTitle>
              <CardDescription>
                {editingProvider
                  ? "Update the financial provider information"
                  : "Add a new financial provider to your system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialProviderForm
                provider={editingProvider}
                onSuccess={handleProviderCreated}
                onCancel={handleCancelForm}
              />
            </CardContent>
          </Card>
        )}

        <FinancialProviderList
          financialProviders={financialProviders}
          onProviderDeleted={handleProviderDeleted}
          onProviderEdit={handleProviderEdit}
        />
      </div>
    </div>
  )
}
