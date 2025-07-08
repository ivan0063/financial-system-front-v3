import type { Debt } from "@/domain/entities/debt"
import type { DebtRepository } from "@/domain/repositories/debt-repository"
import { apiClient } from "../api/api-client"

const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export class ApiDebtRepository implements DebtRepository {
  async findAll(): Promise<Debt[]> {
    try {
      const response = await apiClient.get("/jpa/debt")
      console.log("Raw debt response:", response)

      if (response._embedded?.debt) {
        return response._embedded.debt.map((debt: any) => this.mapToDebt(debt))
      }
      return []
    } catch (error) {
      console.error("Error fetching debts:", error)
      throw error
    }
  }

  async findById(id: number): Promise<Debt | null> {
    try {
      const response = await apiClient.get(`/jpa/debt/${id}`)
      return this.mapToDebt(response)
    } catch (error) {
      console.error("Error fetching debt:", error)
      return null
    }
  }

  async create(debt: Omit<Debt, "id">): Promise<Debt> {
    try {
      const payload = {
        description: debt.description,
        originalAmount: debt.originalAmount,
        monthlyPayment: debt.monthlyPayment,
        currentInstallment: debt.currentInstallment,
        maxFinancingTerm: debt.maxFinancingTerm,
        operationDate: debt.operationDate,
        active: debt.active,
        debtAccount: debt.debtAccount?.code ? `/jpa/debtAccount/${debt.debtAccount.code}` : null,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
      }

      console.log("Creating debt with payload:", payload)
      const response = await apiClient.post("/jpa/debt", payload)
      console.log("Created debt response:", response)
      return this.mapToDebt(response)
    } catch (error) {
      console.error("Error creating debt:", error)
      throw error
    }
  }

  async update(debt: Debt): Promise<Debt> {
    try {
      const payload = {
        description: debt.description,
        originalAmount: debt.originalAmount,
        monthlyPayment: debt.monthlyPayment,
        currentInstallment: debt.currentInstallment,
        maxFinancingTerm: debt.maxFinancingTerm,
        operationDate: debt.operationDate,
        active: debt.active,
        debtAccount: debt.debtAccount?.code ? `/jpa/debtAccount/${debt.debtAccount.code}` : null,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
      }

      console.log("Updating debt with payload:", payload)
      const response = await apiClient.put(`/jpa/debt/${debt.id}`, payload)
      console.log("Updated debt response:", response)
      return this.mapToDebt(response)
    } catch (error) {
      console.error("Error updating debt:", error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jpa/debt/${id}`)
    } catch (error) {
      console.error("Error deleting debt:", error)
      throw error
    }
  }

  async payOffDebts(debtAccountCode: string): Promise<string> {
    try {
      console.log("Paying off debts for account:", debtAccountCode)
      const response = await apiClient.post(`/debt/management/payOff/${debtAccountCode}`)
      console.log("Pay off response:", response)
      return response.message || "Debts paid off successfully"
    } catch (error) {
      console.error("Error paying off debts:", error)
      throw error
    }
  }

  private mapToDebt(data: any): Debt {
    // Extract debt account information from the response
    let debtAccount = null

    if (data.debtAccount) {
      // If debtAccount is a string (URI), extract the code
      if (typeof data.debtAccount === "string") {
        const codeMatch = data.debtAccount.match(/\/debtAccount\/(.+)$/)
        debtAccount = {
          code: codeMatch ? codeMatch[1] : data.debtAccount,
          uri: data.debtAccount,
          name: undefined, // Will be resolved by the component
        }
      } else if (typeof data.debtAccount === "object") {
        // If debtAccount is an object, use it directly
        debtAccount = {
          code: data.debtAccount.code,
          name: data.debtAccount.name,
          uri: data.debtAccount.uri || `/jpa/debtAccount/${data.debtAccount.code}`,
        }
      }
    }

    return {
      id: data.id,
      description: data.description,
      originalAmount: data.originalAmount,
      monthlyPayment: data.monthlyPayment,
      currentInstallment: data.currentInstallment,
      maxFinancingTerm: data.maxFinancingTerm,
      operationDate: data.operationDate,
      active: data.active,
      debtAccount,
    }
  }
}

export const debtRepository = new ApiDebtRepository()
