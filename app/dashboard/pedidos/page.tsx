"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Clock,
  Filter,
  MapPin,
  BikeIcon as MotorcycleIcon,
  Search,
  Utensils,
  ChefHat,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Trash2,
  Users,
  ShoppingCart,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

// Tipos para los pedidos
type EstadoPedido = "Pendiente" | "En preparación" | "Listo para servir" | "En camino" | "Entregado" | "Cancelado"
type TipoPedido = "Local" | "Delivery"

interface ItemPedido {
  id: number
  nombre: string
  cantidad: number
  precio: number
  observaciones?: string
}

interface Pedido {
  id: number
  tipo: TipoPedido
  mesa?: number
  cliente: string
  direccion?: string
  ubicacion?: {
    lat: number
    lng: number
  }
  estado: EstadoPedido
  horaCreacion: string
  tiempoTranscurrido: string
  empleadoAsignado?: string
  empleadoAvatar?: string
  items: ItemPedido[]
  total: number
  observaciones?: string
  personas?: number
}

// Productos disponibles para pedidos rápidos
interface ProductoRapido {
  id: number
  nombre: string
  precio: number
  categoria: string
}

const productosRapidos: ProductoRapido[] = [
  { id: 1, nombre: "Pasta Carbonara", precio: 12.99, categoria: "Platos Principales" },
  { id: 2, nombre: "Ensalada César", precio: 8.99, categoria: "Entradas" },
  { id: 3, nombre: "Filete de Salmón", precio: 18.99, categoria: "Platos Principales" },
  { id: 4, nombre: "Pizza Margherita", precio: 14.99, categoria: "Pizzas" },
  { id: 5, nombre: "Hamburguesa Clásica", precio: 11.99, categoria: "Hamburguesas" },
  { id: 6, nombre: "Mojito", precio: 8.99, categoria: "Bebidas" },
  { id: 7, nombre: "Agua Mineral", precio: 2.5, categoria: "Bebidas" },
  { id: 8, nombre: "Tiramisú", precio: 6.99, categoria: "Postres" },
  { id: 9, nombre: "Bruschetta", precio: 6.99, categoria: "Entradas" },
  { id: 10, nombre: "Risotto de Champiñones", precio: 14.99, categoria: "Platos Principales" },
]

