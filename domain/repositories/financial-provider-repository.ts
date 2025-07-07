import type { FinancialProvider } from "../entities/financial-provider"

export interface FinancialProviderRepository {
  findAll(): Promise<FinancialProvider[]>
  findByCode(code: string): Promise<FinancialProvider | null>
  create(provider: Omit<FinancialProvider, "createdAt" | "updatedAt">): Promise<FinancialProvider>
  update(code: string, provider: Partial<FinancialProvider>): Promise<FinancialProvider>
  delete(code: string): Promise<void>
}
