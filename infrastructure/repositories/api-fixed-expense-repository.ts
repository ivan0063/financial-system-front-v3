import { ApiClient } from "../api/api-client"
import type { FixedExpense } from "../../domain/entities/fixed-expense"
import type { FixedExpenseRepository } from "../../domain/repositories/fixed-expense-repository"

interface FixedExpenseApiResponse {
  id: number
  name: string
  monthlyCost: number
  paymentDay: number
  active: boolean
  debtSysUser?: any
  fixedExpenseCatalog?: any
}

interface PagedFixedExpenseResponse {
  _embedded?: {
    fixedExpense?: FixedExpenseApiResponse[]
  }
  _links?: any
  page?: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export class ApiFixedExpenseRepository implements FixedExpenseRepository {
  private apiClient = new ApiClient()

  async findAll(): Promise<FixedExpense[]> {
    try {
      const response = await this.apiClient.get<PagedFixedExpenseResponse>("/jpa/fixedExpense")
      
      // Handle Spring Data REST paginated response
      const expenses = response._embedded?.fixedExpense || []
      
      return expenses.map(this.mapToFixedExpense)
    } catch (error) {
      console.error("Error fetching fixed expenses:", error)
      return []
    }
  }

  async findByUser(userEmail: string): Promise<FixedExpense[]> {
    try {
      // First get the user
      const userResponse = await this.apiClient.get(`/jpa/user/search/findByEmailAndActiveTrue?email=${userEmail}`)
      
      if (!userResponse) {
        return []
      }

      // Then get fixed expenses for that user
      const response = await this.apiClient.get<PagedFixedExpenseResponse>(
        `/jpa/fixedExpense/search/findAllByDebtSysUserAndActiveTrue?user=${userResponse._links.self.href}`
      )
      
      const expenses = response._embedded?.fixedExpense || []
      return expenses.map(this.mapToFixedExpense)
    } catch (error) {
      console.error("Error fetching user fixed expenses:", error)
      return []
    }
  }

  async create(fixedExpense: Omit<FixedExpense, 'id'>): Promise<FixedExpense> {
    try {
      const response = await this.apiClient.post<FixedExpenseApiResponse>("/jpa/fixedExpense", {
        name: fixedExpense.name,
        monthlyCost: fixedExpense.monthlyCost,
        paymentDay: fixedExpense.paymentDay,
        active: true,
        debtSysUser: fixedExpense.debtSysUser ? `/jpa/user/${fixedExpense.debtSysUser.email}` : null,
        fixedExpenseCatalog: fixedExpense.fixedExpenseCatalog ? `/jpa/fixedExpenseCatalog/${fixedExpense.fixedExpenseCatalog.id}` : null
      })
      
      return this.mapToFixedExpense(response)
    } catch (error) {
      console.error("Error creating fixed expense:", error)
      throw error
    }
  }

  async update(id: number, fixedExpense: Partial<FixedExpense>): Promise<FixedExpense> {
    try {
      const response = await this.apiClient.put<FixedExpenseApiResponse>(`/jpa/fixedExpense/${id}`, {
        name: fixedExpense.name,
        monthlyCost: fixedExpense.monthlyCost,
        paymentDay: fixedExpense.paymentDay,
        active: fixedExpense.active,
        debtSysUser: fixedExpense.debtSysUser ? `/jpa/user/${fixedExpense.debtSysUser.email}` : null,
        fixedExpenseCatalog: fixedExpense.fixedExpenseCatalog ? `/jpa/fixedExpenseCatalog/${fixedExpense.fixedExpenseCatalog.id}` : null
      })
      
      return this.mapToFixedExpense(response)
    } catch (error) {
      console.error("Error updating fixed expense:", error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/jpa/fixedExpense/${id}`)
    } catch (error) {
      console.error("Error deleting fixed expense:", error)
      throw error
    }
  }

  private mapToFixedExpense(apiResponse: FixedExpenseApiResponse): FixedExpense {
    return {
      id: apiResponse.id,
      name: apiResponse.name,
      monthlyCost: apiResponse.monthlyCost,
      paymentDay: apiResponse.paymentDay,
      active: apiResponse.active,
      debtSysUser: apiResponse.debtSysUser || null,
      fixedExpenseCatalog: apiResponse.fixedExpenseCatalog || null
    }
  }
}

export const fixedExpenseRepository = new ApiFixedExpenseRepository()
