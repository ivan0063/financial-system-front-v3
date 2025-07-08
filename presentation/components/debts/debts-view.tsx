"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { DebtForm } from "./debt-form"
import { DebtList } from "./debt-list"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import { debtAccountRepository } from "@/infrastructure/repositories/api-debt-account-repository"
import type { Debt } from "@/domain/entities/debt"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { Plus } from "lucide-react"

export function DebtsView() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [debtsData, accountsData] = await Promise.all([debtRepository.findAll(), debtAccountRepository.findAll()])
      setDebts(debtsData)
      setDebtAccounts(accountsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDebtCreated = () => {
    setShowForm(false)
    loadData()
  }

  const handleDebtDeleted = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading debts...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Debts</h2>
            <p className="text-muted-foreground">Manage individual debt items and payments</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Debt</CardTitle>
              <CardDescription>Add a new debt item to track</CardDescription>
            </CardHeader>
            <CardContent>
              <DebtForm debtAccounts={debtAccounts} onSuccess={handleDebtCreated} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <DebtList debts={debts} debtAccounts={debtAccounts} onDebtDeleted={handleDebtDeleted} />
      </div>
    </div>
  )
}
