import { apiClient } from "@/infrastructure/api/api-client"
import type { Debt } from "@/domain/entities/debt"

export class DebtManagementService {
  async payOffDebts(debtAccountCode: string): Promise<string> {
    try {
      console.log(`Attempting to pay off debts for account: ${debtAccountCode}`)
      const result = await apiClient.patch<string>(`/debt/management/payOff/${debtAccountCode}`)
      console.log(`Successfully paid off debts for account ${debtAccountCode}:`, result)
      return result
    } catch (error) {
      console.error(`Failed to pay off debts for account ${debtAccountCode}:`, error)
      throw new Error(`Failed to pay off debts: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async addDebtsToAccount(debtAccountCode: string, debts: Debt[]): Promise<string> {
    try {
      console.log(`Adding ${debts.length} debts to account: ${debtAccountCode}`)
      const result = await apiClient.post<string>(`/debt/management/add/${debtAccountCode}`, debts)
      console.log(`Successfully added debts to account ${debtAccountCode}:`, result)
      return result
    } catch (error) {
      console.error(`Failed to add debts to account ${debtAccountCode}:`, error)
      throw new Error(`Failed to add debts: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getAccountStatus(debtAccountCode: string): Promise<string> {
    try {
      console.log(`Getting status for account: ${debtAccountCode}`)
      const result = await apiClient.get<string>(`/debt/account/status/${debtAccountCode}`)
      console.log(`Account ${debtAccountCode} status:`, result)
      return result
    } catch (error) {
      console.error(`Failed to get status for account ${debtAccountCode}:`, error)
      throw new Error(`Failed to get account status: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

export const debtManagementService = new DebtManagementService()
