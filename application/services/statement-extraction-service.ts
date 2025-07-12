import type { ExtractDebtsFromStatementUseCase } from "@/domain/use-cases/extract-debts-from-statement"
import type { Debt } from "@/domain/entities/debt"
import { apiClient } from "@/infrastructure/api/api-client"

export class StatementExtractionService implements ExtractDebtsFromStatementUseCase {
  async execute(
    debtAccountCode: string,
    file: File,
    statementType: "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL",
  ): Promise<Debt[]> {
    return apiClient.uploadFile<Debt[]>(
      `/account/statement/extract/${debtAccountCode}?accountStatementType=${statementType}`,
      file,
    )
  }
}
