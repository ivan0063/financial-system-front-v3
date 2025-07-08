import type { GetFinancialStatusUseCase } from "@/domain/use-cases/get-financial-status"
import { apiClient } from "@/infrastructure/api/api-client"

// Updated interfaces based on the API specification
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

export interface AlmostCompletedDebtsDto {
  code: string
  description: string
  monthlyPayment: number
  currentInstallment: number
  maxFinancingTerm: number
}

export interface FixedExpenseCatalog {
  id: number
  name: string
}

export interface SystemUser {
  email: string
  name: string
  salary: number
  savings: number
  createdAt: string
  updatedAt: string
  active: boolean
}

export interface FixedExpense {
  id: number
  name: string
  monthlyCost: number
  paymentDay: number
  active: boolean
  debtSysUser: SystemUser
  fixedExpenseCatalog: FixedExpenseCatalog
}

export interface UserStatusDashboard {
  salary: number
  savings: number
  monthlyDebtPaymentAmount: number
  monthlyFixedExpensesAmount: number
  userDebtAccounts: DebtAccount[]
  almostCompletedDebts: AlmostCompletedDebtsDto[]
  userFixedExpenses: FixedExpense[]
}

export class FinancialStatusService implements GetFinancialStatusUseCase {
  async execute(email: string): Promise<UserStatusDashboard> {
    try {
      console.log(`Fetching financial status for email: ${email}`)
      const response = await apiClient.get<UserStatusDashboard>(`/financial/status/${email}`)
      console.log("Financial status response:", response)
      return response
    } catch (error) {
      console.error("Error fetching financial status:", error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("CORS Error")) {
          throw new Error(`API Connection Error: ${error.message}`)
        }
        throw new Error(`Failed to fetch financial status: ${error.message}`)
      }

      throw new Error("Failed to fetch financial status: Unknown error")
    }
  }
}
