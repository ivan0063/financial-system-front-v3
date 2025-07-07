"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"
import { fixedExpenseRepository } from "@/infrastructure/repositories/api-fixed-expense-repository"
import { fixedExpenseCatalogRepository } from "@/infrastructure/repositories/api-fixed-expense-catalog-repository"
import { useToast } from "@/hooks/use-toast"

interface FixedExpenseFormProps {
  expense?: FixedExpense | null
  onClose: () => void
}

export function FixedExpenseForm({ expense, onClose }: FixedExpenseFormProps) {
  const [name, setName] = useState("")
  const [monthlyCost, setMonthlyCost] = useState(0)
  const [paymentDay, setPaymentDay] = useState(1)
  const [catalogId, setCatalogId] = useState("")
  const [catalogs, setCatalogs] = useState<FixedExpenseCatalog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadCatalogs()
    if (expense) {
      setName(expense.name)
      setMonthlyCost(expense.monthlyCost)
      setPaymentDay(expense.paymentDay)
      setCatalogId(expense.fixedExpenseCatalog?.id?.toString() || "")
    } else {
      setName("")
      setMonthlyCost(0)
      setPaymentDay(1)
      setCatalogId("")
    }
  }, [expense])

  const loadCatalogs = async () => {
    try {
      const catalogData = await fixedExpenseCatalogRepository.findAll()
      setCatalogs(catalogData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load expense catalogs",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const expenseData = {
        name,
        monthlyCost,
        paymentDay,
        active: true,
        fixedExpenseCatalog: catalogId,
      }

      if (expense) {
        await fixedExpenseRepository.update({
          id: expense.id,
          ...expenseData,
        })
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
      toast({
        title: "Error",
        description: "Failed to save fixed expense",
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter expense name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyCost">Monthly Cost</Label>
            <Input
              id="monthlyCost"
              type="number"
              step="0.01"
              value={monthlyCost}
              onChange={(e) => setMonthlyCost(Number.parseFloat(e.target.value) || 0)}
              placeholder="Enter monthly cost"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDay">Payment Day</Label>
            <Input
              id="paymentDay"
              type="number"
              min="1"
              max="31"
              value={paymentDay}
              onChange={(e) => setPaymentDay(Number.parseInt(e.target.value) || 1)}
              placeholder="Enter payment day (1-31)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catalog">Category</Label>
            <Select value={catalogId} onValueChange={setCatalogId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {catalogs.map((catalog) => (
                  <SelectItem key={catalog.id} value={catalog.id.toString()}>
                    {catalog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : expense ? "Update" : "Create"}
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
