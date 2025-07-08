"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface DebtAccountFormProps {
  account?: DebtAccount | null
  onSuccess: () => void
  onCancel: () => void
}

export function DebtAccountForm({ account, onSuccess, onCancel }: DebtAccountFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    payDay: 1,
    credit: "",
    accountStatementType: "UNIVERSAL" as "UNIVERSAL" | "BANCOLOMBIA" | "DAVIVIENDA",
    financialProviderId: "",
    active: true,
  })
  const [financialProviders, setFinancialProviders] = useState<FinancialProvider[]>([])
  const [loading, setLoading] = useState(false)
  const [providersLoading, setProvidersLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFinancialProviders()
  }, [])

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        name: account.name,
        payDay: account.payDay,
        credit: account.credit.toString(),
        accountStatementType: account.accountStatementType,
        financialProviderId: account.financialProvider?.code || "",
        active: account.active,
      })
    }
  }, [account])

  const loadFinancialProviders = async () => {
    try {
      const providers = await financialProviderRepository.findAll()
      setFinancialProviders(providers.filter((p) => p.active))
    } catch (error) {
      console.error("Error loading financial providers:", error)
      toast({
        title: "Error",
        description: "Failed to load financial providers",
        variant: "destructive",
      })
    } finally {
      setProvidersLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const creditAmount = Number.parseFloat(formData.credit)
    if (isNaN(creditAmount) || creditAmount < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid credit limit",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const accountData = {
        code: formData.code,
        name: formData.name,
        payDay: formData.payDay,
        credit: creditAmount,
        accountStatementType: formData.accountStatementType,
        financialProvider: `/jpa/financialProvider/${formData.financialProviderId}`,
        active: formData.active,
      }

      if (account) {
        await debtAccountRepository.update(account.code, accountData)
        toast({
          title: "Success",
          description: "Debt account updated successfully",
        })
      } else {
        await debtAccountRepository.create(accountData)
        toast({
          title: "Success",
          description: "Debt account created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving debt account:", error)
      toast({
        title: "Error",
        description: `Failed to ${account ? "update" : "create"} debt account`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (providersLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading form...
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange("code", e.target.value)}
            placeholder="Enter account code"
            required
            disabled={!!account} // Disable code editing when updating
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter account name"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="payDay">Pay Day</Label>
          <Input
            id="payDay"
            type="number"
            min="1"
            max="31"
            value={formData.payDay}
            onChange={(e) => handleInputChange("payDay", Number.parseInt(e.target.value))}
            placeholder="Enter pay day (1-31)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit">Credit Limit</Label>
          <Input
            id="credit"
            type="number"
            min="0"
            step="0.01"
            value={formData.credit}
            onChange={(e) => handleInputChange("credit", e.target.value)}
            placeholder="Enter credit limit (e.g., 1000.50)"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="statementType">Statement Type</Label>
          <Select
            value={formData.accountStatementType}
            onValueChange={(value) => handleInputChange("accountStatementType", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select statement type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNIVERSAL">Universal</SelectItem>
              <SelectItem value="BANCOLOMBIA">Bancolombia</SelectItem>
              <SelectItem value="DAVIVIENDA">Davivienda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financialProvider">Financial Provider</Label>
          <Select
            value={formData.financialProviderId}
            onValueChange={(value) => handleInputChange("financialProviderId", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select financial provider" />
            </SelectTrigger>
            <SelectContent>
              {financialProviders.map((provider) => (
                <SelectItem key={provider.code} value={provider.code}>
                  {provider.name} ({provider.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => handleInputChange("active", checked)}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {account ? "Update Account" : "Create Account"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}
