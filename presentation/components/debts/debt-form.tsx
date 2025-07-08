"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import type { Debt } from "@/domain/entities/debt"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface DebtFormProps {
  debt?: Debt | null
  debtAccounts: DebtAccount[]
  onSuccess: () => void
  onCancel: () => void
}

const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export function DebtForm({ debt, debtAccounts, onSuccess, onCancel }: DebtFormProps) {
  const [formData, setFormData] = useState({
    description: debt?.description || "",
    operationDate: debt?.operationDate || "",
    currentInstallment: debt?.currentInstallment || 1,
    maxFinancingTerm: debt?.maxFinancingTerm || 1,
    originalAmount: debt?.originalAmount?.toString() || "",
    monthlyPayment: debt?.monthlyPayment?.toString() || "",
    debtAccountCode: debt?.debtAccount?.code || "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const originalAmount = Number.parseFloat(formData.originalAmount)
    const monthlyPayment = Number.parseFloat(formData.monthlyPayment)

    if (isNaN(originalAmount) || originalAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid original amount",
        variant: "destructive",
      })
      return
    }

    if (isNaN(monthlyPayment) || monthlyPayment <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid monthly payment",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const debtData = {
        description: formData.description,
        operationDate: formData.operationDate,
        currentInstallment: formData.currentInstallment,
        maxFinancingTerm: formData.maxFinancingTerm,
        originalAmount: originalAmount,
        monthlyPayment: monthlyPayment,
        active: true,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
        debtAccount: `/jpa/debtAccount/${formData.debtAccountCode}`,
      }

      if (debt) {
        await debtRepository.update(debt.id, debtData)
        toast({
          title: "Success",
          description: "Debt updated successfully",
        })
      } else {
        await debtRepository.create(debtData)
        toast({
          title: "Success",
          description: "Debt created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving debt:", error)
      toast({
        title: "Error",
        description: `Failed to ${debt ? "update" : "create"} debt`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Ensure debtAccounts is an array
  const safeDebtAccounts = Array.isArray(debtAccounts) ? debtAccounts : []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="e.g., Purchase at Store"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operationDate">Operation Date</Label>
          <Input
            id="operationDate"
            type="date"
            value={formData.operationDate}
            onChange={(e) => handleInputChange("operationDate", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="originalAmount">Original Amount</Label>
          <Input
            id="originalAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.originalAmount}
            onChange={(e) => handleInputChange("originalAmount", e.target.value)}
            placeholder="e.g., 1000.50"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyPayment">Monthly Payment</Label>
          <Input
            id="monthlyPayment"
            type="number"
            step="0.01"
            min="0"
            value={formData.monthlyPayment}
            onChange={(e) => handleInputChange("monthlyPayment", e.target.value)}
            placeholder="e.g., 100.25"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentInstallment">Current Installment</Label>
          <Input
            id="currentInstallment"
            type="number"
            min="1"
            value={formData.currentInstallment}
            onChange={(e) => handleInputChange("currentInstallment", Number.parseInt(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxFinancingTerm">Max Financing Term</Label>
          <Input
            id="maxFinancingTerm"
            type="number"
            min="1"
            value={formData.maxFinancingTerm}
            onChange={(e) => handleInputChange("maxFinancingTerm", Number.parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="debtAccount">Debt Account</Label>
        <Select
          value={formData.debtAccountCode}
          onValueChange={(value) => handleInputChange("debtAccountCode", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a debt account" />
          </SelectTrigger>
          <SelectContent>
            {safeDebtAccounts.map((account) => (
              <SelectItem key={account.code} value={account.code}>
                {account.name} ({account.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {debt ? "Updating..." : "Creating..."}
            </>
          ) : debt ? (
            "Update Debt"
          ) : (
            "Create Debt"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
