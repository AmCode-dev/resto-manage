"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  RefreshCw,
  Search,
  Users,
  ShoppingCart,
  Calendar,
  Menu,
  Package,
  CreditCard,
  Settings,
  UserCheck,
  MapPin,
  Coffee,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  LogIn,
  LogOut,
  DollarSign,
  Merge,
  Move,
} from "lucide-react"

// Types for activity system
type ActivityType =
  | "pedidos"
  | "reservas"
  | "menu"
  | "empleados"
  | "inventario"
  | "pos"
  | "sistema"
  | "clientes"
  | "espacio"
  | "bartending"

type ActionType =
  | "crear"
  | "editar"
  | "eliminar"
  | "completar"
  | "cancelar"
  | "confirmar"
  | "rechazar"
  | "login"
  | "logout"
  | "pago"
  | "fusionar"
  | "mover"

type ActivityStatus = "success" | "warning" | "error" | "info"

interface ActivityItem {
  id: string
  type: ActivityType
  action: ActionType
  title: string
  description: string
  user: string
  timestamp: Date
  status: ActivityStatus
  metadata?: Record<string, any>
}

// Mock data for activities
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "pedidos",
    action: "crear",
    title: "Nuevo pedido #1234",
    description: "Mesa 5 - Pedido por $45.50",
    user: "Ana García",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: "success",
    metadata: { mesa: 5, total: 45.5 },
  },
  {
    id: "2",
    type: "reservas",
    action: "confirmar",
    title: "Reserva confirmada",
    description: "Mesa para 4 personas - 19:30",
    user: "Carlos López",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: "success",
    metadata: { personas: 4, hora: "19:30" },
  },
  {
    id: "3",
    type: "menu",
    action: "editar",
    title: "Precio actualizado",
    description: "Pasta Carbonara - Nuevo precio $18.00",
    user: "María Rodríguez",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: "info",
    metadata: { plato: "Pasta Carbonara", precio: 18.0 },
  },
  {
    id: "4",
    type: "empleados",
    action: "login",
    title: "Inicio de sesión",
    description: "Empleado inició turno",
    user: "Pedro Martínez",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: "info",
  },
  {
    id: "5",
    type: "inventario",
    action: "editar",
    title: "Stock actualizado",
    description: "Tomates - Stock bajo (5 unidades)",
    user: "Sistema",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: "warning",
    metadata: { producto: "Tomates", stock: 5 },
  },
  {
    id: "6",
    type: "pos",
    action: "pago",
    title: "Pago procesado",
    description: "Mesa 3 - Pago con tarjeta $32.75",
    user: "Ana García",
    timestamp: new Date(Date.now() - 75 * 60 * 1000),
    status: "success",
    metadata: { mesa: 3, metodo: "tarjeta", total: 32.75 },
  },
  {
    id: "7",
    type: "espacio",
    action: "fusionar",
    title: "Mesas fusionadas",
    description: "Mesa 7 y Mesa 8 fusionadas para grupo grande",
    user: "Carlos López",
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    status: "info",
    metadata: { mesas: [7, 8] },
  },
  {
    id: "8",
    type: "bartending",
    action: "completar",
    title: "Bebida preparada",
    description: "Mojito - Mesa 2",
    user: "Luis Fernández",
    timestamp: new Date(Date.now() - 105 * 60 * 1000),
    status: "success",
    metadata: { bebida: "Mojito", mesa: 2 },
  },
  {
    id: "9",
    type: "clientes",
    action: "crear",
    title: "Nuevo cliente registrado",
    description: "Cliente agregado al programa de fidelización",
    user: "María Rodríguez",
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
    status: "success",
  },
  {
    id: "10",
    type: "sistema",
    action: "editar",
    title: "Configuración actualizada",
    description: "Horarios de operación modificados",
    user: "Admin",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "info",
  },
]

