"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  Search,
  Wine,
  Coffee,
  CoffeeIcon as Cocktail,
  Beer,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Home,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos
type EstadoBebida = "Pendiente" | "En preparación" | "Lista para servir" | "Entregada" | "Cancelada"
type TipoServicio = "Para llevar" | "Para servir en mesa"

interface Bebida {
  id: number
  nombre: string
  categoria: string
  tiempoPreparacion: string
  dificultad: "Fácil" | "Media" | "Difícil"
  ingredientes: string[]
  pasos: string[]
  imagen?: string
  presentacionFinal?: string
}

interface PedidoBebida {
  id: number
  numeroPedido: number
  mesa?: number
  cliente: string
  bebida: Bebida
  cantidad: number
  estado: EstadoBebida
  tipoServicio: TipoServicio
  horaCreacion: string
  tiempoTranscurrido: string
  bartenderAsignado?: string
  meseroAsignado?: string
  observaciones?: string
  prioridad: "Normal" | "Alta"
}

export default function BartendingPage() {
  const router = useRouter()
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoBebida[]>(pedidosBebidas)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoBebida | null>(null)
  const [dialogoAsignar, setDialogoAsignar] = useState(false)

  // Filtrar pedidos según los criterios seleccionados
  const filtrarPedidos = () => {
    return pedidosBebidas.filter((pedido) => {
      // Filtro por estado
      if (filtroEstado !== "todos" && pedido.estado !== filtroEstado) {
        return false
      }

      // Filtro por categoría
      if (filtroCategoria !== "todos" && pedido.bebida.categoria !== filtroCategoria) {
        return false
      }

      // Filtro por búsqueda (cliente, mesa, bebida)
      if (busqueda) {
        const searchLower = busqueda.toLowerCase()
        const clienteLower = pedido.cliente.toLowerCase()
        const bebidaLower = pedido.bebida.nombre.toLowerCase()
        const mesaStr = pedido.mesa?.toString() || ""

        return clienteLower.includes(searchLower) || bebidaLower.includes(searchLower) || mesaStr.includes(searchLower)
      }

      return true
    })
  }

  // Actualizar pedidos filtrados cuando cambian los filtros
  const actualizarFiltros = () => {
    setPedidosFiltrados(filtrarPedidos())
  }

  // Cambiar estado de un pedido
  const cambiarEstadoPedido = (pedidoId: number, nuevoEstado: EstadoBebida) => {
    const pedidosActualizados = pedidosBebidas.map((pedido) =>
      pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido,
    )

    // En una app real, aquí enviaríamos la actualización al backend
    console.log(`Cambiando estado del pedido ${pedidoId} a ${nuevoEstado}`)

    // Actualizar estado local
    setPedidosFiltrados(
      pedidosActualizados.filter((pedido) => {
        if (filtroEstado !== "todos" && pedido.estado !== filtroEstado) {
          return false
        }
        return true
      }),
    )
  }

  // Asignar bartender a un pedido
  const asignarBartender = (pedidoId: number, bartenderId: string, bartenderNombre: string) => {
    const pedidosActualizados = pedidosBebidas.map((pedido) =>
      pedido.id === pedidoId ? { ...pedido, bartenderAsignado: bartenderNombre } : pedido,
    )

    // En una app real, aquí enviaríamos la actualización al backend
    console.log(`Asignando bartender ${bartenderNombre} al pedido ${pedidoId}`)

    // Actualizar estado local
    setPedidosFiltrados(filtrarPedidos())
    setDialogoAsignar(false)
  }

  // Iniciar preparación de bebida
  const iniciarPreparacion = (pedidoId: number) => {
    // Cambiar estado a "En preparación"
    cambiarEstadoPedido(pedidoId, "En preparación")

    // Navegar a la vista de preparación
    router.push(`/dashboard/bartending/preparacion/${pedidoId}`)
  }

  // Calcular totales para el resumen
  const totalPedidos = pedidosFiltrados.length
  const pedidosPendientes = pedidosFiltrados.filter((p) => p.estado === "Pendiente").length
  const pedidosEnPreparacion = pedidosFiltrados.filter((p) => p.estado === "En preparación").length
  const pedidosListos = pedidosFiltrados.filter((p) => p.estado === "Lista para servir").length

  // Obtener icono según la categoría
  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "Cócteles":
        return <Cocktail className="h-5 w-5" />
      case "Vinos":
        return <Wine className="h-5 w-5" />
      case "Cervezas":
        return <Beer className="h-5 w-5" />
      case "Café":
        return <Coffee className="h-5 w-5" />
      default:
        return <Wine className="h-5 w-5" />
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bartending</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </div>

      {/* Resumen de pedidos */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-sm font-medium text-amber-700">Pendientes</div>
            <div className="text-3xl font-bold text-amber-700">{pedidosPendientes}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Cocktail className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-sm font-medium text-blue-700">En preparación</div>
            <div className="text-3xl font-bold text-blue-700">{pedidosEnPreparacion}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-sm font-medium text-green-700">Listos</div>
            <div className="text-3xl font-bold text-green-700">{pedidosListos}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Wine className="h-8 w-8 text-gray-500 mb-2" />
            <div className="text-sm font-medium text-gray-700">Total</div>
            <div className="text-3xl font-bold text-gray-700">{totalPedidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente, bebida o mesa..."
            className="pl-8"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              actualizarFiltros()
            }}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filtroEstado}
            onValueChange={(value) => {
              setFiltroEstado(value)
              actualizarFiltros()
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En preparación">En preparación</SelectItem>
              <SelectItem value="Lista para servir">Lista para servir</SelectItem>
              <SelectItem value="Entregada">Entregada</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filtroCategoria}
            onValueChange={(value) => {
              setFiltroCategoria(value)
              actualizarFiltros()
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las categorías</SelectItem>
              <SelectItem value="Cócteles">Cócteles</SelectItem>
              <SelectItem value="Vinos">Vinos</SelectItem>
              <SelectItem value="Cervezas">Cervezas</SelectItem>
              <SelectItem value="Café">Café</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pestañas para tipos de servicio */}
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="mesa">Para servir en mesa</TabsTrigger>
          <TabsTrigger value="llevar">Para llevar</TabsTrigger>
        </TabsList>

        {/* Contenido de la pestaña "Todos" */}
        <TabsContent value="todos" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pedidosFiltrados.map((pedido) => (
              <Card
                key={pedido.id}
                className={`overflow-hidden ${pedido.prioridad === "Alta" ? "border-red-500 shadow-md" : ""}`}
              >
                <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getCategoriaIcon(pedido.bebida.categoria)}
                      {pedido.bebida.nombre}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pedido #{pedido.numeroPedido} - {pedido.tipoServicio}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={`mb-1 ${pedido.prioridad === "Alta" ? "bg-red-500 hover:bg-red-600" : ""}`}>
                      {pedido.estado}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {pedido.tiempoTranscurrido}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Cliente</div>
                      <div className="text-sm">{pedido.cliente}</div>
                    </div>

                    {pedido.mesa && (
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Mesa</div>
                        <div className="text-sm">{pedido.mesa}</div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Cantidad</div>
                      <div className="text-sm">{pedido.cantidad}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Tiempo de preparación</div>
                      <div className="text-sm">{pedido.bebida.tiempoPreparacion}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Dificultad</div>
                      <Badge variant="outline">{pedido.bebida.dificultad}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Bartender</div>
                      <div className="flex items-center gap-2">
                        {pedido.bartenderAsignado ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{pedido.bartenderAsignado.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{pedido.bartenderAsignado}</span>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPedidoSeleccionado(pedido)
                              setDialogoAsignar(true)
                            }}
                          >
                            Asignar
                          </Button>
                        )}
                      </div>
                    </div>

                    {pedido.observaciones && (
                      <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm">
                        <div className="font-medium mb-1">Observaciones:</div>
                        <p className="text-muted-foreground">{pedido.observaciones}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-0 flex flex-col">
                  <div className="grid grid-cols-2 w-full">
                    <Button
                      variant="outline"
                      className="rounded-none h-12 text-base border-0 border-t"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      Ver detalles
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-none h-12 text-base border-0 border-t border-l">
                          Acciones
                          <MoreHorizontal className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {pedido.estado === "Pendiente" && (
                          <DropdownMenuItem onClick={() => iniciarPreparacion(pedido.id)} className="cursor-pointer">
                            Iniciar preparación
                          </DropdownMenuItem>
                        )}
                        {pedido.estado === "En preparación" && (
                          <DropdownMenuItem
                            onClick={() => cambiarEstadoPedido(pedido.id, "Lista para servir")}
                            className="cursor-pointer"
                          >
                            Marcar como lista
                          </DropdownMenuItem>
                        )}
                        {pedido.estado === "Lista para servir" && (
                          <DropdownMenuItem
                            onClick={() => cambiarEstadoPedido(pedido.id, "Entregada")}
                            className="cursor-pointer"
                          >
                            Marcar como entregada
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setPedidoSeleccionado(pedido)
                            setDialogoAsignar(true)
                          }}
                          className="cursor-pointer"
                        >
                          Asignar bartender
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => cambiarEstadoPedido(pedido.id, "Cancelada")}
                          className="text-red-600 cursor-pointer"
                        >
                          Cancelar pedido
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {pedido.estado === "Pendiente" && pedido.bartenderAsignado && (
                    <Button
                      className="w-full h-14 text-base bg-blue-500 hover:bg-blue-600"
                      onClick={() => iniciarPreparacion(pedido.id)}
                    >
                      <Cocktail className="mr-2 h-5 w-5" />
                      Preparar bebida
                    </Button>
                  )}
                  {pedido.estado === "En preparación" && (
                    <Button
                      className="w-full h-14 text-base bg-green-500 hover:bg-green-600"
                      onClick={() => cambiarEstadoPedido(pedido.id, "Lista para servir")}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Marcar como lista
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contenido de la pestaña "Para servir en mesa" */}
        <TabsContent value="mesa" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pedidosFiltrados
              .filter((p) => p.tipoServicio === "Para servir en mesa")
              .map((pedido) => (
                <Card
                  key={pedido.id}
                  className={`overflow-hidden ${pedido.prioridad === "Alta" ? "border-red-500 shadow-md" : ""}`}
                >
                  {/* Contenido similar al de la pestaña "Todos" */}
                  <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoriaIcon(pedido.bebida.categoria)}
                        {pedido.bebida.nombre}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pedido #{pedido.numeroPedido} - Mesa {pedido.mesa}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className={`mb-1 ${pedido.prioridad === "Alta" ? "bg-red-500 hover:bg-red-600" : ""}`}>
                        {pedido.estado}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {pedido.tiempoTranscurrido}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Contenido similar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Cliente</div>
                        <div className="text-sm">{pedido.cliente}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Mesa</div>
                        <div className="text-sm">{pedido.mesa}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Cantidad</div>
                        <div className="text-sm">{pedido.cantidad}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Tiempo de preparación</div>
                        <div className="text-sm">{pedido.bebida.tiempoPreparacion}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Bartender</div>
                        <div className="flex items-center gap-2">
                          {pedido.bartenderAsignado ? (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{pedido.bartenderAsignado.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{pedido.bartenderAsignado}</span>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPedidoSeleccionado(pedido)
                                setDialogoAsignar(true)
                              }}
                            >
                              Asignar
                            </Button>
                          )}
                        </div>
                      </div>

                      {pedido.observaciones && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm">
                          <div className="font-medium mb-1">Observaciones:</div>
                          <p className="text-muted-foreground">{pedido.observaciones}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 flex flex-col">
                    {/* Botones similares */}
                    <div className="grid grid-cols-2 w-full">
                      <Button
                        variant="outline"
                        className="rounded-none h-12 text-base border-0 border-t"
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-none h-12 text-base border-0 border-t border-l"
                        onClick={() => iniciarPreparacion(pedido.id)}
                        disabled={pedido.estado !== "Pendiente" || !pedido.bartenderAsignado}
                      >
                        Preparar
                      </Button>
                    </div>
                    {pedido.estado === "Pendiente" && pedido.bartenderAsignado && (
                      <Button
                        className="w-full h-14 text-base bg-blue-500 hover:bg-blue-600"
                        onClick={() => iniciarPreparacion(pedido.id)}
                      >
                        <Cocktail className="mr-2 h-5 w-5" />
                        Preparar bebida
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Contenido de la pestaña "Para llevar" */}
        <TabsContent value="llevar" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pedidosFiltrados
              .filter((p) => p.tipoServicio === "Para llevar")
              .map((pedido) => (
                <Card
                  key={pedido.id}
                  className={`overflow-hidden ${pedido.prioridad === "Alta" ? "border-red-500 shadow-md" : ""}`}
                >
                  {/* Contenido similar al de la pestaña "Todos" */}
                  <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoriaIcon(pedido.bebida.categoria)}
                        {pedido.bebida.nombre}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Pedido #{pedido.numeroPedido} - Para llevar</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className={`mb-1 ${pedido.prioridad === "Alta" ? "bg-red-500 hover:bg-red-600" : ""}`}>
                        {pedido.estado}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {pedido.tiempoTranscurrido}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Contenido similar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Cliente</div>
                        <div className="text-sm">{pedido.cliente}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Cantidad</div>
                        <div className="text-sm">{pedido.cantidad}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Tiempo de preparación</div>
                        <div className="text-sm">{pedido.bebida.tiempoPreparacion}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Bartender</div>
                        <div className="flex items-center gap-2">
                          {pedido.bartenderAsignado ? (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{pedido.bartenderAsignado.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{pedido.bartenderAsignado}</span>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPedidoSeleccionado(pedido)
                                setDialogoAsignar(true)
                              }}
                            >
                              Asignar
                            </Button>
                          )}
                        </div>
                      </div>

                      {pedido.observaciones && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm">
                          <div className="font-medium mb-1">Observaciones:</div>
                          <p className="text-muted-foreground">{pedido.observaciones}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 flex flex-col">
                    {/* Botones similares */}
                    <div className="grid grid-cols-2 w-full">
                      <Button
                        variant="outline"
                        className="rounded-none h-12 text-base border-0 border-t"
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-none h-12 text-base border-0 border-t border-l"
                        onClick={() => iniciarPreparacion(pedido.id)}
                        disabled={pedido.estado !== "Pendiente" || !pedido.bartenderAsignado}
                      >
                        Preparar
                      </Button>
                    </div>
                    {pedido.estado === "Pendiente" && pedido.bartenderAsignado && (
                      <Button
                        className="w-full h-14 text-base bg-blue-500 hover:bg-blue-600"
                        onClick={() => iniciarPreparacion(pedido.id)}
                      >
                        <Cocktail className="mr-2 h-5 w-5" />
                        Preparar bebida
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles del pedido */}
      {pedidoSeleccionado && (
        <Dialog
          open={!!pedidoSeleccionado && !dialogoAsignar}
          onOpenChange={(open) => !open && setPedidoSeleccionado(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getCategoriaIcon(pedidoSeleccionado.bebida.categoria)}
                {pedidoSeleccionado.bebida.nombre}
              </DialogTitle>
              <DialogDescription>
                Pedido #{pedidoSeleccionado.numeroPedido} - {pedidoSeleccionado.estado}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h4>
                  <p className="font-medium">{pedidoSeleccionado.cliente}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Tipo de servicio</h4>
                  <p className="font-medium">{pedidoSeleccionado.tipoServicio}</p>
                </div>
                {pedidoSeleccionado.mesa && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Mesa</h4>
                    <p className="font-medium">{pedidoSeleccionado.mesa}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Cantidad</h4>
                  <p className="font-medium">{pedidoSeleccionado.cantidad}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Hora de creación</h4>
                  <p className="font-medium">{pedidoSeleccionado.horaCreacion}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Tiempo transcurrido</h4>
                  <p className="font-medium">{pedidoSeleccionado.tiempoTranscurrido}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Bartender asignado</h4>
                  <p className="font-medium">{pedidoSeleccionado.bartenderAsignado || "Sin asignar"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Prioridad</h4>
                  <Badge variant={pedidoSeleccionado.prioridad === "Alta" ? "destructive" : "outline"}>
                    {pedidoSeleccionado.prioridad}
                  </Badge>
                </div>
              </div>

              {pedidoSeleccionado.observaciones && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Observaciones</h4>
                  <p className="text-sm p-2 bg-muted rounded-md">{pedidoSeleccionado.observaciones}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Detalles de la bebida</h4>
                <div className="p-4 border rounded-md space-y-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={pedidoSeleccionado.bebida.imagen || "/placeholder.svg?height=50&width=50"}
                      alt={pedidoSeleccionado.bebida.nombre}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <div className="font-medium">{pedidoSeleccionado.bebida.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        {pedidoSeleccionado.bebida.categoria} - {pedidoSeleccionado.bebida.dificultad}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Ingredientes:</div>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      {pedidoSeleccionado.bebida.ingredientes.map((ingrediente, index) => (
                        <li key={index}>{ingrediente}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Tiempo de preparación:</div>
                    <div className="text-sm">{pedidoSeleccionado.bebida.tiempoPreparacion}</div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {pedidoSeleccionado.estado === "Pendiente" && pedidoSeleccionado.bartenderAsignado && (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => {
                    iniciarPreparacion(pedidoSeleccionado.id)
                    setPedidoSeleccionado(null)
                  }}
                >
                  <Cocktail className="mr-2 h-4 w-4" />
                  Preparar bebida
                </Button>
              )}
              <Button variant="outline" onClick={() => setPedidoSeleccionado(null)} className="w-full sm:w-auto">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para asignar bartender */}
      <Dialog open={dialogoAsignar} onOpenChange={setDialogoAsignar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Bartender</DialogTitle>
            <DialogDescription>Seleccione un bartender para asignar a este pedido.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {bartenders.map((bartender) => (
                <Button
                  key={bartender.id}
                  variant="outline"
                  className="flex justify-start items-center h-auto p-3"
                  onClick={() => {
                    if (pedidoSeleccionado) {
                      asignarBartender(pedidoSeleccionado.id, bartender.id, bartender.nombre)
                    }
                  }}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{bartender.nombre.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{bartender.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {bartender.especialidad} - {bartender.experiencia}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAsignar(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Datos de ejemplo - Bartenders
const bartenders = [
  {
    id: "b1",
    nombre: "Carlos Martínez",
    especialidad: "Cócteles clásicos",
    experiencia: "5 años",
  },
  {
    id: "b2",
    nombre: "Ana López",
    especialidad: "Mixología molecular",
    experiencia: "3 años",
  },
  {
    id: "b3",
    nombre: "Miguel Rodríguez",
    especialidad: "Vinos y destilados",
    experiencia: "7 años",
  },
  {
    id: "b4",
    nombre: "Laura Gómez",
    especialidad: "Cócteles de autor",
    experiencia: "4 años",
  },
]

// Datos de ejemplo - Bebidas
const bebidas: Bebida[] = [
  {
    id: 1,
    nombre: "Mojito",
    categoria: "Cócteles",
    tiempoPreparacion: "5 minutos",
    dificultad: "Fácil",
    ingredientes: [
      "60 ml de ron blanco",
      "30 ml de jugo de lima",
      "2 cucharadas de azúcar",
      "8-10 hojas de menta",
      "Agua con gas",
      "Hielo",
    ],
    pasos: [
      "Colocar las hojas de menta, el azúcar y el jugo de lima en un vaso alto",
      "Machacar suavemente para liberar los aceites de la menta",
      "Agregar hielo hasta 3/4 del vaso",
      "Verter el ron",
      "Completar con agua con gas",
      "Remover suavemente",
      "Decorar con hojas de menta y una rodaja de lima",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en vaso alto con hielo, decorado con menta fresca y rodaja de lima",
  },
  {
    id: 2,
    nombre: "Margarita",
    categoria: "Cócteles",
    tiempoPreparacion: "3 minutos",
    dificultad: "Fácil",
    ingredientes: [
      "60 ml de tequila",
      "30 ml de licor de naranja",
      "30 ml de jugo de limón fresco",
      "Sal para el borde",
      "Hielo",
    ],
    pasos: [
      "Pasar un limón por el borde de la copa y sumergir en sal",
      "En una coctelera, agregar hielo, tequila, licor de naranja y jugo de limón",
      "Agitar vigorosamente durante 15 segundos",
      "Colar en la copa preparada",
      "Decorar con una rodaja de limón",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en copa de margarita con borde escarchado con sal y rodaja de limón",
  },
  {
    id: 3,
    nombre: "Piña Colada",
    categoria: "Cócteles",
    tiempoPreparacion: "4 minutos",
    dificultad: "Media",
    ingredientes: [
      "60 ml de ron blanco",
      "90 ml de jugo de piña",
      "30 ml de crema de coco",
      "Hielo",
      "Rodaja de piña para decorar",
    ],
    pasos: [
      "Colocar todos los ingredientes en una licuadora",
      "Licuar hasta obtener una mezcla homogénea",
      "Servir en un vaso alto",
      "Decorar con una rodaja de piña y una cereza",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en vaso alto o copa hurricane, decorado con rodaja de piña y cereza",
  },
  {
    id: 4,
    nombre: "Negroni",
    categoria: "Cócteles",
    tiempoPreparacion: "2 minutos",
    dificultad: "Fácil",
    ingredientes: ["30 ml de gin", "30 ml de vermut rojo", "30 ml de Campari", "Hielo", "Cáscara de naranja"],
    pasos: [
      "Llenar un vaso bajo con hielo",
      "Agregar el gin, el vermut rojo y el Campari",
      "Remover suavemente",
      "Exprimir la cáscara de naranja sobre el cóctel y dejarla en el vaso",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en vaso bajo con hielo y cáscara de naranja",
  },
  {
    id: 5,
    nombre: "Espresso Martini",
    categoria: "Cócteles",
    tiempoPreparacion: "5 minutos",
    dificultad: "Media",
    ingredientes: [
      "50 ml de vodka",
      "30 ml de licor de café",
      "30 ml de espresso fresco",
      "15 ml de jarabe de azúcar",
      "Granos de café para decorar",
    ],
    pasos: [
      "Preparar un espresso y dejarlo enfriar ligeramente",
      "En una coctelera con hielo, agregar el vodka, licor de café, espresso y jarabe de azúcar",
      "Agitar vigorosamente durante 20 segundos",
      "Colar en una copa de martini fría",
      "Decorar con 3 granos de café",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en copa de martini fría, decorado con granos de café",
  },
  {
    id: 6,
    nombre: "Caipirinha",
    categoria: "Cócteles",
    tiempoPreparacion: "4 minutos",
    dificultad: "Fácil",
    ingredientes: ["60 ml de cachaça", "1 lima", "2 cucharadas de azúcar", "Hielo picado"],
    pasos: [
      "Cortar la lima en trozos pequeños",
      "Colocar la lima y el azúcar en un vaso bajo",
      "Machacar para extraer el jugo y los aceites",
      "Agregar hielo picado",
      "Verter la cachaça",
      "Remover bien",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en vaso bajo con hielo picado y trozos de lima",
  },
  {
    id: 7,
    nombre: "Café Irlandés",
    categoria: "Café",
    tiempoPreparacion: "5 minutos",
    dificultad: "Media",
    ingredientes: [
      "50 ml de whisky irlandés",
      "150 ml de café caliente",
      "2 cucharadas de azúcar moreno",
      "Crema batida",
    ],
    pasos: [
      "Calentar la copa con agua caliente y luego vaciarla",
      "Agregar el azúcar moreno y el whisky irlandés",
      "Verter el café caliente y remover",
      "Colocar suavemente la crema batida sobre el café usando el dorso de una cuchara",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en copa de café irlandés con capa de crema batida en la superficie",
  },
  {
    id: 8,
    nombre: "Sangría",
    categoria: "Vinos",
    tiempoPreparacion: "10 minutos (+ tiempo de reposo)",
    dificultad: "Media",
    ingredientes: [
      "1 botella de vino tinto",
      "60 ml de brandy",
      "60 ml de licor de naranja",
      "2 naranjas en rodajas",
      "1 limón en rodajas",
      "1 manzana en cubos",
      "2 cucharadas de azúcar",
      "500 ml de agua con gas",
      "Hielo",
    ],
    pasos: [
      "En una jarra grande, mezclar el vino, brandy, licor de naranja y azúcar",
      "Agregar las frutas cortadas",
      "Refrigerar por al menos 2 horas (idealmente toda la noche)",
      "Antes de servir, agregar el agua con gas y hielo",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en vasos grandes con hielo y frutas de la mezcla",
  },
]

// Datos de ejemplo - Pedidos de bebidas
const pedidosBebidas: PedidoBebida[] = [
  {
    id: 101,
    numeroPedido: 1001,
    mesa: 5,
    cliente: "Mesa 5",
    bebida: bebidas[0], // Mojito
    cantidad: 2,
    estado: "Pendiente",
    tipoServicio: "Para servir en mesa",
    horaCreacion: "19:30",
    tiempoTranscurrido: "5 min",
    observaciones: "Con poco azúcar",
    prioridad: "Normal",
  },
  {
    id: 102,
    numeroPedido: 1002,
    mesa: 8,
    cliente: "Mesa 8",
    bebida: bebidas[1], // Margarita
    cantidad: 3,
    estado: "En preparación",
    tipoServicio: "Para servir en mesa",
    horaCreacion: "19:25",
    tiempoTranscurrido: "10 min",
    bartenderAsignado: "Carlos Martínez",
    prioridad: "Alta",
  },
  {
    id: 103,
    numeroPedido: 1003,
    cliente: "Juan Pérez",
    bebida: bebidas[2], // Piña Colada
    cantidad: 1,
    estado: "Lista para servir",
    tipoServicio: "Para llevar",
    horaCreacion: "19:15",
    tiempoTranscurrido: "20 min",
    bartenderAsignado: "Ana López",
    prioridad: "Normal",
  },
  {
    id: 104,
    numeroPedido: 1004,
    mesa: 3,
    cliente: "Mesa 3",
    bebida: bebidas[3], // Negroni
    cantidad: 2,
    estado: "Pendiente",
    tipoServicio: "Para servir en mesa",
    horaCreacion: "19:35",
    tiempoTranscurrido: "2 min",
    prioridad: "Normal",
  },
  {
    id: 105,
    numeroPedido: 1005,
    cliente: "María González",
    bebida: bebidas[4], // Espresso Martini
    cantidad: 2,
    estado: "Entregada",
    tipoServicio: "Para llevar",
    horaCreacion: "19:00",
    tiempoTranscurrido: "35 min",
    bartenderAsignado: "Miguel Rodríguez",
    prioridad: "Normal",
  },
  {
    id: 106,
    numeroPedido: 1006,
    mesa: 10,
    cliente: "Mesa 10",
    bebida: bebidas[5], // Caipirinha
    cantidad: 4,
    estado: "Pendiente",
    tipoServicio: "Para servir en mesa",
    horaCreacion: "19:40",
    tiempoTranscurrido: "1 min",
    observaciones: "Para celebración de cumpleaños",
    prioridad: "Alta",
  },
  {
    id: 107,
    numeroPedido: 1007,
    cliente: "Roberto Sánchez",
    bebida: bebidas[6], // Café Irlandés
    cantidad: 1,
    estado: "En preparación",
    tipoServicio: "Para llevar",
    horaCreacion: "19:20",
    tiempoTranscurrido: "15 min",
    bartenderAsignado: "Laura Gómez",
    prioridad: "Normal",
  },
]
