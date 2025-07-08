import type { FixedExpenseCatalog } from "@/domain/entities/fixed-expense-catalog"
import type { FixedExpenseCatalogRepository } from "@/domain/repositories/fixed-expense-catalog-repository"
import { apiClient } from "../api/api-client"

interface FixedExpenseCatalogApiResponse {
  id: number
  name: string
  _links?: any
}

interface PagedFixedExpenseCatalogResponse {
  _embedded?: {
    fixedExpenseCatalog?: FixedExpenseCatalogApiResponse[]
  }
  _links?: any
  page?: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export class ApiFixedExpenseCatalogRepository implements FixedExpenseCatalogRepository {
  async findAll(): Promise<FixedExpenseCatalog[]> {
    try {
      const response = await apiClient.get<PagedFixedExpenseCatalogResponse>("/jpa/fixedExpenseCatalog")

      // Handle Spring Data REST paginated response
      const catalogs = response._embedded?.fixedExpenseCatalog || []

      return catalogs.map(this.mapToFixedExpenseCatalog)
    } catch (error) {
      console.error("Error fetching fixed expense catalogs:", error)
      return []
    }
  }

  async findById(id: number): Promise<FixedExpenseCatalog | null> {
    try {
      const response = await apiClient.get<FixedExpenseCatalogApiResponse>(`/jpa/fixedExpenseCatalog/${id}`)
      return this.mapToFixedExpenseCatalog(response)
    } catch (error) {
      console.error("Error fetching fixed expense catalog:", error)
      return null
    }
  }

  async create(catalog: Omit<FixedExpenseCatalog, "id" | "code">): Promise<FixedExpenseCatalog> {
    try {
      const response = await apiClient.post<FixedExpenseCatalogApiResponse>("/jpa/fixedExpenseCatalog", {
        name: catalog.name,
      })

      return this.mapToFixedExpenseCatalog(response)
    } catch (error) {
      console.error("Error creating fixed expense catalog:", error)
      throw error
    }
  }

  async update(id: number, catalog: Partial<FixedExpenseCatalog>): Promise<FixedExpenseCatalog> {
    try {
      const response = await apiClient.put<FixedExpenseCatalogApiResponse>(`/jpa/fixedExpenseCatalog/${id}`, {
        name: catalog.name,
      })

      return this.mapToFixedExpenseCatalog(response)
    } catch (error) {
      console.error("Error updating fixed expense catalog:", error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jpa/fixedExpenseCatalog/${id}`)
    } catch (error) {
      console.error("Error deleting fixed expense catalog:", error)
      throw error
    }
  }

  private mapToFixedExpenseCatalog(apiResponse: FixedExpenseCatalogApiResponse): FixedExpenseCatalog {
    return {
      id: apiResponse.id,
      code: apiResponse.id.toString(), // Use ID as code since API doesn't have separate code field
      name: apiResponse.name,
      active: true, // Default to active since API doesn't specify
    }
  }
}

export const fixedExpenseCatalogRepository = new ApiFixedExpenseCatalogRepository()
