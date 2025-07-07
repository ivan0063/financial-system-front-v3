import type { FixedExpense } from "../entities/fixed-expense"

export interface FixedExpenseRepository {
  findAll(): Promise<FixedExpense[]>
  findByUserId(userId: string): Promise<FixedExpense[]>
  create(expense: Omit<FixedExpense, "id">): Promise<FixedExpense>
  update(id: number, expense: Partial<FixedExpense>): Promise<FixedExpense>
  delete(id: number): Promise<void>
}
