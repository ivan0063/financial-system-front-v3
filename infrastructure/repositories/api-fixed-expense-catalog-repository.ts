import type { FixedExpenseCatalogRepository } from "@/domain/repositories/fixed-expense-catalog-repository"
import type {
  FixedExpenseCatalog,
  CreateFixedExpenseCatalogRequest,
  UpdateFixedExpenseCatalogRequest,
} from "@/domain/entities/fixed-expense-catalog"
import { apiClient } from "../api/api-client"

export class ApiFixedExpenseCatalogRepository implements FixedExpenseCatalogRepository {
  async findAll(): Promise<FixedExpenseCatalog[]> {
    const response = await apiClient.get<any>("/jpa/fixedExpenseCatalog")
    return response._embedded?.fixedExpenseCatalog || []
  }

  async findById(id: number): Promise<FixedExpenseCatalog | null> {
    try {
      const response = await apiClient.get<FixedExpenseCatalog>(`/jpa/fixedExpenseCatalog/${id}`)
      return response
    } catch (error) {
      return null
    }
  }

  async create(catalog: CreateFixedExpenseCatalogRequest): Promise<FixedExpenseCatalog> {
    return await apiClient.post<FixedExpenseCatalog>("/jpa/fixedExpenseCatalog", catalog)
  }

  async update(catalog: UpdateFixedExpenseCatalogRequest): Promise<FixedExpenseCatalog> {
    return await apiClient.put<FixedExpenseCatalog>(`/jpa/fixedExpenseCatalog/${catalog.id}`, catalog)
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/jpa/fixedExpenseCatalog/${id}`)
  }
}

export const fixedExpenseCatalogRepository = new ApiFixedExpenseCatalogRepository()
