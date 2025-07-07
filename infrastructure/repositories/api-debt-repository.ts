import type { DebtRepository } from "@/domain/repositories/debt-repository"
import type { Debt } from "@/domain/entities/debt"
import { apiClient } from "../api/api-client"
import { debtManagementService } from "@/application/services/debt-management-service"

export class ApiDebtRepository implements DebtRepository {
  async findAll(): Promise<Debt[]> {
    try {
      const response = await apiClient.get<any>("/jpa/debt")
      return response._embedded?.debt || []
    } catch (error) {
      console.error("Error fetching debts:", error)
      throw error
    }
  }

  async findByDebtAccountCode(debtAccountCode: string): Promise<Debt[]> {
    try {
      const response = await apiClient.get<any>(
        `/jpa/debt/search/findAllDebtsByDebtAccount_CodeAndActiveTrue?debtAccountCode=${debtAccountCode}`,
      )
      return response._embedded?.debt || []
    } catch (error) {
      console.error(`Error fetching debts for account ${debtAccountCode}:`, error)
      throw error
    }
  }

  async create(debt: Omit<Debt, "id" | "createdAt" | "updatedAt">): Promise<Debt> {
    try {
      return await apiClient.post<Debt>("/jpa/debt", debt)
    } catch (error) {
      console.error("Error creating debt:", error)
      throw error
    }
  }

  async update(id: number, debt: Partial<Debt>): Promise<Debt> {
    try {
      return await apiClient.put<Debt>(`/jpa/debt/${id}`, debt)
    } catch (error) {
      console.error(`Error updating debt ${id}:`, error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jpa/debt/${id}`)
    } catch (error) {
      console.error(`Error deleting debt ${id}:`, error)
      throw error
    }
  }

  async addDebtsToAccount(debtAccountCode: string, debts: Debt[]): Promise<string> {
    return await debtManagementService.addDebtsToAccount(debtAccountCode, debts)
  }

  async payOffDebts(debtAccountCode: string): Promise<string> {
    return await debtManagementService.payOffDebts(debtAccountCode)
  }
}

export const debtRepository = new ApiDebtRepository()
