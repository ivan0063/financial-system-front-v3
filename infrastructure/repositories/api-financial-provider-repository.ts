import type { FinancialProviderRepository } from "@/domain/repositories/financial-provider-repository"
import type { FinancialProvider } from "@/domain/entities/financial-provider"
import { apiClient } from "../api/api-client"

export class ApiFinancialProviderRepository implements FinancialProviderRepository {
  async findAll(): Promise<FinancialProvider[]> {
    const response = await apiClient.get<any>("/jpa/financialProvider")
    return response._embedded?.financialProvider || []
  }

  async findByCode(code: string): Promise<FinancialProvider | null> {
    try {
      return await apiClient.get<FinancialProvider>(`/jpa/financialProvider/${code}`)
    } catch (error) {
      return null
    }
  }

  async create(provider: Omit<FinancialProvider, "createdAt" | "updatedAt">): Promise<FinancialProvider> {
    return apiClient.post<FinancialProvider>("/jpa/financialProvider", provider)
  }

  async update(code: string, provider: Partial<FinancialProvider>): Promise<FinancialProvider> {
    return apiClient.put<FinancialProvider>(`/jpa/financialProvider/${code}`, provider)
  }

  async delete(code: string): Promise<void> {
    return apiClient.delete(`/jpa/financialProvider/${code}`)
  }
}

export const financialProviderRepository = new ApiFinancialProviderRepository()