export default function PedidosPage() {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [pedidosState, setPedidosState] = useState<Pedido[]>(pedidos)
  const [vistaActiva, setVistaActiva] = useState<"todos" | "cocina" | "servicio">("todos")

  // Estados para nuevo pedido
  const [dialogoNuevoPedido, setDialogoNuevoPedido] = useState<boolean>(false)
  const [tipoPedidoNuevo, setTipoPedidoNuevo] = useState<TipoPedido>("Local")
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null)
  const [clienteNombre, setClienteNombre] = useState<string>("")
  const [direccionEntrega, setDireccionEntrega] = useState<string>("")
  const [personasNuevoPedido, setPersonasNuevoPedido] = useState<number>(1)
  const [observacionesNuevoPedido, setObservacionesNuevoPedido] = useState<string>("")
  const [itemsNuevoPedido, setItemsNuevoPedido] = useState<ItemPedido[]>([])
  const [busquedaProductos, setBusquedaProductos] = useState<string>("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todos")

  const { toast } = useToast()

  // Filtrar pedidos según los criterios seleccionados
  const pedidosFiltrados = pedidosState.filter((pedido) => {
    // Filtro por vista activa
    if (
      vistaActiva === "cocina" &&
      (pedido.estado === "Entregado" || pedido.estado === "Listo para servir" || pedido.estado === "En camino")
    ) {
      return false
    }

    if (
      vistaActiva === "servicio" &&
      (pedido.estado === "Pendiente" || pedido.estado === "En preparación" || pedido.estado === "Cancelado")
    ) {
      return false
    }

    // Filtro por estado
    if (filtroEstado !== "todos" && pedido.estado !== filtroEstado) {
      return false
    }

    // Filtro por búsqueda (cliente, mesa, id)
    if (busqueda) {
      const searchLower = busqueda.toLowerCase()
      const clienteLower = pedido.cliente.toLowerCase()
      const mesaStr = pedido.mesa?.toString() || ""
      const idStr = pedido.id.toString()

      return clienteLower.includes(searchLower) || mesaStr.includes(searchLower) || idStr.includes(searchLower)
    }

    return true
  })

  // Calcular totales para el resumen
  const totalPedidos = pedidosFiltrados.length
  const pedidosPendientes = pedidosFiltrados.filter((p) => p.estado === "Pendiente").length
  const pedidosEnPreparacion = pedidosFiltrados.filter((p) => p.estado === "En preparación").length
  const pedidosListos = pedidosFiltrados.filter(
    (p) => p.estado === "Listo para servir" || p.estado === "En camino",
  ).length
  const pedidosCompletados = pedidosFiltrados.filter((p) => p.estado === "Entregado").length

  // Filtrar productos para el nuevo pedido
  const productosDisponibles = productosRapidos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busquedaProductos.toLowerCase())
    const coincideCategoria = categoriaSeleccionada === "todos" || producto.categoria === categoriaSeleccionada
    return coincideBusqueda && coincideCategoria
  })

  // Obtener categorías únicas
  const categorias = Array.from(new Set(productosRapidos.map((p) => p.categoria)))

  // Calcular total del nuevo pedido
  const totalNuevoPedido = itemsNuevoPedido.reduce((total, item) => total + item.precio * item.cantidad, 0)

  // Función para cambiar el estado de un pedido
  const cambiarEstadoPedido = (pedidoId: number, nuevoEstado: EstadoPedido) => {
    setPedidosState((prevPedidos) =>
      prevPedidos.map((pedido) => (pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido)),
    )
  }

  // Función para asignar un empleado a un pedido
  const asignarEmpleado = (pedidoId: number, empleadoId: string, empleadoNombre: string, empleadoAvatar?: string) => {
    setPedidosState((prevPedidos) =>
      prevPedidos.map((pedido) =>
        pedido.id === pedidoId ? { ...pedido, empleadoAsignado: empleadoNombre, empleadoAvatar } : pedido,
      ),
    )
  }

  // Agregar producto al nuevo pedido
  const agregarProductoNuevoPedido = (producto: ProductoRapido) => {
    setItemsNuevoPedido((prevItems) => {
      const itemExistente = prevItems.find((item) => item.id === producto.id)

      if (itemExistente) {
        return prevItems.map((item) => (item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item))
      } else {
        return [
          ...prevItems,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
          },
        ]
      }
    })
  }

  // Cambiar cantidad de un item en el nuevo pedido
  const cambiarCantidadNuevoPedido = (id: number, incremento: number) => {
    setItemsNuevoPedido((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + incremento
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item
          }
          return item
        })
        .filter((item) => item.cantidad > 0)
    })
  }

  // Eliminar item del nuevo pedido
  const eliminarItemNuevoPedido = (id: number) => {
    setItemsNuevoPedido((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  // Crear nuevo pedido
  const crearNuevoPedido = () => {
    // Validaciones
    if (itemsNuevoPedido.length === 0) {
      toast({
        variant: "destructive",
        description: "Debe agregar al menos un producto al pedido",
        duration: 2000,
      })
      return
    }

    if (tipoPedidoNuevo === "Local" && !mesaSeleccionada) {
      toast({
        variant: "destructive",
        description: "Debe seleccionar una mesa para pedidos locales",
        duration: 2000,
      })
      return
    }

    if (tipoPedidoNuevo === "Delivery" && (!clienteNombre.trim() || !direccionEntrega.trim())) {
      toast({
        variant: "destructive",
        description: "Debe completar el nombre del cliente y la dirección para delivery",
        duration: 2000,
      })
      return
    }

    // Generar ID de pedido
    const nuevoPedidoId = Math.floor(1000 + Math.random() * 9000)

    // Crear nuevo pedido
    const nuevoPedido: Pedido = {
      id: nuevoPedidoId,
      tipo: tipoPedidoNuevo,
      mesa: tipoPedidoNuevo === "Local" ? mesaSeleccionada! : undefined,
      cliente: tipoPedidoNuevo === "Local" ? `Mesa ${mesaSeleccionada}` : clienteNombre,
      direccion: tipoPedidoNuevo === "Delivery" ? direccionEntrega : undefined,
      estado: "Pendiente",
      horaCreacion: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tiempoTranscurrido: "0 min",
      items: [...itemsNuevoPedido],
      total: totalNuevoPedido,
      observaciones: observacionesNuevoPedido.trim() || undefined,
      personas: personasNuevoPedido,
    }

    // Agregar el nuevo pedido al estado
    setPedidosState((prevPedidos) => [nuevoPedido, ...prevPedidos])

    // Limpiar formulario
    resetearFormularioNuevoPedido()

    // Cerrar diálogo
    setDialogoNuevoPedido(false)

    toast({
      description: `Pedido #${nuevoPedidoId} creado exitosamente`,
      duration: 2000,
    })
  }

  // Resetear formulario de nuevo pedido
  const resetearFormularioNuevoPedido = () => {
    setTipoPedidoNuevo("Local")
    setMesaSeleccionada(null)
    setClienteNombre("")
    setDireccionEntrega("")
    setPersonasNuevoPedido(1)
    setObservacionesNuevoPedido("")
    setItemsNuevoPedido([])
    setBusquedaProductos("")
    setCategoriaSeleccionada("todos")
  }

  // Función para obtener el color de fondo según el estado
  const getEstadoColor = (estado: EstadoPedido) => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-50 border-amber-200"
      case "En preparación":
        return "bg-blue-50 border-blue-200"
      case "Listo para servir":
        return "bg-green-50 border-green-200"
      case "En camino":
        return "bg-purple-50 border-purple-200"
      case "Entregado":
        return "bg-gray-50 border-gray-200"
      case "Cancelado":
        return "bg-red-50 border-red-200"
      default:
        return "bg-white"
    }
  }

  // Función para obtener el icono según el estado
  const getEstadoIcon = (estado: EstadoPedido) => {
    switch (estado) {
      case "Pendiente":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "En preparación":
        return <ChefHat className="h-5 w-5 text-blue-500" />
      case "Listo para servir":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "En camino":
        return <MotorcycleIcon className="h-5 w-5 text-purple-500" />
      case "Entregado":
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      case "Cancelado":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  // Función para obtener los botones de acción según el estado actual
  const getActionButtons = (pedido: Pedido) => {
    switch (pedido.estado) {
      case "Pendiente":
        return (
          <Button
            className="w-full h-14 text-base bg-blue-500 hover:bg-blue-600"
            onClick={() => cambiarEstadoPedido(pedido.id, "En preparación")}
          >
            <ChefHat className="mr-2 h-5 w-5" />
            Iniciar preparación
          </Button>
        )
      case "En preparación":
        return (
          <Button
            className="w-full h-14 text-base bg-green-500 hover:bg-green-600"
            onClick={() => cambiarEstadoPedido(pedido.id, "Listo para servir")}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Listo para servir
          </Button>
        )
      case "Listo para servir":
        return pedido.tipo === "Local" ? (
          <Button
            className="w-full h-14 text-base bg-gray-500 hover:bg-gray-600"
            onClick={() => cambiarEstadoPedido(pedido.id, "Entregado")}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Entregado al cliente
          </Button>
        ) : (
          <Button
            className="w-full h-14 text-base bg-purple-500 hover:bg-purple-600"
            onClick={() => cambiarEstadoPedido(pedido.id, "En camino")}
          >
            <MotorcycleIcon className="mr-2 h-5 w-5" />
            En camino
          </Button>
        )
      case "En camino":
        return (
          <Button
            className="w-full h-14 text-base bg-gray-500 hover:bg-gray-600"
            onClick={() => cambiarEstadoPedido(pedido.id, "Entregado")}
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Entregado al cliente
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Pedidos</h1>
        <Dialog open={dialogoNuevoPedido} onOpenChange={setDialogoNuevoPedido}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Pedido</DialogTitle>
              <DialogDescription>Complete la información para crear un nuevo pedido</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Tipo de pedido */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Pedido</label>
                <Select value={tipoPedidoNuevo} onValueChange={(value: TipoPedido) => setTipoPedidoNuevo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Local">
                      <div className="flex items-center">
                        <Utensils className="mr-2 h-4 w-4" />
                        Local (Mesa)
                      </div>
                    </SelectItem>
                    <SelectItem value="Delivery">
                      <div className="flex items-center">
                        <MotorcycleIcon className="mr-2 h-4 w-4" />
                        Delivery
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Información específica según el tipo */}
              {tipoPedidoNuevo === "Local" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mesa</label>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((mesa) => (
                      <Button
                        key={mesa}
                        variant={mesaSeleccionada === mesa ? "default" : "outline"}
                        className="h-12"
                        onClick={() => setMesaSeleccionada(mesa)}
                      >
                        {mesa}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Cliente</label>
                    <Input
                      placeholder="Nombre completo"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dirección de Entrega</label>
                    <Input
                      placeholder="Dirección completa"
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Número de personas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Personas</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPersonasNuevoPedido(Math.max(1, personasNuevoPedido - 1))}
                    disabled={personasNuevoPedido <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{personasNuevoPedido}</span>
                  <Button variant="outline" size="icon" onClick={() => setPersonasNuevoPedido(personasNuevoPedido + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Productos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Productos</label>
                  <div className="text-sm text-muted-foreground">Total: ${totalNuevoPedido.toFixed(2)}</div>
                </div>

                {/* Búsqueda y filtros de productos */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar producto..."
                      className="pl-8"
                      value={busquedaProductos}
                      onChange={(e) => setBusquedaProductos(e.target.value)}
                    />
                  </div>
                  <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las categorías</SelectItem>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de productos disponibles */}
                <div className="border rounded-md">
                  <ScrollArea className="h-[200px] p-4">
                    <div className="grid grid-cols-1 gap-2">
                      {productosDisponibles.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => agregarProductoNuevoPedido(producto)}
                        >
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-sm text-muted-foreground">{producto.categoria}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">${producto.precio.toFixed(2)}</span>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Items agregados al pedido */}
                {itemsNuevoPedido.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Items del Pedido</label>
                    <div className="border rounded-md p-4 space-y-2">
                      {itemsNuevoPedido.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                          <div className="flex-1">
                            <div className="font-medium">{item.nombre}</div>
                            <div className="text-sm text-muted-foreground">
                              ${item.precio.toFixed(2)} x {item.cantidad}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold">${(item.precio * item.cantidad).toFixed(2)}</div>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => cambiarCantidadNuevoPedido(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.cantidad}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => cambiarCantidadNuevoPedido(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => eliminarItemNuevoPedido(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t font-bold">
                        <span>Total</span>
                        <span>${totalNuevoPedido.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Observaciones (Opcional)</label>
                <Textarea
                  placeholder="Observaciones especiales para el pedido..."
                  value={observacionesNuevoPedido}
                  onChange={(e) => setObservacionesNuevoPedido(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoNuevoPedido(false)}>
                Cancelar
              </Button>
              <Button onClick={crearNuevoPedido}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Crear Pedido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vistas para diferentes roles */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={vistaActiva === "todos" ? "default" : "outline"}
          onClick={() => setVistaActiva("todos")}
          className="flex-1 sm:flex-none"
        >
          Todos los pedidos
        </Button>
        <Button
          variant={vistaActiva === "cocina" ? "default" : "outline"}
          onClick={() => setVistaActiva("cocina")}
          className="flex-1 sm:flex-none"
        >
          <ChefHat className="mr-2 h-4 w-4" />
          Vista de Cocina
        </Button>
        <Button
          variant={vistaActiva === "servicio" ? "default" : "outline"}
          onClick={() => setVistaActiva("servicio")}
          className="flex-1 sm:flex-none"
        >
          <Utensils className="mr-2 h-4 w-4" />
          Vista de Servicio
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
            <ChefHat className="h-8 w-8 text-blue-500 mb-2" />
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
            <CheckCircle className="h-8 w-8 text-gray-500 mb-2" />
            <div className="text-sm font-medium text-gray-700">Completados</div>
            <div className="text-3xl font-bold text-gray-700">{pedidosCompletados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cliente, mesa o ID..."
            className="pl-8"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En preparación">En preparación</SelectItem>
              <SelectItem value="Listo para servir">Listo para servir</SelectItem>
              <SelectItem value="En camino">En camino</SelectItem>
              <SelectItem value="Entregado">Entregado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pestañas para tipos de pedidos */}
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="local">En Local</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        {/* Contenido de la pestaña "Todos" */}
        <TabsContent value="todos" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pedidosFiltrados.map((pedido) => (
              <Card key={pedido.id} className={`${getEstadoColor(pedido.estado)} overflow-hidden`}>
                <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {pedido.tipo === "Local" ? (
                        <>
                          <Utensils className="h-5 w-5" />
                          Mesa {pedido.mesa}
                        </>
                      ) : (
                        <>
                          <MotorcycleIcon className="h-5 w-5" />
                          Delivery
                        </>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pedido #{pedido.id} - {pedido.cliente}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className="mb-1">{pedido.estado}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {pedido.tiempoTranscurrido}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Hora del pedido</div>
                      <div className="text-sm">{pedido.horaCreacion}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Total</div>
                      <div className="text-sm font-bold">${pedido.total.toFixed(2)}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Items</div>
                      <div className="text-sm">{pedido.items.length} productos</div>
                    </div>

                    {pedido.personas && (
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Personas</div>
                        <div className="flex items-center text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          {pedido.personas}
                        </div>
                      </div>
                    )}

                    {pedido.tipo === "Delivery" && (
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">Dirección</div>
                        <div className="text-sm text-right max-w-[60%] truncate">
                          {pedido.direccion}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 p-0">
                                <MapPin className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Ubicación de entrega</DialogTitle>
                                <DialogDescription>{pedido.direccion}</DialogDescription>
                              </DialogHeader>
                              <div className="h-[300px] bg-muted rounded-md flex items-center justify-center">
                                <div className="text-muted-foreground">Mapa de ubicación</div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Asignado a</div>
                      <div className="flex items-center gap-2">
                        {pedido.empleadoAsignado ? (
                          <>
                            <Avatar className="h-6 w-6">
                              {pedido.empleadoAvatar && (
                                <AvatarImage src={pedido.empleadoAvatar || "/placeholder.svg"} />
                              )}
                              <AvatarFallback>{pedido.empleadoAsignado.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{pedido.empleadoAsignado}</span>
                          </>
                        ) : (
                          <Select
                            onValueChange={(value) => {
                              const [id, nombre] = value.split("|")
                              asignarEmpleado(pedido.id, id, nombre)
                            }}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue placeholder="Asignar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="juan|Juan Pérez">Juan Pérez</SelectItem>
                              <SelectItem value="maria|María López">María López</SelectItem>
                              <SelectItem value="carlos|Carlos Rodríguez">Carlos R.</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    {pedido.observaciones && (
                      <div className="mt-2 p-2 bg-white bg-opacity-50 rounded-md text-sm">
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
                      className="rounded-none h-12 text-base border-0 border-t bg-transparent"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      Ver detalles
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-none h-12 text-base border-0 border-t border-l bg-transparent"
                      onClick={() =>
                        pedido.estado !== "Cancelado" &&
                        pedido.estado !== "Entregado" &&
                        cambiarEstadoPedido(pedido.id, "Cancelado")
                      }
                      disabled={pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                  {pedido.estado !== "Cancelado" && pedido.estado !== "Entregado" && getActionButtons(pedido)}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contenido de la pestaña "En Local" */}
        <TabsContent value="local" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pedidosFiltrados
              .filter((p) => p.tipo === "Local")
              .map((pedido) => (
                <Card key={pedido.id} className={`${getEstadoColor(pedido.estado)} overflow-hidden`}>
                  <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        Mesa {pedido.mesa}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Pedido #{pedido.id}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className="mb-1">{pedido.estado}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {pedido.tiempoTranscurrido}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Hora del pedido</div>
                        <div className="text-sm">{pedido.horaCreacion}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Total</div>
                        <div className="text-sm font-bold">${pedido.total.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Items</div>
                        <div className="text-sm">{pedido.items.length} productos</div>
                      </div>

                      {pedido.personas && (
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">Personas</div>
                          <div className="flex items-center text-sm">
                            <Users className="h-3 w-3 mr-1" />
                            {pedido.personas}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Asignado a</div>
                        <div className="flex items-center gap-2">
                          {pedido.empleadoAsignado ? (
                            <>
                              <Avatar className="h-6 w-6">
                                {pedido.empleadoAvatar && (
                                  <AvatarImage src={pedido.empleadoAvatar || "/placeholder.svg"} />
                                )}
                                <AvatarFallback>{pedido.empleadoAsignado.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{pedido.empleadoAsignado}</span>
                            </>
                          ) : (
                            <Select
                              onValueChange={(value) => {
                                const [id, nombre] = value.split("|")
                                asignarEmpleado(pedido.id, id, nombre)
                              }}
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue placeholder="Asignar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="juan|Juan Pérez">Juan Pérez</SelectItem>
                                <SelectItem value="maria|María López">María López</SelectItem>
                                <SelectItem value="carlos|Carlos Rodríguez">Carlos R.</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      {pedido.observaciones && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded-md text-sm">
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
                        className="rounded-none h-12 text-base border-0 border-t bg-transparent"
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-none h-12 text-base border-0 border-t border-l bg-transparent"
                        onClick={() =>
                          pedido.estado !== "Cancelado" &&
                          pedido.estado !== "Entregado" &&
                          cambiarEstadoPedido(pedido.id, "Cancelado")
                        }
                        disabled={pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                    {pedido.estado !== "Cancelado" && pedido.estado !== "Entregado" && getActionButtons(pedido)}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Contenido de la pestaña "Delivery" */}
        <TabsContent value="delivery" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pedidosFiltrados
              .filter((p) => p.tipo === "Delivery")
              .map((pedido) => (
                <Card key={pedido.id} className={`${getEstadoColor(pedido.estado)} overflow-hidden`}>
                  <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MotorcycleIcon className="h-5 w-5" />
                        Delivery
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pedido #{pedido.id} - {pedido.cliente}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className="mb-1">{pedido.estado}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {pedido.tiempoTranscurrido}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Hora del pedido</div>
                        <div className="text-sm">{pedido.horaCreacion}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Total</div>
                        <div className="text-sm font-bold">${pedido.total.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Items</div>
                        <div className="text-sm">{pedido.items.length} productos</div>
                      </div>

                      {pedido.personas && (
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">Personas</div>
                          <div className="flex items-center text-sm">
                            <Users className="h-3 w-3 mr-1" />
                            {pedido.personas}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">Dirección</div>
                        <div className="text-sm text-right max-w-[60%] truncate">
                          {pedido.direccion}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 p-0">
                                <MapPin className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Ubicación de entrega</DialogTitle>
                                <DialogDescription>{pedido.direccion}</DialogDescription>
                              </DialogHeader>
                              <div className="h-[300px] bg-muted rounded-md flex items-center justify-center">
                                <div className="text-muted-foreground">Mapa de ubicación</div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Asignado a</div>
                        <div className="flex items-center gap-2">
                          {pedido.empleadoAsignado ? (
                            <>
                              <Avatar className="h-6 w-6">
                                {pedido.empleadoAvatar && (
                                  <AvatarImage src={pedido.empleadoAvatar || "/placeholder.svg"} />
                                )}
                                <AvatarFallback>{pedido.empleadoAsignado.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{pedido.empleadoAsignado}</span>
                            </>
                          ) : (
                            <Select
                              onValueChange={(value) => {
                                const [id, nombre] = value.split("|")
                                asignarEmpleado(pedido.id, id, nombre)
                              }}
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue placeholder="Asignar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="juan|Juan Pérez">Juan Pérez</SelectItem>
                                <SelectItem value="maria|María López">María López</SelectItem>
                                <SelectItem value="carlos|Carlos Rodríguez">Carlos R.</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      {pedido.observaciones && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded-md text-sm">
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
                        className="rounded-none h-12 text-base border-0 border-t bg-transparent"
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-none h-12 text-base border-0 border-t border-l bg-transparent"
                        onClick={() =>
                          pedido.estado !== "Cancelado" &&
                          pedido.estado !== "Entregado" &&
                          cambiarEstadoPedido(pedido.id, "Cancelado")
                        }
                        disabled={pedido.estado === "Cancelado" || pedido.estado === "Entregado"}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                    {pedido.estado !== "Cancelado" && pedido.estado !== "Entregado" && getActionButtons(pedido)}
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles del pedido */}
      {pedidoSeleccionado && (
        <Dialog open={!!pedidoSeleccionado} onOpenChange={(open) => !open && setPedidoSeleccionado(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getEstadoIcon(pedidoSeleccionado.estado)}
                Pedido #{pedidoSeleccionado.id} -{" "}
                {pedidoSeleccionado.tipo === "Local" ? `Mesa ${pedidoSeleccionado.mesa}` : "Delivery"}
              </DialogTitle>
              <DialogDescription>
                {pedidoSeleccionado.horaCreacion} ({pedidoSeleccionado.tiempoTranscurrido})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Información del cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h4>
                  <p className="font-medium">{pedidoSeleccionado.cliente}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Estado</h4>
                  <Badge
                    variant={
                      pedidoSeleccionado.estado === "Entregado"
                        ? "outline"
                        : pedidoSeleccionado.estado === "Cancelado"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {pedidoSeleccionado.estado}
                  </Badge>
                </div>
                {pedidoSeleccionado.tipo === "Delivery" && (
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Dirección</h4>
                    <p className="font-medium">{pedidoSeleccionado.direccion}</p>
                  </div>
                )}
                {pedidoSeleccionado.personas && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Personas</h4>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{pedidoSeleccionado.personas}</span>
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Empleado asignado</h4>
                  <div className="flex items-center gap-2">
                    {pedidoSeleccionado.empleadoAsignado ? (
                      <>
                        <Avatar className="h-6 w-6">
                          {pedidoSeleccionado.empleadoAvatar && (
                            <AvatarImage src={pedidoSeleccionado.empleadoAvatar || "/placeholder.svg"} />
                          )}
                          <AvatarFallback>{pedidoSeleccionado.empleadoAsignado.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{pedidoSeleccionado.empleadoAsignado}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {pedidoSeleccionado.observaciones && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Observaciones</h4>
                  <p className="text-sm p-2 bg-muted rounded-md">{pedidoSeleccionado.observaciones}</p>
                </div>
              )}

              {/* Items del pedido */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Productos</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {pedidoSeleccionado.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{item.nombre}</div>
                        {item.observaciones && (
                          <div className="text-xs text-muted-foreground">{item.observaciones}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.cantidad} x ${item.precio.toFixed(2)}
                        </div>
                        <div className="text-sm">${(item.cantidad * item.precio).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-2 border-t">
                  <div className="font-bold">Total</div>
                  <div className="font-bold text-lg">${pedidoSeleccionado.total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {pedidoSeleccionado.estado !== "Cancelado" && pedidoSeleccionado.estado !== "Entregado" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      cambiarEstadoPedido(pedidoSeleccionado.id, "Cancelado")
                      setPedidoSeleccionado(null)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar pedido
                  </Button>
                  <Button
                    onClick={() => {
                      const nextState = getNextState(pedidoSeleccionado.estado, pedidoSeleccionado.tipo)
                      if (nextState) {
                        cambiarEstadoPedido(pedidoSeleccionado.id, nextState)
                        setPedidoSeleccionado(null)
                      }
                    }}
                  >
                    Avanzar estado
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setPedidoSeleccionado(null)} className="w-full sm:w-auto">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Función para determinar el siguiente estado
function getNextState(currentState: EstadoPedido, tipo: TipoPedido): EstadoPedido | null {
  switch (currentState) {
    case "Pendiente":
      return "En preparación"
    case "En preparación":
      return "Listo para servir"
    case "Listo para servir":
      return tipo === "Local" ? "Entregado" : "En camino"
    case "En camino":
      return "Entregado"
    default:
      return null
  }
}

// Datos de ejemplo
const pedidos: Pedido[] = [
  {
    id: 1001,
    tipo: "Local",
    mesa: 5,
    cliente: "Mesa 5",
    estado: "En preparación",
    horaCreacion: "19:30",
    tiempoTranscurrido: "15 min",
    empleadoAsignado: "Juan Pérez",
    items: [
      {
        id: 1,
        nombre: "Pasta Carbonara",
        cantidad: 2,
        precio: 12.99,
        observaciones: "Sin cebolla",
      },
      {
        id: 2,
        nombre: "Ensalada César",
        cantidad: 1,
        precio: 8.99,
      },
      {
        id: 3,
        nombre: "Vino Tinto",
        cantidad: 1,
        precio: 18.5,
      },
    ],
    total: 53.47,
    observaciones: "Cliente habitual, prefiere la pasta al dente",
    personas: 2,
  },
  {
    id: 1002,
    tipo: "Local",
    mesa: 8,
    cliente: "Mesa 8",
    estado: "Listo para servir",
    horaCreacion: "19:45",
    tiempoTranscurrido: "10 min",
    empleadoAsignado: "María López",
    items: [
      {
        id: 1,
        nombre: "Filete de Salmón",
        cantidad: 1,
        precio: 18.99,
      },
      {
        id: 2,
        nombre: "Risotto de Champiñones",
        cantidad: 1,
        precio: 14.5,
      },
      {
        id: 3,
        nombre: "Agua Mineral",
        cantidad: 2,
        precio: 2.5,
      },
    ],
    total: 38.49,
    personas: 2,
  },
  {
    id: 1003,
    tipo: "Delivery",
    cliente: "Carlos Rodríguez",
    direccion: "Av. Principal 123, Apto 4B",
    ubicacion: {
      lat: 40.7128,
      lng: -74.006,
    },
    estado: "En camino",
    horaCreacion: "19:20",
    tiempoTranscurrido: "25 min",
    empleadoAsignado: "Roberto Sánchez",
    items: [
      {
        id: 1,
        nombre: "Pizza Familiar",
        cantidad: 1,
        precio: 22.99,
        observaciones: "Mitad pepperoni, mitad hawaiana",
      },
      {
        id: 2,
        nombre: "Alitas de Pollo",
        cantidad: 1,
        precio: 12.5,
      },
      {
        id: 3,
        nombre: "Refresco Cola",
        cantidad: 2,
        precio: 2.99,
      },
    ],
    total: 41.47,
    observaciones: "Entregar en la recepción del edificio",
    personas: 3,
  },
  {
    id: 1004,
    tipo: "Local",
    mesa: 3,
    cliente: "Mesa 3",
    estado: "Pendiente",
    horaCreacion: "19:55",
    tiempoTranscurrido: "2 min",
    items: [
      {
        id: 1,
        nombre: "Hamburguesa Clásica",
        cantidad: 3,
        precio: 10.99,
      },
      {
        id: 2,
        nombre: "Papas Fritas",
        cantidad: 2,
        precio: 4.5,
      },
      {
        id: 3,
        nombre: "Cerveza Artesanal",
        cantidad: 3,
        precio: 5.99,
      },
    ],
    total: 54.93,
    personas: 3,
  },
  {
    id: 1005,
    tipo: "Delivery",
    cliente: "Ana Martínez",
    direccion: "Calle Secundaria 456",
    ubicacion: {
      lat: 40.7282,
      lng: -73.994,
    },
    estado: "Entregado",
    horaCreacion: "19:00",
    tiempoTranscurrido: "45 min",
    empleadoAsignado: "Roberto Sánchez",
    items: [
      {
        id: 1,
        nombre: "Sushi Variado",
        cantidad: 1,
        precio: 25.99,
      },
      {
        id: 2,
        nombre: "Gyozas",
        cantidad: 1,
        precio: 8.5,
      },
      {
        id: 3,
        nombre: "Té Verde",
        cantidad: 1,
        precio: 2.99,
      },
    ],
    total: 37.48,
    personas: 2,
  },
  {
    id: 1006,
    tipo: "Local",
    mesa: 10,
    cliente: "Mesa 10",
    estado: "Cancelado",
    horaCreacion: "19:15",
    tiempoTranscurrido: "30 min",
    items: [
      {
        id: 1,
        nombre: "Paella de Mariscos",
        cantidad: 1,
        precio: 24.99,
      },
      {
        id: 2,
        nombre: "Sangría",
        cantidad: 1,
        precio: 15.5,
      },
    ],
    total: 40.49,
    observaciones: "Cliente se fue antes de recibir el pedido",
    personas: 2,
  },
  {
    id: 1007,
    tipo: "Delivery",
    cliente: "Luis Gómez",
    direccion: "Urbanización Los Pinos, Casa 78",
    ubicacion: {
      lat: 40.7328,
      lng: -74.016,
    },
    estado: "Pendiente",
    horaCreacion: "19:50",
    tiempoTranscurrido: "5 min",
    items: [
      {
        id: 1,
        nombre: "Pollo a la Brasa",
        cantidad: 1,
        precio: 18.99,
      },
      {
        id: 2,
        nombre: "Arroz con Verduras",
        cantidad: 1,
        precio: 6.5,
      },
      {
        id: 3,
        nombre: "Jugo Natural",
        cantidad: 2,
        precio: 3.99,
      },
    ],
    total: 33.47,
    observaciones: "Incluir salsas adicionales",
    personas: 4,
  },
]
