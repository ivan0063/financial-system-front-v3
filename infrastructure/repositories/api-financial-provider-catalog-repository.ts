import type { FinancialProviderCatalogRepository } from "@/domain/repositories/financial-provider-catalog-repository"
import type {
  FinancialProviderCatalog,
  CreateFinancialProviderCatalogRequest,
  UpdateFinancialProviderCatalogRequest,
} from "@/domain/entities/financial-provider-catalog"
import { apiClient } from "../api/api-client"

export class ApiFinancialProviderCatalogRepository implements FinancialProviderCatalogRepository {
  async findAll(): Promise<FinancialProviderCatalog[]> {
    const response = await apiClient.get<any>("/jpa/financialProviderCatalog")
    return response._embedded?.financialProviderCatalog || []
  }

  async findById(id: number): Promise<FinancialProviderCatalog | null> {
    try {
      const response = await apiClient.get<FinancialProviderCatalog>(`/jpa/financialProviderCatalog/${id}`)
      return response
    } catch (error) {
      return null
    }
  }

  async create(catalog: CreateFinancialProviderCatalogRequest): Promise<FinancialProviderCatalog> {
    return await apiClient.post<FinancialProviderCatalog>("/jpa/financialProviderCatalog", catalog)
  }

  async update(catalog: UpdateFinancialProviderCatalogRequest): Promise<FinancialProviderCatalog> {
    return await apiClient.put<FinancialProviderCatalog>(`/jpa/financialProviderCatalog/${catalog.id}`, catalog)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/jpa/financialProviderCatalog/${id}`)
  }
}

export const financialProviderCatalogRepository = new ApiFinancialProviderCatalogRepository()
