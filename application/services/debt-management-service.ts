import { apiClient } from "../../infrastructure/api/api-client"

export interface Debt {
  id: number
  description: string
  operationDate: string
  currentInstallment: number
  maxFinancingTerm: number
  originalAmount: number
  monthlyPayment: number
  createdAt: string
  updatedAt: string
  active: boolean
  debtAccount: {
    code: string
    name: string
    payDay: number
    credit: number
    createdAt: string
    updatedAt: string
    active: boolean
    accountStatementType: "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL"
  }
}

export interface DebtAccountStatusDto {
  debtAccount: {
    code: string
    name: string
    payDay: number
    credit: number
    createdAt: string
    updatedAt: string
    active: boolean
    accountStatementType: "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL"
  }
  monthPayment: number
  debts: Debt[]
  almostCompletedDebts: {
    code: string
    description: string
    monthlyPayment: number
    currentInstallment: number
    maxFinancingTerm: number
  }[]
}

export class DebtManagementService {
  async payOffDebts(debtAccountCode: string): Promise<Debt[]> {
    try {
      const response = await apiClient.patch<Debt[]>(`/debt/management/payOff/${debtAccountCode}`)
      return response
    } catch (error) {
      console.error("Error paying off debts:", error)
      throw new Error("Failed to pay off debts")
    }
  }

  async addDebtsToAccount(debtAccountCode: string, debts: Debt[]): Promise<Debt[]> {
    try {
      const response = await apiClient.post<Debt[]>(`/debt/management/add/${debtAccountCode}`, debts)
      return response
    } catch (error) {
      console.error("Error adding debts to account:", error)
      throw new Error("Failed to add debts to account")
    }
  }

  async getDebtAccountStatus(debtAccountCode: string): Promise<DebtAccountStatusDto> {
    try {
      const response = await apiClient.get<DebtAccountStatusDto>(`/debt/account/status/${debtAccountCode}`)
      return response
    } catch (error) {
      console.error("Error fetching debt account status:", error)
      throw new Error("Failed to fetch debt account status")
    }
  }
}

export const debtManagementService = new DebtManagementService()
