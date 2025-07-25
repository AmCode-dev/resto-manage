"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Clock, Coffee, Filter, Search, Trash2, Utensils, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Notification, NotificationType } from "@/components/notifications/notification-dropdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

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
  {
    id: "6",
    type: "table",
    title: "Mesa 8 solicita la cuenta",
    message: "Los clientes de la mesa 8 han solicitado la cuenta",
    time: new Date(Date.now() - 1000 * 60 * 8), // 8 minutos atrás
    read: false,
    actionUrl: "/dashboard/pos?table=8",
  },
  {
    id: "7",
    type: "kitchen",
    title: "Pedido modificado",
    message: "El pedido #1235 para la mesa 6 ha sido modificado por el cliente",
    time: new Date(Date.now() - 1000 * 60 * 12), // 12 minutos atrás
    read: true,
    actionUrl: "/dashboard/pedidos/1235",
  },
  {
    id: "8",
    type: "system",
    title: "Nuevo empleado registrado",
    message: "El usuario 'Carlos Rodríguez' ha sido registrado en el sistema",
    time: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
    read: true,
    actionUrl: "/dashboard/empleados",
  },
  {
    id: "9",
    type: "urgent",
    title: "Problema en cocina",
    message: "Se ha reportado un problema con el horno principal",
    time: new Date(Date.now() - 1000 * 60 * 25), // 25 minutos atrás
    read: false,
    actionUrl: "/dashboard/cocina",
  },
  {
    id: "10",
    type: "bar",
    title: "Stock bajo de cerveza",
    message: "Quedan menos de 5 unidades de 'IPA Artesanal'",
    time: new Date(Date.now() - 1000 * 60 * 45), // 45 minutos atrás
    read: true,
    actionUrl: "/dashboard/inventario-bebidas",
  },
]

// Componente para el icono de la notificación según su tipo
const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "table":
      return <Users className="h-5 w-5 text-blue-500" />
    case "kitchen":
      return <Utensils className="h-5 w-5 text-green-500" />
    case "bar":
      return <Coffee className="h-5 w-5 text-amber-500" />
    case "system":
      return <Bell className="h-5 w-5 text-gray-500" />
    case "urgent":
      return <Bell className="h-5 w-5 text-red-500" />
    default:
      return <Bell className="h-5 w-5" />
  }
}

// Función para formatear el tiempo relativo
const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`
}

// Función para formatear la fecha completa
const formatFullDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Componente para el badge del tipo de notificación
const TypeBadge = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "table":
      return <Badge variant="info">Mesa</Badge>
    case "kitchen":
      return <Badge variant="success">Cocina</Badge>
    case "bar":
      return <Badge variant="warning">Bar</Badge>
    case "system":
      return <Badge variant="secondary">Sistema</Badge>
    case "urgent":
      return <Badge variant="destructive">Urgente</Badge>
    default:
      return <Badge>Desconocido</Badge>
  }
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all")

  // Filtrar notificaciones según la pestaña activa
  const filteredNotifications = notifications.filter((notification) => {
    // Filtro por estado de lectura
    if (activeTab === "unread" && notification.read) return false
    if (activeTab === "read" && !notification.read) return false

    // Filtro por tipo
    if (typeFilter !== "all" && notification.type !== typeFilter) return false

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return notification.title.toLowerCase().includes(query) || notification.message.toLowerCase().includes(query)
    }

    return true
  })

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

  // Eliminar todas las notificaciones
  const removeAllNotifications = () => {
    setNotifications([])
  }

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                  <Bell className="mr-2 h-4 w-4" />
                  Todos los tipos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("table")}>
                  <Users className="mr-2 h-4 w-4 text-blue-500" />
                  Mesas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("kitchen")}>
                  <Utensils className="mr-2 h-4 w-4 text-green-500" />
                  Cocina
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("bar")}>
                  <Coffee className="mr-2 h-4 w-4 text-amber-500" />
                  Bar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("system")}>
                  <Bell className="mr-2 h-4 w-4 text-gray-500" />
                  Sistema
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("urgent")}>
                  <Bell className="mr-2 h-4 w-4 text-red-500" />
                  Urgentes
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="destructive" onClick={removeAllNotifications}>
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar todo
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar notificaciones..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="all">
            Todas
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            No leídas
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="read">
            Leídas
            <Badge variant="secondary" className="ml-2">
              {notifications.length - unreadCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las notificaciones</CardTitle>
              <CardDescription>Visualiza y gestiona todas tus notificaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList
                notifications={filteredNotifications}
                markAsRead={markAsRead}
                removeNotification={removeNotification}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones no leídas</CardTitle>
              <CardDescription>Notificaciones que requieren tu atención</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList
                notifications={filteredNotifications}
                markAsRead={markAsRead}
                removeNotification={removeNotification}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="read" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones leídas</CardTitle>
              <CardDescription>Notificaciones que ya has revisado</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationList
                notifications={filteredNotifications}
                markAsRead={markAsRead}
                removeNotification={removeNotification}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface NotificationListProps {
  notifications: Notification[]
  markAsRead: (id: string) => void
  removeNotification: (id: string) => void
}

function NotificationList({ notifications, markAsRead, removeNotification }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No hay notificaciones</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No hay notificaciones que coincidan con los filtros actuales
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "relative rounded-lg border p-4 transition-colors",
              notification.read ? "bg-background" : "bg-muted/50",
            )}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <NotificationIcon type={notification.type} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={cn("text-base font-medium", !notification.read && "font-semibold")}>
                      {notification.title}
                    </h3>
                    <TypeBadge type={notification.type} />
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Marcar como leída</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{notification.message}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span title={formatFullDate(notification.time)}>{formatRelativeTime(notification.time)}</span>
                  </div>
                  {notification.actionUrl && (
                    <Link href={notification.actionUrl}>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        Ver detalles
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
