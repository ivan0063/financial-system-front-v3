"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"
import { fixedExpenseCatalogRepository } from "@/infrastructure/repositories/api-fixed-expense-catalog-repository"
import { useToast } from "@/hooks/use-toast"

interface FixedExpenseCatalogFormProps {
  catalog?: FixedExpenseCatalog | null
  onSuccess: () => void
  onCancel: () => void
}

export function FixedExpenseCatalogForm({ catalog, onSuccess, onCancel }: FixedExpenseCatalogFormProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

    if (!name.trim()) {
      setError("Please enter a catalog name.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (catalog) {
        await fixedExpenseCatalogRepository.update(catalog.id, { name: name.trim() })
        toast({
          title: "Success",
          description: "Fixed expense catalog updated successfully",
        })
      } else {
        await fixedExpenseCatalogRepository.create({ name: name.trim() })
        toast({
          title: "Success",
          description: "Fixed expense catalog created successfully",
        })
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving fixed expense catalog:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save fixed expense catalog"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{catalog ? "Edit" : "Create"} Fixed Expense Catalog</CardTitle>
        <CardDescription>{catalog ? "Update the catalog information" : "Add a new expense category"}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter catalog name (e.g., Utilities, Entertainment)"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : catalog ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
