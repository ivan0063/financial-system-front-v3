"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import { useToast } from "@/hooks/use-toast"

interface FinancialProviderListProps {
  onAdd: () => void
  onEdit: (provider: FinancialProvider) => void
  refreshTrigger?: number
}

export function FinancialProviderList({ onAdd, onEdit, refreshTrigger }: FinancialProviderListProps) {
  const [providers, setProviders] = useState<FinancialProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProviders()
  }, [refreshTrigger])

  const loadProviders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const providerData = await financialProviderRepository.findAll()
      setProviders(providerData)
    } catch (error) {
      console.error("Error loading providers:", error)
      setError("Failed to load financial providers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (provider: FinancialProvider) => {
    if (!confirm(`Are you sure you want to delete "${provider.name}"?`)) {
      return
    }

    setDeletingCode(provider.code)
    try {
      await financialProviderRepository.delete(provider.code)
      toast({
        title: "Success",
        description: "Financial provider deleted successfully",
      })
      await loadProviders() // Refresh the list
    } catch (error) {
      console.error("Error deleting provider:", error)
      toast({
        title: "Error",
        description: "Failed to delete financial provider",
        variant: "destructive",
      })
    } finally {
      setDeletingCode(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading providers...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadProviders} variant="outline" className="mt-4 bg-transparent">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Financial Providers</CardTitle>
            <CardDescription>Manage your financial institutions</CardDescription>
          </div>
          <Button onClick={onAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {providers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No financial providers found</p>
            <Button onClick={onAdd} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Provider
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.code}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{provider.name}</h4>
                    <Badge variant={provider.active ? "default" : "secondary"}>
                      {provider.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Code: {provider.code}</p>
                    {provider.financialProviderCatalog && <p>Category: {provider.financialProviderCatalog.name}</p>}
                    {!provider.financialProviderCatalog && <p className="text-orange-600">No category assigned</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(provider)}
                    disabled={deletingCode === provider.code}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(provider)}
                    disabled={deletingCode === provider.code}
                  >
                    {deletingCode === provider.code ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
