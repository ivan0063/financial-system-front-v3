import type { Debt } from "../entities/debt"

export interface ExtractDebtsFromStatementUseCase {
  execute(
    debtAccountCode: string,
    file: File,
    statementType: "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL",
  ): Promise<Debt[]>
}
