import type { Debt } from "../entities/debt"

export interface DebtRepository {
  findAll(): Promise<Debt[]>
  findByDebtAccountCode(debtAccountCode: string): Promise<Debt[]>
  create(debt: Omit<Debt, "id" | "createdAt" | "updatedAt">): Promise<Debt>
  update(id: number, debt: Partial<Debt>): Promise<Debt>
  delete(id: number): Promise<void>
  addDebtsToAccount(debtAccountCode: string, debts: Debt[]): Promise<string>
  payOffDebts(debtAccountCode: string): Promise<string>
}
