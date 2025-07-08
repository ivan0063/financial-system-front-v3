"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Home, CreditCard, Receipt, Building2, DollarSign, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Debt Accounts", href: "/debt-accounts", icon: CreditCard },
  { name: "Debts", href: "/debts", icon: Receipt },
  { name: "Financial Providers", href: "/financial-providers", icon: Building2 },
  { name: "Fixed Expenses", href: "/fixed-expenses", icon: DollarSign },
  { name: "Provider Catalogs", href: "/financial-provider-catalogs", icon: Settings },
  { name: "Expense Catalogs", href: "/fixed-expense-catalogs", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline-block font-bold text-lg">Debt Control</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("flex items-center gap-2", isActive(item.href) && "bg-secondary")}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">Debt Control</span>
                  </div>
                </div>

                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive(item.href) ? "secondary" : "ghost"}
                          className={cn("w-full justify-start gap-3 h-12", isActive(item.href) && "bg-secondary")}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                          {isActive(item.href) && (
                            <Badge variant="secondary" className="ml-auto">
                              Active
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
