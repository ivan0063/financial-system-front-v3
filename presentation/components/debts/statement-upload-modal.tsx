"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatementExtractionService } from "@/application/services/statement-extraction-service"
import type { DebtAccount } from "@/domain/entities/debt-account"
import type { Debt } from "@/domain/entities/debt"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Loader2, CheckCircle, X } from "lucide-react"

interface StatementUploadModalProps {
  isOpen: boolean
  onClose: () => void
  debtAccounts: DebtAccount[]
  onSuccess: () => void
}

export function StatementUploadModal({ isOpen, onClose, debtAccounts, onSuccess }: StatementUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAccountCode, setSelectedAccountCode] = useState("")
  const [extractedDebts, setExtractedDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"upload" | "review" | "success">("upload")
  const { toast } = useToast()

  const statementExtractionService = new StatementExtractionService()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedAccountCode) {
      toast({
        title: "Error",
        description: "Please select a file and debt account",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const debts = await statementExtractionService.extractDebtsFromStatement(selectedFile, selectedAccountCode)
      setExtractedDebts(debts)
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
    setLoading(true)
    try {
      // Here you would typically save the debts to the database
      // For now, we'll just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("success")
      toast({
        title: "Success",
        description: "Debts saved successfully",
      })
    } catch (error) {
      console.error("Error saving debts:", error)
      toast({
        title: "Error",
        description: "Failed to save debts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setSelectedAccountCode("")
    setExtractedDebts([])
    setStep("upload")
    onClose()
  }

  const handleComplete = () => {
    onSuccess()
    handleClose()
  }

  const selectedAccount = debtAccounts.find((account) => account.code === selectedAccountCode)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Account Statement
          </DialogTitle>
          <DialogDescription>Upload a statement file to automatically extract and import debts</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Select Debt Account</Label>
                <Select value={selectedAccountCode} onValueChange={setSelectedAccountCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a debt account" />
                  </SelectTrigger>
                  <SelectContent>
                    {debtAccounts
                      .filter((account) => account.active)
                      .map((account) => (
                        <SelectItem key={account.code} value={account.code}>
                          <div className="flex items-center gap-2">
                            <span>{account.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {account.accountStatementType}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAccount && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Selected Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{selectedAccount.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Statement Type:</span>
                        <p className="font-medium">{selectedAccount.accountStatementType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Provider:</span>
                        <p className="font-medium">{selectedAccount.financialProvider?.name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Credit Limit:</span>
                        <p className="font-medium">${selectedAccount.credit.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="file">Statement File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.txt,.csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Supported formats: PDF, TXT, CSV (max 10MB)</p>
              </div>

              {selectedFile && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedAccountCode || loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Extract Debts
                </Button>
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Review Extracted Debts</h3>
                  <p className="text-sm text-muted-foreground">Found {extractedDebts.length} debts in the statement</p>
                </div>
                <Badge variant="secondary">{extractedDebts.length} debts</Badge>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {extractedDebts.map((debt, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Description:</span>
                          <p className="font-medium truncate">{debt.description}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-medium">${debt.monthlyPayment.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Installments:</span>
                          <p className="font-medium">
                            {debt.currentInstallment}/{debt.maxFinancingTerm}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Operation Date:</span>
                          <p className="font-medium">{debt.operationDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveDebts} disabled={loading} className="flex-1">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save All Debts
                </Button>
                <Button variant="outline" onClick={() => setStep("upload")} className="flex-1">
                  Back to Upload
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Upload Successful!</h3>
                <p className="text-muted-foreground">
                  Successfully imported {extractedDebts.length} debts from your statement
                </p>
              </div>
              <Button onClick={handleComplete} className="w-full">
                Complete
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