// Configuration for activity types and actions
const activityConfig = {
  types: {
    pedidos: { label: "Pedidos", icon: ShoppingCart, color: "bg-blue-500" },
    reservas: { label: "Reservas", icon: Calendar, color: "bg-green-500" },
    menu: { label: "Menú", icon: Menu, color: "bg-orange-500" },
    empleados: { label: "Empleados", icon: Users, color: "bg-purple-500" },
    inventario: { label: "Inventario", icon: Package, color: "bg-yellow-500" },
    pos: { label: "POS", icon: CreditCard, color: "bg-indigo-500" },
    sistema: { label: "Sistema", icon: Settings, color: "bg-gray-500" },
    clientes: { label: "Clientes", icon: UserCheck, color: "bg-pink-500" },
    espacio: { label: "Espacio", icon: MapPin, color: "bg-teal-500" },
    bartending: { label: "Bartending", icon: Coffee, color: "bg-amber-500" },
  },
  actions: {
    crear: { label: "Crear", icon: Plus },
    editar: { label: "Editar", icon: Edit },
    eliminar: { label: "Eliminar", icon: Trash2 },
    completar: { label: "Completar", icon: Check },
    cancelar: { label: "Cancelar", icon: X },
    confirmar: { label: "Confirmar", icon: CheckCircle },
    rechazar: { label: "Rechazar", icon: XCircle },
    login: { label: "Login", icon: LogIn },
    logout: { label: "Logout", icon: LogOut },
    pago: { label: "Pago", icon: DollarSign },
    fusionar: { label: "Fusionar", icon: Merge },
    mover: { label: "Mover", icon: Move },
  },
  status: {
    success: { label: "Éxito", color: "bg-green-100 text-green-800", icon: CheckCircle },
    warning: { label: "Advertencia", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
    error: { label: "Error", color: "bg-red-100 text-red-800", icon: XCircle },
    info: { label: "Información", color: "bg-blue-100 text-blue-800", icon: Info },
  },
}

export default function ActividadPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    return mockActivities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === "all" || activity.type === filterType
      const matchesStatus = filterStatus === "all" || activity.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchTerm, filterType, filterStatus])

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {}

    filteredActivities.forEach((activity) => {
      const date = activity.timestamp.toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })

    // Sort groups by date (most recent first)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())

    return sortedGroups
  }, [filteredActivities])

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayActivities = mockActivities.filter((a) => a.timestamp.toDateString() === today)
    const pedidosHoy = todayActivities.filter((a) => a.type === "pedidos").length
    const usuariosActivos = new Set(mockActivities.map((a) => a.user)).size

    return {
      actividadesHoy: todayActivities.length,
      pedidosProcesados: pedidosHoy,
      usuariosActivos,
      sistemaEstado: "Operativo",
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    if (dateString === today) return "Hoy"
    if (dateString === yesterday) return "Ayer"
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actividad del Sistema</h1>
          <p className="text-gray-600">Monitorea todas las operaciones de tu restaurante en tiempo real</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades Hoy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.actividadesHoy}</div>
            <p className="text-xs text-muted-foreground">Operaciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Procesados</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pedidosProcesados}</div>
            <p className="text-xs text-muted-foreground">Transacciones completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usuariosActivos}</div>
            <p className="text-xs text-muted-foreground">Empleados únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sistemaEstado}</div>
            <p className="text-xs text-muted-foreground">Todos los servicios funcionando</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
          <CardDescription>Encuentra actividades específicas usando los filtros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, descripción o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(activityConfig.types).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(activityConfig.status).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividades</CardTitle>
          <CardDescription>{filteredActivities.length} actividades encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {groupedActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron actividades</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedActivities.map(([date, activities]) => (
                  <div key={date}>
                    <div className="flex items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{formatDate(date)}</h3>
                      <Separator className="ml-4 flex-1" />
                    </div>
                    <div className="space-y-3">
                      {activities.map((activity) => {
                        const typeConfig = activityConfig.types[activity.type]
                        const actionConfig = activityConfig.actions[activity.action]
                        const statusConfig = activityConfig.status[activity.status]
                        const TypeIcon = typeConfig.icon
                        const StatusIcon = statusConfig.icon

                        return (
                          <div
                            key={activity.id}
                            className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className={`p-2 rounded-full ${typeConfig.color}`}>
                              <TypeIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className={statusConfig.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary">{typeConfig.label}</Badge>
                                  <Badge variant="outline">{actionConfig.label}</Badge>
                                </div>
                                <span className="text-xs text-gray-500">por {activity.user}</span>
                              </div>
                              {activity.metadata && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {Object.entries(activity.metadata).map(([key, value]) => (
                                    <span key={key} className="mr-3">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
