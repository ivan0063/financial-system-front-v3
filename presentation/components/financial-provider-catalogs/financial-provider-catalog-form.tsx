"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinancialProviderCatalog } from "@/domain/entities/financial-provider-catalog"
import { financialProviderCatalogRepository } from "@/infrastructure/repositories/api-financial-provider-catalog-repository"
import { useToast } from "@/hooks/use-toast"

interface FinancialProviderCatalogFormProps {
  catalog?: FinancialProviderCatalog | null
  onClose: () => void
}

export function FinancialProviderCatalogForm({ catalog, onClose }: FinancialProviderCatalogFormProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (catalog) {
      setName(catalog.name)
    } else {
      setName("")
    }
  }, [catalog])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (catalog) {
        await financialProviderCatalogRepository.update({
          id: catalog.id,
          name,
        })
        toast({
          title: "Success",
          description: "Financial provider catalog updated successfully",
        })
      } else {
        await financialProviderCatalogRepository.create({
          name,
        })
        toast({
          title: "Success",
          description: "Financial provider catalog created successfully",
        })
      }
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save financial provider catalog",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{catalog ? "Edit" : "Create"} Financial Provider Catalog</CardTitle>
        <CardDescription>
          {catalog ? "Update the catalog information" : "Add a new financial provider catalog"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter catalog name"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : catalog ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
