export interface FinancialProvider {
  id: number
  code: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  financialProviderCatalog?: string // URI to the catalog
}

export interface CreateFinancialProviderRequest {
  code: string
  name: string
  active: boolean
  financialProviderCatalog: string // URI to the catalog
}

export interface UpdateFinancialProviderRequest {
  id: number
  code: string
  name: string
  active: boolean
  financialProviderCatalog?: string // URI to the catalog
}
