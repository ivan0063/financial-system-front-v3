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
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import { fixedExpenseCatalogRepository } from "@/infrastructure/repositories/api-fixed-expense-catalog-repository"
import { useToast } from "@/hooks/use-toast"

interface FixedExpenseFormProps {
  expense?: FixedExpense | null
  onClose: () => void
}

const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export function FixedExpenseForm({ expense, onClose }: FixedExpenseFormProps) {
  const [name, setName] = useState("")
  const [monthlyCost, setMonthlyCost] = useState("")
  const [paymentDay, setPaymentDay] = useState(1)
  const [catalogCode, setCatalogCode] = useState("")
  const [catalogs, setCatalogs] = useState<FixedExpenseCatalog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCatalogs()
    if (expense) {
      setName(expense.name)
      setMonthlyCost(expense.monthlyCost.toString())
      setPaymentDay(expense.paymentDay)
      setCatalogCode(expense.fixedExpenseCatalog?.code || "")
    } else {
      setName("")
      setMonthlyCost("")
      setPaymentDay(1)
      setCatalogCode("")
    }
  }, [expense])

  const loadCatalogs = async () => {
    try {
      setLoadingCatalogs(true)
      const catalogData = await fixedExpenseCatalogRepository.findAll()
      setCatalogs(catalogData.filter((catalog) => catalog.active))
      setError(null)
    } catch (error) {
      console.error("Error loading catalogs:", error)
      setError("Failed to load expense catalogs")
      toast({
        title: "Error",
        description: "Failed to load expense catalogs",
        variant: "destructive",
      })
    } finally {
      setLoadingCatalogs(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!catalogCode) {
      setError("Please select a category.")
      return
    }

    const monthlyAmount = Number.parseFloat(monthlyCost)
    if (isNaN(monthlyAmount) || monthlyAmount <= 0) {
      setError("Please enter a valid monthly cost.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const expenseData = {
        name: name.trim(),
        monthlyCost: monthlyAmount,
        paymentDay,
        active: true,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
        fixedExpenseCatalog: `/jpa/fixedExpenseCatalog/${catalogCode}`,
      }

      if (expense) {
        await fixedExpenseRepository.update(expense.id, expenseData)
        toast({
          title: "Success",
          description: "Fixed expense updated successfully",
        })
      } else {
        await fixedExpenseRepository.create(expenseData)
        toast({
          title: "Success",
          description: "Fixed expense created successfully",
        })
      }
      onClose()
    } catch (error) {
      console.error("Error saving fixed expense:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save fixed expense"
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
        <CardTitle>{expense ? "Edit" : "Create"} Fixed Expense</CardTitle>
        <CardDescription>{expense ? "Update the expense information" : "Add a new fixed expense"}</CardDescription>
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
              placeholder="Enter expense name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyCost">Monthly Cost *</Label>
            <Input
              id="monthlyCost"
              type="number"
              step="0.01"
              min="0"
              value={monthlyCost}
              onChange={(e) => setMonthlyCost(e.target.value)}
              placeholder="Enter monthly cost (e.g., 123.45)"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDay">Payment Day *</Label>
            <Input
              id="paymentDay"
              type="number"
              min="1"
              max="31"
              value={paymentDay}
              onChange={(e) => setPaymentDay(Number.parseInt(e.target.value) || 1)}
              placeholder="Enter payment day (1-31)"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catalog">Category *</Label>
            {loadingCatalogs ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading categories...</span>
              </div>
            ) : catalogs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No expense categories found. Please create a category first.</AlertDescription>
              </Alert>
            ) : (
              <Select value={catalogCode} onValueChange={setCatalogCode} required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {catalogs.map((catalog) => (
                    <SelectItem key={catalog.code} value={catalog.code}>
                      <div className="flex flex-col">
                        <span className="font-medium">{catalog.name}</span>
                        <span className="text-xs text-muted-foreground">Code: {catalog.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || loadingCatalogs || catalogs.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : expense ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
