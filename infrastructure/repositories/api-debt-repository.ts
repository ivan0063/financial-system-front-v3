import type { Debt } from "@/domain/entities/debt"
import type { DebtRepository } from "@/domain/repositories/debt-repository"
import { apiClient } from "../api/api-client"

export class ApiDebtRepository implements DebtRepository {
  async findAll(): Promise<Debt[]> {
    try {
      const response = await apiClient.get<{ _embedded: { debt: Debt[] } }>("/jpa/debt")
      return response._embedded?.debt || []
    } catch (error) {
      console.error("Error fetching debts:", error)
      throw error
    }
  }

  async findById(id: number): Promise<Debt | null> {
    try {
      return await apiClient.get<Debt>(`/jpa/debt/${id}`)
    } catch (error) {
      console.error(`Error fetching debt ${id}:`, error)
      return null
    }
  }

  async create(debt: Omit<Debt, "id" | "createdAt" | "updatedAt">): Promise<Debt> {
    try {
      // Convert the debtAccount code to URI format for Spring Data REST
      const debtData = {
        ...debt,
        debtAccount: `/jpa/debtAccount/${debt.debtAccountCode}`, // URI format for debt account relationship
      }

      // Remove the debtAccountCode since we're using the URI format
      delete (debtData as any).debtAccountCode

      return await apiClient.post<Debt>("/jpa/debt", debtData)
    } catch (error) {
      console.error("Error creating debt:", error)
      throw error
    }
  }

  async update(debt: Debt): Promise<Debt> {
    try {
      // Convert the debtAccount code to URI format for Spring Data REST
      const debtData = {
        ...debt,
        debtAccount: `/jpa/debtAccount/${debt.debtAccountCode}`, // URI format for debt account relationship
      }

      // Remove the debtAccountCode since we're using the URI format
      delete (debtData as any).debtAccountCode

      return await apiClient.put<Debt>(`/jpa/debt/${debt.id}`, debtData)
    } catch (error) {
      console.error(`Error updating debt ${debt.id}:`, error)
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
}

export const debtRepository = new ApiDebtRepository()
