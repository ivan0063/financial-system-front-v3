import type React from "react"

interface FinancialProvider {
  id: string
  name: string
  financialProviderCatalog?: {
    code?: string
    description?: string
    category?: string
  }
}

interface FinancialProviderListProps {
  providers: FinancialProvider[]
}

const FinancialProviderList: React.FC<FinancialProviderListProps> = ({ providers }) => {
  return (
    <ul>
      {providers.map((provider) => (
        <li key={provider.id}>
          {provider.name} - Code: {provider.financialProviderCatalog?.code || "N/A"}, Description:{" "}
          {provider.financialProviderCatalog?.description || "N/A"}, Category:{" "}
          {provider.financialProviderCatalog?.category || "N/A"}
        </li>
      ))}
    </ul>
  )
}

export default FinancialProviderList
