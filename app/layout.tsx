import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/presentation/components/layout/app-sidebar"
import { ErrorNotificationSystem } from "@/presentation/components/notifications/error-notification-system"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Debt Control System",
  description: "Manage your debts, accounts, and financial providers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarProvider>
        <ErrorNotificationSystem />
      </body>
    </html>
  )
}
