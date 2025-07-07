import type {
  FinancialProviderCatalog,
  CreateFinancialProviderCatalogRequest,
  UpdateFinancialProviderCatalogRequest,
} from "../entities/financial-provider-catalog"

export interface FinancialProviderCatalogRepository {
  findAll(): Promise<FinancialProviderCatalog[]>
  findById(id: number): Promise<FinancialProviderCatalog | null>
  create(catalog: CreateFinancialProviderCatalogRequest): Promise<FinancialProviderCatalog>
  update(catalog: UpdateFinancialProviderCatalogRequest): Promise<FinancialProviderCatalog>
  delete(id: number): Promise<void>
}
