"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"
import { fixedExpenseCatalogRepository } from "@/infrastructure/repositories/api-fixed-expense-catalog-repository"
import { useToast } from "@/hooks/use-toast"

interface FixedExpenseCatalogFormProps {
  catalog?: FixedExpenseCatalog | null
  onClose: () => void
}

export function FixedExpenseCatalogForm({ catalog, onClose }: FixedExpenseCatalogFormProps) {
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
        await fixedExpenseCatalogRepository.update({
          id: catalog.id,
          name,
        })
        toast({
          title: "Success",
          description: "Fixed expense catalog updated successfully",
        })
      } else {
        await fixedExpenseCatalogRepository.create({
          name,
        })
        toast({
          title: "Success",
          description: "Fixed expense catalog created successfully",
        })
      }
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save fixed expense catalog",
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
        <CardDescription>
          {catalog ? "Update the catalog information" : "Add a new fixed expense catalog"}
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
