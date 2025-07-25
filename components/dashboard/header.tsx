"use client"

import { useState } from "react"
import { MobileMenuButton } from "@/components/dashboard/sidebar"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Settings, User } from "lucide-react"

interface HeaderProps {
  onOpenSidebar: () => void
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <MobileMenuButton onClick={onOpenSidebar} />
        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-[200px] pl-8 md:w-[300px]"
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          </div>
        ) : (
          <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => setShowSearch(true)}>
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configuración</span>
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">Perfil</span>
        </Button>
      </div>
    </header>
  )
}
