import type {
  FixedExpenseCatalog,
  CreateFixedExpenseCatalogRequest,
  UpdateFixedExpenseCatalogRequest,
} from "../entities/fixed-expense-catalog"

export interface FixedExpenseCatalogRepository {
  findAll(): Promise<FixedExpenseCatalog[]>
  findById(id: number): Promise<FixedExpenseCatalog | null>
  create(catalog: CreateFixedExpenseCatalogRequest): Promise<FixedExpenseCatalog>
  update(catalog: UpdateFixedExpenseCatalogRequest): Promise<FixedExpenseCatalog>
  delete(id: number): Promise<void>
}
