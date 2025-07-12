import type { DebtAccount } from "@/domain/entities/debt-account"
import type { DebtAccountRepository } from "@/domain/repositories/debt-account-repository"
import { apiClient } from "../api/api-client"

const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export class ApiDebtAccountRepository implements DebtAccountRepository {
  async findAll(): Promise<DebtAccount[]> {
    try {
      const response = await apiClient.get("/jpa/debtAccount")
      console.log("Raw debt account response:", response)

      if (response._embedded?.debtAccount) {
        return response._embedded.debtAccount.map((account: any) => this.mapToDebtAccount(account))
      }
      return []
    } catch (error) {
      console.error("Error fetching debt accounts:", error)
      throw error
    }
  }

  async findById(code: string): Promise<DebtAccount | null> {
    try {
      const response = await apiClient.get(`/jpa/debtAccount/${code}`)
      return this.mapToDebtAccount(response)
    } catch (error) {
      console.error("Error fetching debt account:", error)
      return null
    }
  }

  async create(debtAccount: Omit<DebtAccount, "createdAt" | "updatedAt">): Promise<DebtAccount> {
    try {
      const payload = {
        code: debtAccount.code,
        name: debtAccount.name,
        payDay: debtAccount.payDay,
        credit: debtAccount.credit,
        accountStatementType: debtAccount.accountStatementType,
        financialProvider: debtAccount.financialProvider
          ? `/jpa/financialProvider/${debtAccount.financialProvider.code}`
          : null,
        active: debtAccount.active,
      }

      console.log("Creating debt account with payload:", payload)
      const response = await apiClient.post("/jpa/debtAccount", payload)
      console.log("Created debt account response:", response)
      return this.mapToDebtAccount(response)
    } catch (error) {
      console.error("Error creating debt account:", error)
      throw error
    }
  }

  async update(code: string, debtAccount: Partial<DebtAccount>): Promise<DebtAccount> {
    try {
      const payload = {
        code: debtAccount.code,
        name: debtAccount.name,
        payDay: debtAccount.payDay,
        credit: debtAccount.credit,
        accountStatementType: debtAccount.accountStatementType,
        financialProvider: debtAccount.financialProvider
          ? `/jpa/financialProvider/${debtAccount.financialProvider.code}`
          : null,
        active: debtAccount.active,
      }

      console.log("Updating debt account with payload:", payload)
      const response = await apiClient.put(`/jpa/debtAccount/${code}`, payload)
      console.log("Updated debt account response:", response)
      return this.mapToDebtAccount(response)
    } catch (error) {
      console.error("Error updating debt account:", error)
      throw error
    }
  }

  async delete(code: string): Promise<void> {
    try {
      await apiClient.delete(`/jpa/debtAccount/${code}`)
    } catch (error) {
      console.error("Error deleting debt account:", error)
      throw error
    }
  }

  private mapToDebtAccount(data: any): DebtAccount {
    // Extract financial provider information from the response
    let financialProvider = null

    if (data.financialProvider) {
      if (typeof data.financialProvider === "string") {
        // If financialProvider is a string (URI), extract the code
        const codeMatch = data.financialProvider.match(/\/financialProvider\/(.+)$/)
        financialProvider = {
          code: codeMatch ? codeMatch[1] : data.financialProvider,
          name: undefined, // Will be resolved by the component
          active: true,
        }
      } else if (typeof data.financialProvider === "object") {
        // If financialProvider is an object, use it directly
        financialProvider = {
          code: data.financialProvider.code,
          name: data.financialProvider.name,
          active: data.financialProvider.active,
        }
      }
    }

    return {
      code: data.code,
      name: data.name,
      payDay: data.payDay,
      credit: data.credit,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      active: data.active,
      accountStatementType: data.accountStatementType,
      financialProvider,
    }
  }
}

export const debtAccountRepository = new ApiDebtAccountRepository()
