export interface GetFinancialStatusUseCase {
  execute(email: string): Promise<string>
}
