import type { DebtAccountRepository } from "@/domain/repositories/debt-account-repository"
import type { DebtAccount } from "@/domain/entities/debt-account"
import { apiClient, DEFAULT_USER_EMAIL } from "../api/api-client"

export class ApiDebtAccountRepository implements DebtAccountRepository {
  async findAll(): Promise<DebtAccount[]> {
    try {
      const response = await apiClient.get<{ _embedded: { debtAccount: DebtAccount[] } }>("/jpa/debtAccount")
      return response._embedded?.debtAccount || []
    } catch (error) {
      console.error("Error fetching debt accounts:", error)
      throw error
    }
  }

  async findByCode(code: string): Promise<DebtAccount | null> {
    try {
      return await apiClient.get<DebtAccount>(`/jpa/debtAccount/${code}`)
    } catch (error) {
      console.error(`Error fetching debt account ${code}:`, error)
      return null
    }
  }

  async create(debtAccount: Omit<DebtAccount, "createdAt" | "updatedAt">): Promise<DebtAccount> {
    try {
      // Add the user relationship using URI format for Spring Data REST
      const debtAccountData = {
        ...debtAccount,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`, // URI format for user relationship
      }

      return await apiClient.post<DebtAccount>("/jpa/debtAccount", debtAccountData)
    } catch (error) {
      console.error("Error creating debt account:", error)
      throw error
    }
  }

  async update(debtAccount: DebtAccount): Promise<DebtAccount> {
    try {
      // Add the user relationship using URI format for Spring Data REST
      const debtAccountData = {
        ...debtAccount,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`, // URI format for user relationship
      }

      return await apiClient.put<DebtAccount>(`/jpa/debtAccount/${debtAccount.code}`, debtAccountData)
    } catch (error) {
      console.error(`Error updating debt account ${debtAccount.code}:`, error)
      throw error
    }
  }

  async delete(code: string): Promise<void> {
    try {
      await apiClient.delete(`/jpa/debtAccount/${code}`)
    } catch (error) {
      console.error(`Error deleting debt account ${code}:`, error)
      throw error
    }
  }
}

export const debtAccountRepository = new ApiDebtAccountRepository()
