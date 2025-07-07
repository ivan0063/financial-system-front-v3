export interface FixedExpenseCatalog {
  id: number
  name: string
  fixedExpenses?: string[]
}

export interface CreateFixedExpenseCatalogRequest {
  name: string
  fixedExpenses?: string[]
}

export interface UpdateFixedExpenseCatalogRequest {
  id: number
  name: string
  fixedExpenses?: string[]
}
