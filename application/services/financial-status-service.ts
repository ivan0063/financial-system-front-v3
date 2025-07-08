import { apiClient } from "../../infrastructure/api/api-client"

export interface AlmostCompletedDebt {
  code: string
  description: string
  monthlyPayment: number
  currentInstallment: number
  maxFinancingTerm: number
}

export interface FixedExpense {
  id: number
  name: string
  monthlyCost: number
  paymentDay: number
  active: boolean
}

export interface DebtAccount {
  code: string
  name: string
  payDay: number
  credit: number
  createdAt: string
  updatedAt: string
  active: boolean
  accountStatementType: "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL"
}

export interface UserStatusDashboard {
  salary: number
  savings: number
  monthlyDebtPaymentAmount: number
  monthlyFixedExpensesAmount: number
  userDebtAccounts: DebtAccount[]
  almostCompletedDebts: AlmostCompletedDebt[]
  userFixedExpenses: FixedExpense[]
}

export class FinancialStatusService {
  async getUserFinancialStatus(email: string): Promise<UserStatusDashboard> {
    try {
      const response = await apiClient.get<UserStatusDashboard>(`/financial/status/${email}`)
      return response
    } catch (error) {
      console.error("Error fetching user financial status:", error)
      throw new Error("Failed to fetch financial status")
    }
  }

  async getDebtAccountStatus(debtAccountCode: string) {
    try {
      const response = await apiClient.get(`/debt/account/status/${debtAccountCode}`)
      return response
    } catch (error) {
      console.error("Error fetching debt account status:", error)
      throw new Error("Failed to fetch debt account status")
    }
  }
}

export const financialStatusService = new FinancialStatusService()
