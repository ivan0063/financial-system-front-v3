"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  CreditCard,
  DollarSign,
  FileText,
  Building2,
  FolderOpen,
  User,
  ChevronRight,
  Wallet,
  AlertTriangle,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Debt Management",
    icon: Wallet,
    items: [
      {
        title: "Debt Accounts",
        url: "/debt-accounts",
        icon: CreditCard,
      },
      {
        title: "Debts",
        url: "/debts",
        icon: DollarSign,
      },
    ],
  },
  {
    title: "Financial Providers",
    icon: Building2,
    items: [
      {
        title: "Providers",
        url: "/financial-providers",
        icon: Building2,
      },
      {
        title: "Provider Catalogs",
        url: "/financial-provider-catalogs",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "Fixed Expenses",
    icon: FileText,
    items: [
      {
        title: "Expenses",
        url: "/fixed-expenses",
        icon: FileText,
      },
      {
        title: "Expense Catalogs",
        url: "/fixed-expense-catalogs",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Error Monitor",
    url: "/error-monitor",
    icon: AlertTriangle,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Wallet className="h-6 w-6" />
          <span className="font-semibold">Debt Control</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.items.some((subItem) => pathname === subItem.url)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
