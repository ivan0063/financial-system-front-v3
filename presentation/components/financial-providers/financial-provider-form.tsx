"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import { financialProviderCatalogRepository } from "@/infrastructure/repositories/api-financial-provider-catalog-repository"
import type { FinancialProviderCatalog } from "@/domain/entities/financial-provider-catalog"

interface FinancialProviderFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function FinancialProviderForm({ onSuccess, onCancel }: FinancialProviderFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    catalogId: "",
  })
  const [catalogs, setCatalogs] = useState<FinancialProviderCatalog[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load financial provider catalogs on component mount
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setLoadingCatalogs(true)
        const catalogsData = await financialProviderCatalogRepository.findAll()
        setCatalogs(catalogsData)
        setError(null)
      } catch (error) {
        console.error("Error loading financial provider catalogs:", error)
        setError("Failed to load financial provider catalogs. Please try again.")
      } finally {
        setLoadingCatalogs(false)
      }
    }

    loadCatalogs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.catalogId) {
      setError("Please select a financial provider catalog.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create the provider with URI-based relationship for Spring Data REST
      await financialProviderRepository.create({
        code: formData.code,
        name: formData.name,
        active: true,
        financialProviderCatalog: `/jpa/financialProviderCatalog/${formData.catalogId}`, // URI format
      })
      onSuccess()
    } catch (error) {
      console.error("Error creating financial provider:", error)
      setError(error instanceof Error ? error.message : "Failed to create financial provider. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Financial Provider</CardTitle>
        <CardDescription>
          Add a new financial provider to the system. Select the appropriate catalog and provide the provider details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Financial Provider Catalog Selection */}
          <div className="space-y-2">
            <Label htmlFor="catalog">Financial Provider Catalog *</Label>
            {loadingCatalogs ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading catalogs...</span>
              </div>
            ) : catalogs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No financial provider catalogs found. Please create a catalog first.
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={formData.catalogId}
                onValueChange={(value) => handleInputChange("catalogId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a financial provider catalog" />
                </SelectTrigger>
                <SelectContent>
                  {catalogs.map((catalog) => (
                    <SelectItem key={catalog.id} value={catalog.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{catalog.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {catalog.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Provider Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Provider Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              placeholder="e.g., BANK001, CREDIT001"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Unique identifier for the financial provider</p>
          </div>

          {/* Provider Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Provider Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Chase Bank, American Express"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Display name for the financial provider</p>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading || loadingCatalogs || catalogs.length === 0} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Provider"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Need Help?</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Financial Provider Catalog: Groups related financial providers together</li>
            <li>• Provider Code: Should be unique and descriptive (e.g., CHASE_BANK)</li>
            <li>• Provider Name: User-friendly name that will be displayed in the interface</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
