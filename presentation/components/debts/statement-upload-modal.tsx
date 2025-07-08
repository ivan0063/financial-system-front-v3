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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiClient } from "@/infrastructure/api/api-client"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { Debt } from "@/domain/entities/debt"
import { Upload, Save, Edit3, Trash2, Plus, AlertCircle, CheckCircle, X, FileText, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StatementUploadModalProps {
  isOpen: boolean
  onClose: () => void
  debtAccounts: DebtAccount[]
  onSuccess: () => void
}

interface ExtractedDebt extends Omit<Debt, "id" | "createdAt" | "updatedAt" | "debtAccount"> {
  id?: number
  tempId: string
  isEditing?: boolean
}

type StatementType = "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL"

export function StatementUploadModal({ isOpen, onClose, debtAccounts, onSuccess }: StatementUploadModalProps) {
  const [selectedAccount, setSelectedAccount] = useState("")
  const [statementType, setStatementType] = useState<StatementType>("MANUAL")
  const [file, setFile] = useState<File | null>(null)
  const [extractedDebts, setExtractedDebts] = useState<ExtractedDebt[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<"upload" | "review">("upload")
  const { toast } = useToast()

  const selectedAccountData = debtAccounts.find((account) => account.code === selectedAccount)

  const handleClose = () => {
    if (!loading && !saving) {
      setStep("upload")
      setSelectedAccount("")
      setStatementType("MANUAL")
      setFile(null)
      setExtractedDebts([])
      onClose()
    }
  }

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
      handleClose()
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

  const getStatementTypeLabel = (type: StatementType) => {
    const labels = {
      MANUAL: "Manual",
      MERCADO_PAGO: "Mercado Pago",
      RAPPI: "Rappi",
      UNIVERSAL: "Universal",
    }
    return labels[type]
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Account Statement
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload a statement file to automatically extract debts"
              : "Review and edit the extracted debts before saving to database"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 pt-0">
            {step === "upload" ? (
              <form onSubmit={handleExtract} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debtAccount">Debt Account</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a debt account" />
                      </SelectTrigger>
                      <SelectContent>
                        {debtAccounts.map((account) => (
                          <SelectItem key={account.code} value={account.code}>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span className="truncate">{account.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {account.code}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statementType">Statement Type</Label>
                    <Select value={statementType} onValueChange={(value: StatementType) => setStatementType(value)}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Statement File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.csv,.txt,.xlsx,.xls"
                    required
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Supported formats: PDF, CSV, TXT, Excel
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit" disabled={loading || !file || !selectedAccount} className="flex-1 sm:flex-none">
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? "Extracting..." : "Extract Debts"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 sm:flex-none bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Review Extracted Debts</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {selectedAccountData?.name}
                      </Badge>
                      <Badge variant="outline">{getStatementTypeLabel(statementType)}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setStep("upload")} size="sm">
                      Back to Upload
                    </Button>
                    <Button onClick={handleAddDebt} variant="outline" size="sm">
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
                    <div className="space-y-4">
                      {extractedDebts.map((debt) => (
                        <DebtEditCard
                          key={debt.tempId}
                          debt={debt}
                          statementType={statementType}
                          financialProvider={selectedAccountData?.financialProvider?.name || ""}
                          onEdit={() => handleEditDebt(debt.tempId)}
                          onSave={(updatedDebt) => handleSaveEdit(debt.tempId, updatedDebt)}
                          onCancel={() => handleCancelEdit(debt.tempId)}
                          onDelete={() => handleDeleteDebt(debt.tempId)}
                          formatCurrency={formatCurrency}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          Total: {extractedDebts.length} debt{extractedDebts.length !== 1 ? "s" : ""}
                        </div>
                        <div>
                          Total Amount:{" "}
                          {formatCurrency(extractedDebts.reduce((sum, debt) => sum + debt.originalAmount, 0))}
                        </div>
                        <div>
                          Monthly Payment:{" "}
                          {formatCurrency(extractedDebts.reduce((sum, debt) => sum + debt.monthlyPayment, 0))}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-none bg-transparent">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveDebts}
                          disabled={saving || extractedDebts.length === 0}
                          className="flex-1 sm:flex-none"
                        >
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
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface DebtEditCardProps {
  debt: ExtractedDebt
  statementType: StatementType
  financialProvider: string
  onEdit: () => void
  onSave: (updatedDebt: Partial<ExtractedDebt>) => void
  onCancel: () => void
  onDelete: () => void
  formatCurrency: (amount: number) => string
}

function DebtEditCard({
  debt,
  statementType,
  financialProvider,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  formatCurrency,
}: DebtEditCardProps) {
  const [editData, setEditData] = useState<ExtractedDebt>(debt)

  const handleSave = () => {
    onSave(editData)
  }

  const getStatementTypeLabel = (type: StatementType) => {
    const labels = {
      MANUAL: "Manual",
      MERCADO_PAGO: "Mercado Pago",
      RAPPI: "Rappi",
      UNIVERSAL: "Universal",
    }
    return labels[type]
  }

  if (debt.isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-base">Edit Debt</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Editing</Badge>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Debt description"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operationDate">Operation Date</Label>
              <Input
                id="operationDate"
                type="text"
                value={editData.operationDate}
                onChange={(e) => setEditData({ ...editData, operationDate: e.target.value })}
                placeholder="YYYY-MM-DD or any date format"
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
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={onCancel} size="sm" className="flex-1 sm:flex-none bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" className="flex-1 sm:flex-none">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{debt.description}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
              <span>{debt.operationDate}</span>
              <Badge variant="outline" className="text-xs">
                {getStatementTypeLabel(statementType)}
              </Badge>
              {financialProvider && (
                <Badge variant="outline" className="text-xs">
                  {financialProvider}
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={debt.active ? "default" : "secondary"} className="text-xs">
              {debt.active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground block">Amount:</span>
            <div className="font-medium">{formatCurrency(debt.originalAmount)}</div>
          </div>
          <div>
            <span className="text-muted-foreground block">Monthly:</span>
            <div className="font-medium">{formatCurrency(debt.monthlyPayment)}</div>
          </div>
          <div>
            <span className="text-muted-foreground block">Installments:</span>
            <div className="font-medium">
              {debt.currentInstallment}/{debt.maxFinancingTerm}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground block">Progress:</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
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
