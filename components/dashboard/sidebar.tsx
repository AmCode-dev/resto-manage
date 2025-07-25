"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Utensils,
  ChefHat,
  Wine,
  CalendarDays,
  BarChart3,
  Map,
  ShoppingBag,
  Coffee,
  Store,
  LogOut,
  Menu,
  X,
  Gift,
  Bell,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose, className, ...props }: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Cerrar sidebar en móvil cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      onClose()
    }
  }, [pathname, isMobile, onClose])

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r bg-card p-4 transition-transform duration-200 md:static md:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            <span className="text-xl font-bold">RestoManage</span>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1">
            <Link href="/dashboard">
              <Button variant={pathname === "/dashboard" ? "default" : "ghost"} className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            <Link href="/dashboard/empleados">
              <Button
                variant={pathname === "/dashboard/empleados" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Empleados
              </Button>
            </Link>

            <Link href="/dashboard/clientes">
              <Button
                variant={pathname === "/dashboard/clientes" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Gift className="mr-2 h-4 w-4" />
                Fidelización
              </Button>
            </Link>

            <Link href="/dashboard/menus">
              <Button variant={pathname === "/dashboard/menus" ? "default" : "ghost"} className="w-full justify-start">
                <Utensils className="mr-2 h-4 w-4" />
                Menús
              </Button>
            </Link>

            <Link href="/dashboard/pedidos">
              <Button
                variant={pathname === "/dashboard/pedidos" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Pedidos
              </Button>
            </Link>

            <Link href="/dashboard/pos">
              <Button variant={pathname === "/dashboard/pos" ? "default" : "ghost"} className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Punto de Venta
              </Button>
            </Link>

            <Link href="/dashboard/inventario-comidas">
              <Button
                variant={pathname === "/dashboard/inventario-comidas" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Inventario Comidas
              </Button>
            </Link>

            <Link href="/dashboard/inventario-bebidas">
              <Button
                variant={pathname === "/dashboard/inventario-bebidas" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Wine className="mr-2 h-4 w-4" />
                Inventario Bebidas
              </Button>
            </Link>

            <Link href="/dashboard/bartending">
              <Button
                variant={pathname === "/dashboard/bartending" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Coffee className="mr-2 h-4 w-4" />
                Bartending
              </Button>
            </Link>

            <Link href="/dashboard/reservas">
              <Button
                variant={pathname === "/dashboard/reservas" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Reservas
              </Button>
            </Link>

            <Link href="/dashboard/notificaciones">
              <Button
                variant={pathname === "/dashboard/notificaciones" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notificaciones
              </Button>
            </Link>

            <Link href="/dashboard/finanzas">
              <Button
                variant={pathname === "/dashboard/finanzas" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Finanzas
              </Button>
            </Link>

            <Link href="/dashboard/espacio">
              <Button
                variant={pathname === "/dashboard/espacio" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Map className="mr-2 h-4 w-4" />
                Espacio
              </Button>
            </Link>
          </nav>
        </ScrollArea>

        <div className="mt-auto border-t pt-4">
          <Link href="/dashboard/configuracion">
            <Button
              variant={pathname === "/dashboard/configuracion" ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="md:hidden">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Menu</span>
    </Button>
  )
}
