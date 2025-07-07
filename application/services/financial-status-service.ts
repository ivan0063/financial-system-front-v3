import type { GetFinancialStatusUseCase } from "@/domain/use-cases/get-financial-status"
import { apiClient } from "@/infrastructure/api/api-client"

export class FinancialStatusService implements GetFinancialStatusUseCase {
  async execute(email: string): Promise<string> {
    return apiClient.get<string>(`/financial/status/${email}`)
  }
}
