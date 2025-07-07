"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CreditCard, DollarSign, FileText, Building2, LayoutDashboard, FolderOpen, User } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Debt Accounts", href: "/debt-accounts", icon: CreditCard },
  { name: "Debts", href: "/debts", icon: DollarSign },
  { name: "Fixed Expenses", href: "/fixed-expenses", icon: FileText },
  { name: "Financial Providers", href: "/financial-providers", icon: Building2 },
  { name: "Provider Catalogs", href: "/financial-provider-catalogs", icon: FolderOpen },
  { name: "Expense Catalogs", href: "/fixed-expense-catalogs", icon: FolderOpen },
  { name: "Profile", href: "/profile", icon: User },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-4">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
