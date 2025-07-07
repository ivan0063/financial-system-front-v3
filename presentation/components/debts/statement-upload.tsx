"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatementExtractionService } from "@/application/services/statement-extraction-service"
import { ApiDebtRepository } from "@/infrastructure/repositories/api-debt-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { Debt } from "@/domain/entities/debt"
import { Upload } from "lucide-react"

interface StatementUploadProps {
  debtAccounts: DebtAccount[]
  onSuccess: () => void
  onCancel: () => void
}

export function StatementUpload({ debtAccounts, onSuccess, onCancel }: StatementUploadProps) {
  const [selectedAccount, setSelectedAccount] = useState("")
  const [statementType, setStatementType] = useState<"MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL">("MANUAL")
  const [file, setFile] = useState<File | null>(null)
  const [extractedDebts, setExtractedDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"upload" | "review">("upload")

  const statementService = new StatementExtractionService()
  const debtRepository = new ApiDebtRepository()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedAccount) return

    setLoading(true)
    try {
      const debts = await statementService.execute(selectedAccount, file, statementType)
      setExtractedDebts(debts)
      setStep("review")
    } catch (error) {
      console.error("Error extracting debts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDebts = async () => {
    if (extractedDebts.length === 0) return

    setLoading(true)
    try {
      await debtRepository.addDebtsToAccount(selectedAccount, extractedDebts)
      onSuccess()
    } catch (error) {
      console.error("Error adding debts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (step === "review") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Review Extracted Debts</h3>
          <Button variant="outline" onClick={() => setStep("upload")}>
            Back to Upload
          </Button>
        </div>

        {extractedDebts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No debts were extracted from the statement.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {extractedDebts.map((debt, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{debt.description}</CardTitle>
                    <CardDescription>{debt.operationDate}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span className="font-medium">${debt.originalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Payment:</span>
                      <span className="font-medium">${debt.monthlyPayment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Installments:</span>
                      <span className="font-medium">
                        {debt.currentInstallment}/{debt.maxFinancingTerm}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddDebts} disabled={loading}>
                {loading
                  ? "Adding Debts..."
                  : `Add ${extractedDebts.length} Debt${extractedDebts.length !== 1 ? "s" : ""}`}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleExtract} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="debtAccount">Debt Account</Label>
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
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

      <div className="space-y-2">
        <Label htmlFor="statementType">Statement Type</Label>
        <Select value={statementType} onValueChange={(value: any) => setStatementType(value)}>
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
        <Label htmlFor="file">Statement File</Label>
        <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.csv,.txt,.xlsx,.xls" required />
        <p className="text-sm text-muted-foreground">Supported formats: PDF, CSV, TXT, Excel</p>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={loading || !file || !selectedAccount}>
          <Upload className="h-4 w-4 mr-2" />
          {loading ? "Extracting..." : "Extract Debts"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
