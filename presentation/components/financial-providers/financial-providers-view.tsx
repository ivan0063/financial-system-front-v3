"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { FinancialProviderForm } from "./financial-provider-form"
import { FinancialProviderList } from "./financial-provider-list"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { Plus } from "lucide-react"

export function FinancialProvidersView() {
  const [financialProviders, setFinancialProviders] = useState<FinancialProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

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
    loadFinancialProviders()
  }

  const handleProviderDeleted = () => {
    loadFinancialProviders()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading financial providers...</div>
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
            <h2 className="text-3xl font-bold tracking-tight">Financial Providers</h2>
            <p className="text-muted-foreground">
              Manage banks, credit card companies, and other financial institutions
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Financial Provider</CardTitle>
              <CardDescription>Add a new bank or financial institution</CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialProviderForm onSuccess={handleProviderCreated} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <FinancialProviderList financialProviders={financialProviders} onProviderDeleted={handleProviderDeleted} />
      </div>
    </div>
  )
}
