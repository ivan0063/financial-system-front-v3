import type { FinancialProvider } from "@/domain/entities/financial-provider"
import type { FinancialProviderRepository } from "@/domain/repositories/financial-provider-repository"
import { apiClient } from "../api/api-client"

const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export class ApiFinancialProviderRepository implements FinancialProviderRepository {
  async findAll(): Promise<FinancialProvider[]> {
    try {
      const response = await apiClient.get("/jpa/financialProvider")
      console.log("Raw financial provider response:", response)

      if (response._embedded?.financialProvider) {
        return response._embedded.financialProvider.map((provider: any) => this.mapToFinancialProvider(provider))
      }
      return []
    } catch (error) {
      console.error("Error fetching financial providers:", error)
      throw error
    }
  }

  async findById(code: string): Promise<FinancialProvider | null> {
    try {
      const response = await apiClient.get(`/jpa/financialProvider/${code}`)
      return this.mapToFinancialProvider(response)
    } catch (error) {
      console.error("Error fetching financial provider:", error)
      return null
    }
  }

  async create(provider: Omit<FinancialProvider, "createdAt" | "updatedAt">): Promise<FinancialProvider> {
    try {
      const payload = {
        code: provider.code,
        name: provider.name,
        active: provider.active,
        financialProviderCatalog: provider.financialProviderCatalog
          ? `/jpa/financialProviderCatalog/${provider.financialProviderCatalog.id}`
          : null,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
      }

      console.log("Creating financial provider with payload:", payload)
      const response = await apiClient.post("/jpa/financialProvider", payload)
      console.log("Created financial provider response:", response)
      return this.mapToFinancialProvider(response)
    } catch (error) {
      console.error("Error creating financial provider:", error)
      throw error
    }
  }

  async update(code: string, provider: Partial<FinancialProvider>): Promise<FinancialProvider> {
    try {
      const payload = {
        code: provider.code,
        name: provider.name,
        active: provider.active,
        financialProviderCatalog: provider.financialProviderCatalog
          ? `/jpa/financialProviderCatalog/${provider.financialProviderCatalog.id}`
          : null,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`,
      }

      console.log("Updating financial provider with payload:", payload)
      const response = await apiClient.put(`/jpa/financialProvider/${code}`, payload)
      console.log("Updated financial provider response:", response)
      return this.mapToFinancialProvider(response)
    } catch (error) {
      console.error("Error updating financial provider:", error)
      throw error
    }
  }

  async delete(code: string): Promise<void> {
    try {
      await apiClient.delete(`/jpa/financialProvider/${code}`)
    } catch (error) {
      console.error("Error deleting financial provider:", error)
      throw error
    }
  }

  private mapToFinancialProvider(data: any): FinancialProvider {
    // Extract financial provider catalog information from the response
    let financialProviderCatalog = null

    if (data.financialProviderCatalog) {
      if (typeof data.financialProviderCatalog === "string") {
        // If financialProviderCatalog is a string (URI), extract the ID
        const idMatch = data.financialProviderCatalog.match(/\/financialProviderCatalog\/(.+)$/)
        financialProviderCatalog = {
          id: idMatch ? Number.parseInt(idMatch[1]) : null,
          name: undefined, // Will be resolved by the component
        }
      } else if (typeof data.financialProviderCatalog === "object") {
        // If financialProviderCatalog is an object, use it directly
        financialProviderCatalog = {
          id: data.financialProviderCatalog.id,
          name: data.financialProviderCatalog.name,
        }
      }
    }

    return {
      code: data.code,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      active: data.active,
      financialProviderCatalog,
    }
  }
}

export const financialProviderRepository = new ApiFinancialProviderRepository()
