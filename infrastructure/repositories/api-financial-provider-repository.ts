import type { FinancialProviderRepository } from "@/domain/repositories/financial-provider-repository"
import type {
  FinancialProvider,
  CreateFinancialProviderRequest,
  UpdateFinancialProviderRequest,
} from "@/domain/entities/financial-provider"
import { apiClient } from "../api/api-client"

export class ApiFinancialProviderRepository implements FinancialProviderRepository {
  async findAll(): Promise<FinancialProvider[]> {
    const response = await apiClient.get<any>("/jpa/financialProvider")
    return response._embedded?.financialProvider || []
  }

  async findById(id: number): Promise<FinancialProvider | null> {
    try {
      const response = await apiClient.get<FinancialProvider>(`/jpa/financialProvider/${id}`)
      return response
    } catch (error) {
      return null
    }
  }

  async create(provider: CreateFinancialProviderRequest): Promise<FinancialProvider> {
    return await apiClient.post<FinancialProvider>("/jpa/financialProvider", provider)
  }

  async update(provider: UpdateFinancialProviderRequest): Promise<FinancialProvider> {
    return await apiClient.put<FinancialProvider>(`/jpa/financialProvider/${provider.id}`, provider)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/jpa/financialProvider/${id}`)
  }
}

export const financialProviderRepository = new ApiFinancialProviderRepository()
