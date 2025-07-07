"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"

interface FinancialProviderFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function FinancialProviderForm({ onSuccess, onCancel }: FinancialProviderFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  })
  const [loading, setLoading] = useState(false)

  // Remove: const financialProviderRepository = new ApiFinancialProviderRepository()
  // It's now imported as an instance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await financialProviderRepository.create({
        ...formData,
        active: true,
      } as Omit<FinancialProvider, "createdAt" | "updatedAt">)
      onSuccess()
    } catch (error) {
      console.error("Error creating financial provider:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Provider Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., BANK001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Provider Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Chase Bank"
            required
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Provider"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
