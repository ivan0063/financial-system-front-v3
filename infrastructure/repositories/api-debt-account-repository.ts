import type { DebtAccountRepository } from "@/domain/repositories/debt-account-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { apiClient } from "../api/api-client"
import { debtManagementService } from "@/application/services/debt-management-service"

export class ApiDebtAccountRepository implements DebtAccountRepository {
  async findAll(): Promise<DebtAccount[]> {
    const response = await apiClient.get<any>("/jpa/debtAccount")
    return response._embedded?.debtAccount || []
  }

  async findByCode(code: string): Promise<DebtAccount | null> {
    try {
      const response = await apiClient.get<any>(
        `/jpa/debtAccount/search/findDebtAccountByCodeAndActiveTrue?code=${code}`,
      )
      return response
    } catch (error) {
      return null
    }
  }

  async create(debtAccount: Omit<DebtAccount, "createdAt" | "updatedAt">): Promise<DebtAccount> {
    return apiClient.post<DebtAccount>("/jpa/debtAccount", debtAccount)
  }

  async update(code: string, debtAccount: Partial<DebtAccount>): Promise<DebtAccount> {
    return apiClient.put<DebtAccount>(`/jpa/debtAccount/${code}`, debtAccount)
  }

  async delete(code: string): Promise<void> {
    return apiClient.delete(`/jpa/debtAccount/${code}`)
  }

  async getStatus(code: string): Promise<string> {
    return await debtManagementService.getAccountStatus(code)
  }
}

export const debtAccountRepository = new ApiDebtAccountRepository()
