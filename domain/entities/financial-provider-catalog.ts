export interface FinancialProviderCatalog {
  id: number
  name: string
  financialProviders?: string[]
}

export interface CreateFinancialProviderCatalogRequest {
  name: string
  financialProviders?: string[]
}

export interface UpdateFinancialProviderCatalogRequest {
  id: number
  name: string
  financialProviders?: string[]
}
