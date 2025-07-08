"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { Save, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DebtAccountFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function DebtAccountForm({ onSuccess, onCancel }: DebtAccountFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    payDay: 1,
    credit: 0,
    accountStatementType: "MANUAL" as "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL",
    financialProviderId: "",
  })
  const [financialProviders, setFinancialProviders] = useState<FinancialProvider[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProviders, setLoadingProviders] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFinancialProviders()
  }, [])

  const loadFinancialProviders = async () => {
    try {
      const providers = await financialProviderRepository.findAll()
      setFinancialProviders(providers)
    } catch (error) {
      console.error("Error loading financial providers:", error)
      toast({
        title: "Warning",
        description: "Could not load financial providers",
        variant: "destructive",
      })
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name || !formData.financialProviderId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await debtAccountRepository.create({
        code: formData.code,
        name: formData.name,
        payDay: formData.payDay,
        credit: formData.credit,
        accountStatementType: formData.accountStatementType,
        financialProviderId: formData.financialProviderId,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      toast({
        title: "Success",
        description: "Debt account created successfully",
      })
      onSuccess()
    } catch (error) {
      console.error("Error creating debt account:", error)
      toast({
        title: "Error",
        description: "Failed to create debt account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Account Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., VISA-001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Account Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Main Credit Card"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payDay">Pay Day</Label>
          <Input
            id="payDay"
            type="number"
            min="1"
            max="31"
            value={formData.payDay}
            onChange={(e) => setFormData({ ...formData, payDay: Number.parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit">Credit Limit</Label>
          <Input
            id="credit"
            type="number"
            step="0.01"
            min="0"
            value={formData.credit}
            onChange={(e) => setFormData({ ...formData, credit: Number.parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="statementType">Statement Type</Label>
          <Select
            value={formData.accountStatementType}
            onValueChange={(value: any) => setFormData({ ...formData, accountStatementType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="MERCADO_PAGO">Mercado Pago</SelectItem>
              <SelectItem value="RAPPI">Rappi</SelectItem>
              <SelectItem value="UNIVERSAL">Universal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financialProvider">Financial Provider *</Label>
          <Select
            value={formData.financialProviderId}
            onValueChange={(value) => setFormData({ ...formData, financialProviderId: value })}
            disabled={loadingProviders}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingProviders ? "Loading..." : "Select a provider"} />
            </SelectTrigger>
            <SelectContent>
              {financialProviders.map((provider) => (
                <SelectItem key={provider.code} value={provider.code}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button type="submit" disabled={loading || loadingProviders} className="flex-1 sm:flex-none">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Account
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
