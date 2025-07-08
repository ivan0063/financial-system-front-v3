"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"
import { fixedExpenseCatalogRepository } from "@/infrastructure/repositories/api-fixed-expense-catalog-repository"
import { useToast } from "@/hooks/use-toast"

interface FixedExpenseCatalogListProps {
  onEdit: (catalog: FixedExpenseCatalog) => void
  onCreate: () => void
  refreshTrigger?: number
}

export function FixedExpenseCatalogList({ onEdit, onCreate, refreshTrigger }: FixedExpenseCatalogListProps) {
  const [catalogs, setCatalogs] = useState<FixedExpenseCatalog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCatalogs()
  }, [refreshTrigger])

  const loadCatalogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const catalogData = await fixedExpenseCatalogRepository.findAll()
      setCatalogs(catalogData)
    } catch (error) {
      console.error("Error loading catalogs:", error)
      setError("Failed to load fixed expense catalogs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (catalog: FixedExpenseCatalog) => {
    if (!confirm(`Are you sure you want to delete "${catalog.name}"?`)) {
      return
    }

    setDeletingId(catalog.code)
    try {
      await fixedExpenseCatalogRepository.delete(catalog.code)
      toast({
        title: "Success",
        description: "Fixed expense catalog deleted successfully",
      })
      await loadCatalogs() // Refresh the list
    } catch (error) {
      console.error("Error deleting catalog:", error)
      toast({
        title: "Error",
        description: "Failed to delete fixed expense catalog",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading catalogs...</span>
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
          <Button onClick={loadCatalogs} variant="outline" className="mt-4 bg-transparent">
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
            <CardTitle>Fixed Expense Catalogs</CardTitle>
            <CardDescription>Manage your expense categories</CardDescription>
          </div>
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Catalog
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {catalogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No fixed expense catalogs found</p>
            <Button onClick={onCreate} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Catalog
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {catalogs.map((catalog) => (
              <div
                key={catalog.code}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{catalog.name}</h4>
                    <Badge variant={catalog.active ? "default" : "secondary"}>
                      {catalog.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Code: {catalog.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(catalog)}
                    disabled={deletingId === catalog.code}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(catalog)}
                    disabled={deletingId === catalog.code}
                  >
                    {deletingId === catalog.code ? (
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
