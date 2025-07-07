import type { FixedExpenseRepository } from "@/domain/repositories/fixed-expense-repository"
import type { FixedExpense } from "@/domain/entities/fixed-expense"
import { apiClient } from "../api/api-client"

export class ApiFixedExpenseRepository implements FixedExpenseRepository {
  async findAll(): Promise<FixedExpense[]> {
    const response = await apiClient.get<any>("/jpa/fixedExpense")
    return response._embedded?.fixedExpense || []
  }

  async findByUserId(userId: string): Promise<FixedExpense[]> {
    const response = await apiClient.get<any>(
      `/jpa/fixedExpense/search/findAllByDebtSysUserAndActiveTrue?user=${userId}`,
    )
    return response._embedded?.fixedExpense || []
  }

  async create(expense: Omit<FixedExpense, "id">): Promise<FixedExpense> {
    return apiClient.post<FixedExpense>("/jpa/fixedExpense", expense)
  }

  async update(id: number, expense: Partial<FixedExpense>): Promise<FixedExpense> {
    return apiClient.put<FixedExpense>(`/jpa/fixedExpense/${id}`, expense)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/jpa/fixedExpense/${id}`)
  }
}

export const fixedExpenseRepository = new ApiFixedExpenseRepository()
