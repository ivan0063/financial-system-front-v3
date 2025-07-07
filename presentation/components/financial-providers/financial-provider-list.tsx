"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { Trash2, Building2 } from "lucide-react"

interface FinancialProviderListProps {
  financialProviders: FinancialProvider[]
  onProviderDeleted: () => void
}

export function FinancialProviderList({ financialProviders, onProviderDeleted }: FinancialProviderListProps) {
  // Remove: const financialProviderRepository = new ApiFinancialProviderRepository()
  // It's now imported as an instance

  const handleDelete = async (code: string) => {
    if (!confirm("Are you sure you want to delete this financial provider?")) {
      return
    }

    try {
      await financialProviderRepository.delete(code)
      onProviderDeleted()
    } catch (error) {
      console.error("Error deleting financial provider:", error)
    }
  }

  if (financialProviders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">
            No financial providers found. Create your first provider to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {financialProviders.map((provider) => (
        <Card key={provider.code}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Building2 className="h-5 w-5 mr-2" />
                {provider.name}
              </CardTitle>
              <Badge variant="secondary">{provider.code}</Badge>
            </div>
            <CardDescription>Created: {new Date(provider.createdAt).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant={provider.active ? "default" : "destructive"}>
                  {provider.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex justify-end mt-4">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(provider.code)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
