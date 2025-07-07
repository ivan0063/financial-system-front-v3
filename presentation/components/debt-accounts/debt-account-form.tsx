"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import { financialProviderRepository } from "@/infrastructure/repositories/api-financial-provider-repository"
import { useToast } from "@/hooks/use-toast"

interface DebtAccountFormProps {
  account?: DebtAccount | null
  onClose: () => void
}

export function DebtAccountForm({ account, onClose }: DebtAccountFormProps) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [payDay, setPayDay] = useState(1)
  const [credit, setCredit] = useState(0)
  const [accountStatementType, setAccountStatementType] = useState<string>("MANUAL")
  const [financialProviderId, setFinancialProviderId] = useState("")
  const [financialProviders, setFinancialProviders] = useState<FinancialProvider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadFinancialProviders()
    if (account) {
      setCode(account.code)
      setName(account.name)
      setPayDay(account.payDay)
      setCredit(account.credit)
      setAccountStatementType(account.accountStatementType)
      setFinancialProviderId(account.financialProvider?.code || "")
    } else {
      setCode("")
      setName("")
      setPayDay(1)
      setCredit(0)
      setAccountStatementType("MANUAL")
      setFinancialProviderId("")
    }
  }, [account])

  const loadFinancialProviders = async () => {
    try {
      const providers = await financialProviderRepository.findAll()
      setFinancialProviders(providers)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load financial providers",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const accountData = {
        code,
        name,
        payDay,
        credit,
        accountStatementType: accountStatementType as "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL",
        financialProvider: financialProviderId,
        active: true,
      }

      if (account) {
        await debtAccountRepository.update(accountData)
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
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save debt account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account ? "Edit" : "Create"} Debt Account</CardTitle>
        <CardDescription>{account ? "Update the account information" : "Add a new debt account"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter account code"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter account name"
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
              value={payDay}
              onChange={(e) => setPayDay(Number.parseInt(e.target.value) || 1)}
              placeholder="Enter pay day (1-31)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit">Credit Limit</Label>
            <Input
              id="credit"
              type="number"
              step="0.01"
              value={credit}
              onChange={(e) => setCredit(Number.parseFloat(e.target.value) || 0)}
              placeholder="Enter credit limit"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountStatementType">Statement Type</Label>
            <Select value={accountStatementType} onValueChange={setAccountStatementType}>
              <SelectTrigger>
                <SelectValue placeholder="Select statement type" />
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
            <Label htmlFor="financialProvider">Financial Provider</Label>
            <Select value={financialProviderId} onValueChange={setFinancialProviderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select financial provider" />
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : account ? "Update" : "Create"}
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
