import type { DebtAccount } from "../entities/debt-account"

export interface DebtAccountRepository {
  findAll(): Promise<DebtAccount[]>
  findByCode(code: string): Promise<DebtAccount | null>
  create(debtAccount: Omit<DebtAccount, "createdAt" | "updatedAt">): Promise<DebtAccount>
  update(code: string, debtAccount: Partial<DebtAccount>): Promise<DebtAccount>
  delete(code: string): Promise<void>
  getStatus(code: string): Promise<string>
}
