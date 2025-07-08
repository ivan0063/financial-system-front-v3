import type { FinancialProviderRepository } from "@/domain/repositories/financial-provider-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { apiClient, DEFAULT_USER_EMAIL } from "../api/api-client"

export class ApiFinancialProviderRepository implements FinancialProviderRepository {
  async findAll(): Promise<FinancialProvider[]> {
    try {
      const response = await apiClient.get<{ _embedded: { financialProvider: FinancialProvider[] } }>(
        "/jpa/financialProvider",
      )
      return response._embedded?.financialProvider || []
    } catch (error) {
      console.error("Error fetching financial providers:", error)
      throw error
    }
  }

  async findById(id: number): Promise<FinancialProvider | null> {
    try {
      const response = await apiClient.get<FinancialProvider>(`/jpa/financialProvider/${id}`)
      return response
    } catch (error) {
      return null
    }
  }

  async findByCode(code: string): Promise<FinancialProvider | null> {
    try {
      return await apiClient.get<FinancialProvider>(`/jpa/financialProvider/${code}`)
    } catch (error) {
      console.error(`Error fetching financial provider ${code}:`, error)
      return null
    }
  }

  async create(financialProvider: Omit<FinancialProvider, "createdAt" | "updatedAt">): Promise<FinancialProvider> {
    try {
      // Add the user relationship and convert catalog to URI format for Spring Data REST
      const financialProviderData = {
        ...financialProvider,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`, // URI format for user relationship
        // financialProviderCatalog is already in URI format from the form
      }

      return await apiClient.post<FinancialProvider>("/jpa/financialProvider", financialProviderData)
    } catch (error) {
      console.error("Error creating financial provider:", error)
      throw error
    }
  }

  async update(financialProvider: FinancialProvider): Promise<FinancialProvider> {
    try {
      // Add the user relationship and convert catalog to URI format for Spring Data REST
      const financialProviderData = {
        ...financialProvider,
        debtSysUser: `/jpa/user/${DEFAULT_USER_EMAIL}`, // URI format for user relationship
        // financialProviderCatalog should be in URI format
      }

      return await apiClient.put<FinancialProvider>(
        `/jpa/financialProvider/${financialProvider.code}`,
        financialProviderData,
      )
    } catch (error) {
      console.error(`Error updating financial provider ${financialProvider.code}:`, error)
      throw error
    }
  }

  async delete(code: string): Promise<void> {
    try {
      await apiClient.delete(`/jpa/financialProvider/${code}`)
    } catch (error) {
      console.error(`Error deleting financial provider ${code}:`, error)
      throw error
    }
  }
}

export const financialProviderRepository = new ApiFinancialProviderRepository()
