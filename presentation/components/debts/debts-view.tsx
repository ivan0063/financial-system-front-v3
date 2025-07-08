"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "../layout/header"
import { DebtForm } from "./debt-form"
import { DebtList } from "./debt-list"
import { debtRepository } from "@/infrastructure/repositories/api-debt-repository"
import type { Debt } from "@/domain/entities/debt"
import { Plus } from "lucide-react"

export function DebtsView() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      const allDebts = await debtRepository.findAll()
      setDebts(allDebts)
    } catch (error) {
      console.error("Error loading debts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDebtCreated = () => {
    setShowForm(false)
    loadDebts()
  }

  const handleDebtDeleted = () => {
    loadDebts()
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
            <p className="text-muted-foreground">Track and manage your individual debts</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Debt
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Debt</CardTitle>
              <CardDescription>Add a new debt to track</CardDescription>
            </CardHeader>
            <CardContent>
              <DebtForm onSuccess={handleDebtCreated} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <DebtList debts={debts} onDebtDeleted={handleDebtDeleted} />
      </div>
    </div>
  )
}
