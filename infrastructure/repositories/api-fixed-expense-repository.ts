import type { FixedExpense } from "@/domain/entities/fixed-expense"
import type { FixedExpenseRepository } from "@/domain/repositories/fixed-expense-repository"
import { apiClient } from "../api/api-client"

const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export class ApiFixedExpenseRepository implements FixedExpenseRepository {
  async findAll(): Promise<FixedExpense[]> {
    try {
      const response = await apiClient.get("/jpa/fixedExpense")
      console.log("Raw fixed expense response:", response)

      if (response._embedded?.fixedExpense) {
        return response._embedded.fixedExpense.map((expense: any) => this.mapToFixedExpense(expense))
      }
      return []
    } catch (error) {
      console.error("Error fetching fixed expenses:", error)
      throw error
    }
  }

  async findById(id: number): Promise<FixedExpense | null> {
    try {
      const response = await apiClient.get(`/jpa/fixedExpense/${id}`)
      return this.mapToFixedExpense(response)
    } catch (error) {
      console.error("Error fetching fixed expense:", error)
      return null
    }
  }

  async create(expense: Omit<FixedExpense, "id">): Promise<FixedExpense> {
    try {
      const payload = {
        name: expense.name,
        monthlyCost: expense.monthlyCost,
        paymentDay: expense.paymentDay,
        active: expense.active,
        fixedExpenseCatalog: expense.fixedExpenseCatalog
          ? `/jpa/fixedExpenseCatalog/${expense.fixedExpenseCatalog}`
          : null,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
      }

      console.log("Creating fixed expense with payload:", payload)
      const response = await apiClient.post("/jpa/fixedExpense", payload)
      console.log("Created fixed expense response:", response)
      return this.mapToFixedExpense(response)
    } catch (error) {
      console.error("Error creating fixed expense:", error)
      throw error
    }
  }

  async update(expense: FixedExpense): Promise<FixedExpense> {
    try {
      const payload = {
        name: expense.name,
        monthlyCost: expense.monthlyCost,
        paymentDay: expense.paymentDay,
        active: expense.active,
        fixedExpenseCatalog: expense.fixedExpenseCatalog
          ? `/jpa/fixedExpenseCatalog/${expense.fixedExpenseCatalog}`
          : null,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
      }

      console.log("Updating fixed expense with payload:", payload)
      const response = await apiClient.put(`/jpa/fixedExpense/${expense.id}`, payload)
      console.log("Updated fixed expense response:", response)
      return this.mapToFixedExpense(response)
    } catch (error) {
      console.error("Error updating fixed expense:", error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jpa/fixedExpense/${id}`)
    } catch (error) {
      console.error("Error deleting fixed expense:", error)
      throw error
    }
  }

  private mapToFixedExpense(data: any): FixedExpense {
    // Extract catalog information from the response
    let fixedExpenseCatalog = null

    if (data.fixedExpenseCatalog) {
      if (typeof data.fixedExpenseCatalog === "string") {
        // If it's a URI string, extract the ID
        const idMatch = data.fixedExpenseCatalog.match(/\/fixedExpenseCatalog\/(\d+)$/)
        fixedExpenseCatalog = {
          id: idMatch ? Number.parseInt(idMatch[1]) : 0,
          name: undefined, // Will be resolved by the component if needed
          uri: data.fixedExpenseCatalog,
        }
      } else if (typeof data.fixedExpenseCatalog === "object") {
        // If it's an object, use it directly
        fixedExpenseCatalog = {
          id: data.fixedExpenseCatalog.id,
          name: data.fixedExpenseCatalog.name,
          uri: data.fixedExpenseCatalog.uri || `/jpa/fixedExpenseCatalog/${data.fixedExpenseCatalog.id}`,
        }
      }
    }

    return {
      id: data.id,
      name: data.name,
      monthlyCost: data.monthlyCost,
      paymentDay: data.paymentDay,
      active: data.active,
      fixedExpenseCatalog,
    }
  }
}

export const fixedExpenseRepository = new ApiFixedExpenseRepository()
