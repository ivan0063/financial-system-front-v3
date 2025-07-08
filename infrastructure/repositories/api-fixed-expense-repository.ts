import type { FixedExpense } from "@/domain/entities/fixed-expense"
import type { FixedExpenseRepository } from "@/domain/repositories/fixed-expense-repository"
import { apiClient, DEFAULT_USER_EMAIL } from "../api/api-client"

export class ApiFixedExpenseRepository implements FixedExpenseRepository {
  async findAll(): Promise<FixedExpense[]> {
    try {
      const response = await apiClient.get<{ _embedded: { fixedExpense: FixedExpense[] } }>("/jpa/fixedExpense")
      return response._embedded?.fixedExpense || []
    } catch (error) {
      console.error("Error fetching fixed expenses:", error)
      throw error
    }
  }

  async findById(id: number): Promise<FixedExpense | null> {
    try {
      return await apiClient.get<FixedExpense>(`/jpa/fixedExpense/${id}`)
    } catch (error) {
      console.error(`Error fetching fixed expense ${id}:`, error)
      return null
    }
  }

  async create(fixedExpense: Omit<FixedExpense, "id" | "createdAt" | "updatedAt">): Promise<FixedExpense> {
    try {
      // Convert the fixedExpenseCatalog ID to URI format for Spring Data REST
      const fixedExpenseData = {
        ...fixedExpense,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`, // URI format for user relationship
        fixedExpenseCatalog: `/jpa/fixedExpenseCatalog/${fixedExpense.fixedExpenseCatalog}`, // URI format for catalog relationship
      }

      return await apiClient.post<FixedExpense>("/jpa/fixedExpense", fixedExpenseData)
    } catch (error) {
      console.error("Error creating fixed expense:", error)
      throw error
    }
  }

  async update(fixedExpense: FixedExpense): Promise<FixedExpense> {
    try {
      // Convert the fixedExpenseCatalog ID to URI format for Spring Data REST
      const fixedExpenseData = {
        ...fixedExpense,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`, // URI format for user relationship
        fixedExpenseCatalog: `/jpa/fixedExpenseCatalog/${fixedExpense.fixedExpenseCatalog}`, // URI format for catalog relationship
      }

      return await apiClient.put<FixedExpense>(`/jpa/fixedExpense/${fixedExpense.id}`, fixedExpenseData)
    } catch (error) {
      console.error(`Error updating fixed expense ${fixedExpense.id}:`, error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jpa/fixedExpense/${id}`)
    } catch (error) {
      console.error(`Error deleting fixed expense ${id}:`, error)
      throw error
    }
  }
}

export const fixedExpenseRepository = new ApiFixedExpenseRepository()
