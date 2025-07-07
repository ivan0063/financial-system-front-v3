export interface Debt {
  id: number
  description: string
  operationDate: string
  currentInstallment: number
  maxFinancingTerm: number
  originalAmount: number
  monthlyPayment: number
  createdAt: string
  updatedAt: string
  active: boolean
}
