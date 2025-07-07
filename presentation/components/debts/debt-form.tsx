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

interface DebtFormProps {
  debtAccounts: DebtAccount[]
  onSuccess: () => void
  onCancel: () => void
}

export function DebtForm({ debtAccounts, onSuccess, onCancel }: DebtFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    operationDate: "",
    currentInstallment: 1,
    maxFinancingTerm: 1,
    originalAmount: 0,
    monthlyPayment: 0,
    debtAccountCode: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await debtRepository.create({
        ...formData,
        active: true,
      } as Omit<Debt, "id" | "createdAt" | "updatedAt">)
      onSuccess()
    } catch (error) {
      console.error("Error creating debt:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, operationDate: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, originalAmount: Number.parseFloat(e.target.value) })}
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
            onChange={(e) => setFormData({ ...formData, monthlyPayment: Number.parseFloat(e.target.value) })}
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
            onChange={(e) => setFormData({ ...formData, currentInstallment: Number.parseInt(e.target.value) })}
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
            onChange={(e) => setFormData({ ...formData, maxFinancingTerm: Number.parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="debtAccount">Debt Account</Label>
        <Select
          value={formData.debtAccountCode}
          onValueChange={(value) => setFormData({ ...formData, debtAccountCode: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a debt account" />
          </SelectTrigger>
          <SelectContent>
            {debtAccounts.map((account) => (
              <SelectItem key={account.code} value={account.code}>
                {account.name} ({account.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Debt"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
