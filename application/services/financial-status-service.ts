import type { GetFinancialStatusUseCase } from "@/domain/use-cases/get-financial-status"
import { apiClient } from "@/infrastructure/api/api-client"

export interface FinancialStatusResponse {
  salary: number
  savings: number
  monthlyDebtPaymentAmount: number
  monthlyFixedExpensesAmount: number
  userDebtAccounts: Array<{
    id: string
    debtAccountCode: string
    accountName: string
    financialProvider: string
    accountType: string
    currentBalance: number
    creditLimit: number
    availableCredit: number
    interestRate: number
    minimumPayment: number
    dueDate: string
    status: string
    createdAt: string
    updatedAt: string
  }>
  almostCompletedDebts: Array<{
    id: string
    debtAccountCode: string
    accountName: string
    currentBalance: number
    creditLimit: number
  }>
  userFixedExpenses: Array<{
    id: string
    name: string
    amount: number
    category: string
    dueDate: string
  }>
}

export class FinancialStatusService implements GetFinancialStatusUseCase {
  async execute(email: string): Promise<FinancialStatusResponse> {
    return apiClient.get<FinancialStatusResponse>(`/financial/status/${email}`)
  }
}
