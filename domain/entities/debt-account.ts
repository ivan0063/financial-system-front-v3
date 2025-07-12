export interface DebtAccount {
  code: string
  name: string
  payDay: number
  credit: number
  createdAt: string
  updatedAt: string
  active: boolean
  accountStatementType: "MERCADO_PAGO" | "RAPPI" | "UNIVERSAL" | "MANUAL"
  financialProvider?: {
    code: string
    name: string
    active: boolean
  }
}
