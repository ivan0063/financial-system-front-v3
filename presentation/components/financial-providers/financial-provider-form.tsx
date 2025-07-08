"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import { financialProviderCatalogRepository } from "@/infrastructure/repositories/api-financial-provider-catalog-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import type { FinancialProviderCatalog } from "@/domain/entities/financial-provider-catalog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface FinancialProviderFormProps {
  provider?: FinancialProvider | null
  onSuccess: () => void
  onCancel: () => void
}

export function FinancialProviderForm({ provider, onSuccess, onCancel }: FinancialProviderFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    financialProviderCatalogId: "",
    active: true,
  })
  const [catalogs, setCatalogs] = useState<FinancialProviderCatalog[]>([])
  const [loading, setLoading] = useState(false)
  const [catalogsLoading, setCatalogsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCatalogs()
  }, [])

  useEffect(() => {
    if (provider) {
      setFormData({
        code: provider.code,
        name: provider.name,
        financialProviderCatalogId: provider.financialProviderCatalog.code,
        active: provider.active,
      })
    }
  }, [provider])

  const loadCatalogs = async () => {
    try {
      const catalogList = await financialProviderCatalogRepository.findAll()
      setCatalogs(catalogList)
    } catch (error) {
      console.error("Error loading financial provider catalogs:", error)
      toast({
        title: "Error",
        description: "Failed to load financial provider catalogs",
        variant: "destructive",
      })
    } finally {
      setCatalogsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const providerData = {
        code: formData.code,
        name: formData.name,
        financialProviderCatalog: `/jpa/financialProviderCatalog/${formData.financialProviderCatalogId}`,
        active: formData.active,
      }

      if (provider) {
        await financialProviderRepository.update(provider.code, providerData)
        toast({
          title: "Success",
          description: "Financial provider updated successfully",
        })
      } else {
        await financialProviderRepository.create(providerData)
        toast({
          title: "Success",
          description: "Financial provider created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving financial provider:", error)
      toast({
        title: "Error",
        description: `Failed to ${provider ? "update" : "create"} financial provider`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (catalogsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading form...
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange("code", e.target.value)}
            placeholder="Enter provider code"
            required
            disabled={!!provider} // Disable code editing when updating
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter provider name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog">Financial Provider Catalog</Label>
        <Select
          value={formData.financialProviderCatalogId}
          onValueChange={(value) => handleInputChange("financialProviderCatalogId", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a financial provider catalog" />
          </SelectTrigger>
          <SelectContent>
            {catalogs.map((catalog) => (
              <SelectItem key={catalog.code} value={catalog.code}>
                {catalog.name} ({catalog.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => handleInputChange("active", checked)}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {provider ? "Update Provider" : "Create Provider"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}
