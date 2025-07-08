import type { FixedExpense } from "@/domain/entities/fixed-expense"
import type { FixedExpenseRepository } from "@/domain/repositories/fixed-expense-repository"
import { apiClient } from "../api/api-client"

const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

interface SpringDataRestResponse<T> {
  _embedded?: {
    fixedExpense?: T[]
  }
  _links?: any
  page?: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

interface FixedExpenseApiResponse {
  id: number
  name: string
  monthlyCost: number
  paymentDay: number
  active: boolean
  _links?: any
}

class ApiFixedExpenseRepository implements FixedExpenseRepository {
  private mapFromApi(apiExpense: FixedExpenseApiResponse): FixedExpense {
    return {
      id: apiExpense.id,
      name: apiExpense.name,
      monthlyCost: apiExpense.monthlyCost,
      paymentDay: apiExpense.paymentDay,
      active: apiExpense.active,
      fixedExpenseCatalog: null, // Will be populated if needed
    }
  }

  private mapToApi(expense: Partial<FixedExpense>): any {
    const apiData: any = {
      name: expense.name,
      monthlyCost: expense.monthlyCost,
      paymentDay: expense.paymentDay,
      active: expense.active,
      debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
    }

    // Handle catalog relationship
    if (expense.fixedExpenseCatalog) {
      if (typeof expense.fixedExpenseCatalog === "string") {
        apiData.fixedExpenseCatalog = `/jpa/fixedExpenseCatalog/${expense.fixedExpenseCatalog}`
      } else if (typeof expense.fixedExpenseCatalog === "object" && expense.fixedExpenseCatalog.id) {
        apiData.fixedExpenseCatalog = `/jpa/fixedExpenseCatalog/${expense.fixedExpenseCatalog.id}`
      }
    }

    return apiData
  }

  async findAll(): Promise<FixedExpense[]> {
    try {
      console.log("🔍 Fetching fixed expenses from API...")

      // Use the search endpoint to get user-specific expenses
      const response = await apiClient.get<SpringDataRestResponse<FixedExpenseApiResponse>>(
        `/jpa/fixedExpense/search/findAllByDebtSysUserAndActiveTrue?user=/jpa/user/${DEFAULT_USER_EMAIL}`,
      )

      console.log("📦 Raw API response:", response)

      // Handle Spring Data REST response structure
      let expenses: FixedExpenseApiResponse[] = []

      if (response._embedded?.fixedExpense) {
        expenses = response._embedded.fixedExpense
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        expenses = response as FixedExpenseApiResponse[]
      } else {
        console.warn("⚠️ Unexpected response structure:", response)
        expenses = []
      }

      console.log(`✅ Found ${expenses.length} fixed expenses`)

      return expenses.map((expense) => this.mapFromApi(expense))
    } catch (error) {
      console.error("❌ Error fetching fixed expenses:", error)

      // Return empty array on error to prevent crashes
      return []
    }
  }

  async findById(id: number): Promise<FixedExpense | null> {
    try {
      const response = await apiClient.get<FixedExpenseApiResponse>(`/jpa/fixedExpense/${id}`)
      return this.mapFromApi(response)
    } catch (error) {
      console.error("Error fetching fixed expense by ID:", error)
      return null
    }
  }

  async create(expense: Omit<FixedExpense, "id">): Promise<FixedExpense> {
    try {
      console.log("🆕 Creating fixed expense:", expense)

      const apiData = this.mapToApi(expense)
      console.log("📤 Sending API data:", apiData)

      const response = await apiClient.post<FixedExpenseApiResponse>("/jpa/fixedExpense", apiData)
      console.log("✅ Created fixed expense:", response)

      return this.mapFromApi(response)
    } catch (error) {
      console.error("❌ Error creating fixed expense:", error)
      throw error
    }
  }

  async update(expense: FixedExpense): Promise<FixedExpense> {
    try {
      console.log("🔄 Updating fixed expense:", expense)

      const apiData = this.mapToApi(expense)
      console.log("📤 Sending API data:", apiData)

      const response = await apiClient.put<FixedExpenseApiResponse>(`/jpa/fixedExpense/${expense.id}`, apiData)
      console.log("✅ Updated fixed expense:", response)

      return this.mapFromApi(response)
    } catch (error) {
      console.error("❌ Error updating fixed expense:", error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      console.log("🗑️ Deleting fixed expense:", id)

      await apiClient.delete(`/jpa/fixedExpense/${id}`)
      console.log("✅ Deleted fixed expense")
    } catch (error) {
      console.error("❌ Error deleting fixed expense:", error)
      throw error
    }
  }
}

export const fixedExpenseRepository = new ApiFixedExpenseRepository()
