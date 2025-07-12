"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, AlertCircle } from "lucide-react"
import type { DebtAccount } from "@/domain/entities/debt-account"

interface StatementUploadModalProps {
  isOpen: boolean
  onClose: () => void
  debtAccounts?: DebtAccount[]
  onSuccess: () => void
}

export function StatementUploadModal({ isOpen, onClose, debtAccounts = [], onSuccess }: StatementUploadModalProps) {
  const [selectedAccountCode, setSelectedAccountCode] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const selectedAccount = debtAccounts.find((account) => account.code === selectedAccountCode)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type - only allow PDF and CSV
      const allowedTypes = ["application/pdf", "text/csv", "application/vnd.ms-excel"]
      const fileExtension = selectedFile.name.toLowerCase().split(".").pop()

      if (!allowedTypes.includes(selectedFile.type) && !["pdf", "csv"].includes(fileExtension || "")) {
        setError("Please select a PDF or CSV file only.")
        setFile(null)
        e.target.value = ""
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAccountCode) {
      setError("Please select a debt account.")
      return
    }

    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    if (!selectedAccount) {
      setError("Selected debt account not found.")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/statement/extract/${selectedAccountCode}?accountStatementType=${selectedAccount.accountStatementType}`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: `Statement processed successfully. ${result.length || 0} debts extracted.`,
      })

      onSuccess()
      onClose()

      // Reset form
      setSelectedAccountCode("")
      setFile(null)
    } catch (error) {
      console.error("Error uploading statement:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload statement"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedAccountCode("")
      setFile(null)
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mx-4 max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Account Statement</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="debtAccount">Select Debt Account</Label>
            <Select value={selectedAccountCode} onValueChange={setSelectedAccountCode} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose debt account" />
              </SelectTrigger>
              <SelectContent>
                {debtAccounts.map((account) => (
                  <SelectItem key={account.code} value={account.code}>
                    <div className="flex flex-col">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Code: {account.code} | Type: {account.accountStatementType}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statementFile">Statement File (PDF or CSV only)</Label>
            <Input
              id="statementFile"
              type="file"
              accept=".pdf,.csv,application/pdf,text/csv"
              onChange={handleFileChange}
              required
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={uploading || !selectedAccountCode || !file} className="flex-1">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Statement
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
