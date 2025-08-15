"use client"

import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Settings,
  ChefHat,
  Wine,
  CreditCard,
  Activity,
  Bell,
  MapPin,
  BarChart3,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Punto de Venta",
    url: "/dashboard/pos",
    icon: CreditCard,
  },
  {
    title: "Pedidos",
    url: "/dashboard/pedidos",
    icon: ShoppingCart,
  },
  {
    title: "Reservas",
    url: "/dashboard/reservas",
    icon: Calendar,
  },
  {
    title: "Espacio",
    url: "/dashboard/espacio",
    icon: MapPin,
  },
]

const inventoryItems = [
  {
    title: "Inventario Comidas",
    url: "/dashboard/inventario-comidas",
    icon: Package,
  },
  {
    title: "Inventario Bebidas",
    url: "/dashboard/inventario-bebidas",
    icon: Wine,
  },
  {
    title: "Menús",
    url: "/dashboard/menus",
    icon: ChefHat,
  },
]

const managementItems = [
  {
    title: "Empleados",
    url: "/dashboard/empleados",
    icon: Users,
  },
  {
    title: "Clientes",
    url: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Finanzas",
    url: "/dashboard/finanzas",
    icon: BarChart3,
  },
  {
    title: "Actividad",
    url: "/dashboard/actividad",
    icon: Activity,
  },
]

const kitchenItems = [
  {
    title: "Bartending",
    url: "/dashboard/bartending",
    icon: Wine,
  },
]

const systemItems = [
  {
    title: "Notificaciones",
    url: "/dashboard/notificaciones",
    icon: Bell,
  },
  {
    title: "Configuración",
    url: "/dashboard/configuracion",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { empleado } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>
              {empleado?.nombre?.[0]}
              {empleado?.apellido?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {empleado?.nombre} {empleado?.apellido}
            </span>
            <span className="text-xs text-muted-foreground">{empleado?.cargo}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Inventario</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {inventoryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cocina</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {kitchenItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">Resto Manage Platform v1.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
