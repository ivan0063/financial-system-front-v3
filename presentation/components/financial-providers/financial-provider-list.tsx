"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Building2 } from "lucide-react"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import { useToast } from "@/hooks/use-toast"

interface FinancialProviderListProps {
  financialProviders: FinancialProvider[]
  onProviderDeleted: () => void
  onProviderEdit: (provider: FinancialProvider) => void
}

export function FinancialProviderList({
  financialProviders,
  onProviderDeleted,
  onProviderEdit,
}: FinancialProviderListProps) {
  const [deletingProvider, setDeletingProvider] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (provider: FinancialProvider) => {
    setDeletingProvider(provider.code)
    try {
      await financialProviderRepository.delete(provider.code)
      toast({
        title: "Success",
        description: "Financial provider deleted successfully",
      })
      onProviderDeleted()
    } catch (error) {
      console.error("Error deleting financial provider:", error)
      toast({
        title: "Error",
        description: "Failed to delete financial provider",
        variant: "destructive",
      })
    } finally {
      setDeletingProvider(null)
    }
  }

  if (financialProviders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
          <Building2 className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-center">No financial providers found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {financialProviders.map((provider) => (
        <Card key={provider.code} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {provider.code}
                  </Badge>
                  <Badge variant={provider.active ? "default" : "secondary"} className="text-xs">
                    {provider.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p className="truncate">
                  <span className="font-medium">Catalog:</span> {provider.financialProviderCatalog.name}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onProviderEdit(provider)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingProvider === provider.code}
                      className="flex-1 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deletingProvider === provider.code ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Financial Provider</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{provider.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(provider)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
