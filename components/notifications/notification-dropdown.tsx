"use client"

import { useState } from "react"
import { Bell, Check, Clock, Coffee, Utensils, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Tipos de notificaciones
export type NotificationType = "table" | "kitchen" | "bar" | "system" | "urgent"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  time: Date
  read: boolean
  actionUrl?: string
}

// Componente para el icono de la notificación según su tipo
const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "table":
      return <Users className="h-4 w-4 text-blue-500" />
    case "kitchen":
      return <Utensils className="h-4 w-4 text-green-500" />
    case "bar":
      return <Coffee className="h-4 w-4 text-amber-500" />
    case "system":
      return <Bell className="h-4 w-4 text-gray-500" />
    case "urgent":
      return <Bell className="h-4 w-4 text-red-500" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

// Datos de ejemplo para notificaciones
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "table",
    title: "Mesa 5 solicita atención",
    message: "Los clientes de la mesa 5 están llamando a un camarero",
    time: new Date(Date.now() - 1000 * 60 * 2), // 2 minutos atrás
    read: false,
    actionUrl: "/dashboard/espacio?table=5",
  },
  {
    id: "2",
    type: "kitchen",
    title: "Pedido listo para servir",
    message: "El pedido #1234 para la mesa 3 está listo para ser servido",
    time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
    read: false,
    actionUrl: "/dashboard/pedidos/1234",
  },
  {
    id: "3",
    type: "bar",
    title: "Bebidas preparadas",
    message: "Las bebidas para la mesa 7 están listas",
    time: new Date(Date.now() - 1000 * 60 * 10), // 10 minutos atrás
    read: true,
    actionUrl: "/dashboard/bartending",
  },
  {
    id: "4",
    type: "system",
    title: "Actualización de inventario",
    message: "El stock de 'Vino tinto reserva' está por debajo del mínimo",
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    read: true,
    actionUrl: "/dashboard/inventario-bebidas",
  },
  {
    id: "5",
    type: "urgent",
    title: "¡Reserva inminente!",
    message: "Reserva para 8 personas llegará en 15 minutos. Mesa 12 no está preparada",
    time: new Date(Date.now() - 1000 * 60 * 15), // 15 minutos atrás
    read: false,
    actionUrl: "/dashboard/reservas",
  },
]

// Función para formatear el tiempo relativo
const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Marcar como leída una notificación
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Eliminar una notificación
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base">Notificaciones</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                  <div
                    className={cn(
                      "flex w-full cursor-default gap-2 p-3 hover:bg-muted",
                      !notification.read && "bg-muted/50",
                    )}
                  >
                    <div className="mt-1">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <Check className="h-3 w-3" />
                              <span className="sr-only">Marcar como leída</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(notification.time)}</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium">No hay notificaciones</p>
              <p className="text-xs text-muted-foreground">Las notificaciones aparecerán aquí cuando haya actividad</p>
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link href="/dashboard/notificaciones" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full justify-center bg-transparent">
              Ver todas las notificaciones
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
