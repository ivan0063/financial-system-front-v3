"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"
import { fixedExpenseCatalogRepository } from "@/infrastructure/repositories/api-fixed-expense-catalog-repository"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus } from "lucide-react"

interface FixedExpenseCatalogListProps {
  onEdit: (catalog: FixedExpenseCatalog) => void
  onCreate: () => void
}

export function FixedExpenseCatalogList({ onEdit, onCreate }: FixedExpenseCatalogListProps) {
  const [catalogs, setCatalogs] = useState<FixedExpenseCatalog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadCatalogs = async () => {
    try {
      const data = await fixedExpenseCatalogRepository.findAll()
      setCatalogs(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load fixed expense catalogs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogs()
  }, [])

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this catalog?")) {
      try {
        await fixedExpenseCatalogRepository.delete(id)
        toast({
          title: "Success",
          description: "Fixed expense catalog deleted successfully",
        })
        loadCatalogs()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete fixed expense catalog",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fixed Expense Catalogs</CardTitle>
            <CardDescription>Manage your fixed expense categories</CardDescription>
          </div>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Catalog
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogs.map((catalog) => (
              <TableRow key={catalog.id}>
                <TableCell>{catalog.id}</TableCell>
                <TableCell>{catalog.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => onEdit(catalog)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(catalog.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
