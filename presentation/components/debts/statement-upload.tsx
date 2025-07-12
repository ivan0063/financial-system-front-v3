"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/infrastructure/api/api-client"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { Debt } from "@/domain/entities/debt"
import { Upload, Save, Edit3, Trash2, Plus, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StatementUploadProps {
  debtAccounts: DebtAccount[]
  onSuccess: () => void
  onCancel: () => void
}

interface ExtractedDebt extends Omit<Debt, "id" | "createdAt" | "updatedAt" | "debtAccount"> {
  id?: number
  tempId: string
  isEditing?: boolean
}

export function StatementUpload({ debtAccounts, onSuccess, onCancel }: StatementUploadProps) {
  const [selectedAccount, setSelectedAccount] = useState("")
  const [statementType, setStatementType] = useState<"MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL">("MANUAL")
  const [file, setFile] = useState<File | null>(null)
  const [extractedDebts, setExtractedDebts] = useState<ExtractedDebt[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<"upload" | "review">("upload")
  const { toast } = useToast()

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
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        `${apiClient.getBaseUrl()}/account/statement/extract/${selectedAccount}?accountStatementType=${statementType}`,
        {
          method: "POST",
          mode: "cors",
          body: formData,
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const debts: Debt[] = await response.json()

      // Convert to ExtractedDebt format with temporary IDs for local editing
      const extractedDebtsWithTempIds: ExtractedDebt[] = debts.map((debt, index) => ({
        ...debt,
        tempId: `temp_${Date.now()}_${index}`,
        isEditing: false,
      }))

      setExtractedDebts(extractedDebtsWithTempIds)
      setStep("review")

      toast({
        title: "Success",
        description: `Extracted ${debts.length} debts from statement`,
      })
    } catch (error) {
      console.error("Error extracting debts:", error)
      toast({
        title: "Error",
        description: "Failed to extract debts from statement",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDebts = async () => {
    if (extractedDebts.length === 0) return

    setSaving(true)
    try {
      // Convert ExtractedDebt back to Debt format for API
      const debtsToSave = extractedDebts.map((debt) => ({
        description: debt.description,
        operationDate: debt.operationDate,
        currentInstallment: debt.currentInstallment,
        maxFinancingTerm: debt.maxFinancingTerm,
        originalAmount: debt.originalAmount,
        monthlyPayment: debt.monthlyPayment,
        active: debt.active,
      }))

      const response = await fetch(`${apiClient.getBaseUrl()}/debt/management/add/${selectedAccount}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify(debtsToSave),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: `Successfully saved ${extractedDebts.length} debts to the database`,
      })

      onSuccess()
    } catch (error) {
      console.error("Error saving debts:", error)
      toast({
        title: "Error",
        description: "Failed to save debts to database",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditDebt = (tempId: string) => {
    setExtractedDebts((debts) => debts.map((debt) => (debt.tempId === tempId ? { ...debt, isEditing: true } : debt)))
  }

  const handleSaveEdit = (tempId: string, updatedDebt: Partial<ExtractedDebt>) => {
    setExtractedDebts((debts) =>
      debts.map((debt) => (debt.tempId === tempId ? { ...debt, ...updatedDebt, isEditing: false } : debt)),
    )
  }

  const handleCancelEdit = (tempId: string) => {
    setExtractedDebts((debts) => debts.map((debt) => (debt.tempId === tempId ? { ...debt, isEditing: false } : debt)))
  }

  const handleDeleteDebt = (tempId: string) => {
    setExtractedDebts((debts) => debts.filter((debt) => debt.tempId !== tempId))
  }

  const handleAddDebt = () => {
    const newDebt: ExtractedDebt = {
      tempId: `temp_${Date.now()}`,
      description: "",
      operationDate: new Date().toISOString().split("T")[0],
      currentInstallment: 1,
      maxFinancingTerm: 1,
      originalAmount: 0,
      monthlyPayment: 0,
      active: true,
      isEditing: true,
    }
    setExtractedDebts((debts) => [...debts, newDebt])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (step === "review") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Review Extracted Debts</h3>
            <p className="text-sm text-muted-foreground">Edit the extracted debts before saving them to the database</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back to Upload
            </Button>
            <Button onClick={handleAddDebt} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </div>
        </div>

        {extractedDebts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-center">No debts were extracted from the statement.</p>
              <Button onClick={handleAddDebt} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Debt Manually
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {extractedDebts.map((debt) => (
                <DebtEditCard
                  key={debt.tempId}
                  debt={debt}
                  onEdit={() => handleEditDebt(debt.tempId)}
                  onSave={(updatedDebt) => handleSaveEdit(debt.tempId, updatedDebt)}
                  onCancel={() => handleCancelEdit(debt.tempId)}
                  onDelete={() => handleDeleteDebt(debt.tempId)}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total: {extractedDebts.length} debt{extractedDebts.length !== 1 ? "s" : ""} • Total Amount:{" "}
                {formatCurrency(extractedDebts.reduce((sum, debt) => sum + debt.originalAmount, 0))} • Monthly Payment:{" "}
                {formatCurrency(extractedDebts.reduce((sum, debt) => sum + debt.monthlyPayment, 0))}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSaveDebts} disabled={saving || extractedDebts.length === 0}>
                  {saving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save to Database
                    </>
                  )}
                </Button>
              </div>
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

interface DebtEditCardProps {
  debt: ExtractedDebt
  onEdit: () => void
  onSave: (updatedDebt: Partial<ExtractedDebt>) => void
  onCancel: () => void
  onDelete: () => void
  formatCurrency: (amount: number) => string
}

function DebtEditCard({ debt, onEdit, onSave, onCancel, onDelete, formatCurrency }: DebtEditCardProps) {
  const [editData, setEditData] = useState<ExtractedDebt>(debt)

  const handleSave = () => {
    onSave(editData)
  }

  if (debt.isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Edit Debt</CardTitle>
            <Badge variant="secondary">Editing</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Debt description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operationDate">Operation Date</Label>
              <Input
                id="operationDate"
                type="date"
                value={editData.operationDate}
                onChange={(e) => setEditData({ ...editData, operationDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalAmount">Original Amount</Label>
              <Input
                id="originalAmount"
                type="number"
                step="0.01"
                value={editData.originalAmount}
                onChange={(e) => setEditData({ ...editData, originalAmount: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyPayment">Monthly Payment</Label>
              <Input
                id="monthlyPayment"
                type="number"
                step="0.01"
                value={editData.monthlyPayment}
                onChange={(e) => setEditData({ ...editData, monthlyPayment: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentInstallment">Current Installment</Label>
              <Input
                id="currentInstallment"
                type="number"
                value={editData.currentInstallment}
                onChange={(e) => setEditData({ ...editData, currentInstallment: Number.parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFinancingTerm">Max Financing Term</Label>
              <Input
                id="maxFinancingTerm"
                type="number"
                value={editData.maxFinancingTerm}
                onChange={(e) => setEditData({ ...editData, maxFinancingTerm: Number.parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{debt.description}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={debt.active ? "default" : "secondary"}>{debt.active ? "Active" : "Inactive"}</Badge>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{debt.operationDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <div className="font-medium">{formatCurrency(debt.originalAmount)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Monthly Payment:</span>
            <div className="font-medium">{formatCurrency(debt.monthlyPayment)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Installments:</span>
            <div className="font-medium">
              {debt.currentInstallment}/{debt.maxFinancingTerm}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Progress:</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min((debt.currentInstallment / debt.maxFinancingTerm) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
