import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger />
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">jimm0063@gmail.com</span>
        </div>
      </div>
    </header>
  )
}
