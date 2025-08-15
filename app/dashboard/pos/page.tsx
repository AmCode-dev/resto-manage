"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Receipt,
  CreditCard,
  CheckCircle2,
  Coffee,
  UtensilsCrossed,
  Pizza,
  Wine,
  IceCream,
  Search,
  Clock,
  Printer,
  TableIcon,
  History,
  ArrowRight,
  CreditCardIcon as CardIcon,
  Banknote,
  Wallet,
  Users,
  AlertCircle,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useCajas } from "@/hooks/use-cajas"
import { useMenus } from "@/hooks/use-menus"
import type { ItemPedido, Pedido } from "@/lib/database.types"

export default function POSPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>("platos-principales")
  const [carrito, setCarrito] = useState<ItemPedido[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [pedidoGenerado, setPedidoGenerado] = useState<boolean>(false)
  const [idPedido, setIdPedido] = useState<number | null>(null)
  const [montoPersonalizado, setMontoPersonalizado] = useState<string>("")
  const [descripcionPersonalizada, setDescripcionPersonalizada] = useState<string>("")
  const [dialogoPersonalizado, setDialogoPersonalizado] = useState<boolean>(false)
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null)
  const [dialogoMesa, setDialogoMesa] = useState<boolean>(false)
  const [vistaActiva, setVistaActiva] = useState<"productos" | "cuentas" | "turnos">("productos")
  const [dialogoPago, setDialogoPago] = useState<boolean>(false)
  const [metodoPago, setMetodoPago] = useState<string>("")
  const [pedidosPendientes, setPedidosPendientes] = useState<Pedido[]>([])
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
  const [dialogoImpresion, setDialogoImpresion] = useState<boolean>(false)
  const [personasEnMesa, setPersonasEnMesa] = useState<number>(1)

  // Estados para turnos/cajas
  const [dialogoAbrirCaja, setDialogoAbrirCaja] = useState<boolean>(false)
  const [dialogoCerrarCaja, setDialogoCerrarCaja] = useState<boolean>(false)
  const [cajaInicial, setCajaInicial] = useState<string>("")
  const [efectivoReal, setEfectivoReal] = useState<string>("")
  const [tarjetaReal, setTarjetaReal] = useState<string>("")
  const [otrosReal, setOtrosReal] = useState<string>("")
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string>("")

  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Hooks
  const {
    cajas,
    cajaActual,
    empleadosConPermisosPOS, // Usar solo empleados con permisos
    loading: loadingCajas,
    abrirCaja,
    cerrarCaja,
    crearPedido,
    procesarPago,
    obtenerPedidosPendientes,
  } = useCajas()

  const { menus, loading: loadingMenus, getCategorias } = useMenus()

  // Cargar pedidos pendientes
  const cargarPedidosPendientes = async () => {
    if (cajaActual) {
      const pedidos = await obtenerPedidosPendientes()
      setPedidosPendientes(pedidos)
    }
  }

  useEffect(() => {
    cargarPedidosPendientes()
  }, [cajaActual])

  // Calcular total del carrito
  const totalCarrito = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0)

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados = menus.filter((menu) => {
    const coincideBusqueda = menu.titulo.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === "todos" || menu.categoria === categoriaActiva
    return coincideBusqueda && coincideCategoria && menu.disponible
  })

  // Obtener categorías disponibles
  const categorias = getCategorias()

  // Agregar producto al carrito
  const agregarAlCarrito = (menu: any) => {
    if (!cajaActual) {
      toast({
        variant: "destructive",
        description: "Debe abrir una caja antes de realizar ventas",
        duration: 2000,
      })
      setDialogoAbrirCaja(true)
      return
    }

    setCarrito((prevCarrito) => {
      const itemExistente = prevCarrito.find((item) => item.id === menu.id)

      if (itemExistente) {
        return prevCarrito.map((item) => (item.id === menu.id ? { ...item, cantidad: item.cantidad + 1 } : item))
      } else {
        return [
          ...prevCarrito,
          {
            id: menu.id,
            nombre: menu.titulo,
            precio: menu.precio,
            cantidad: 1,
            categoria: menu.categoria,
          },
        ]
      }
    })

    toast({
      description: `${menu.titulo} agregado al carrito`,
      duration: 1500,
    })
  }

  // Agregar monto personalizado
  const agregarMontoPersonalizado = () => {
    if (!cajaActual) {
      toast({
        variant: "destructive",
        description: "Debe abrir una caja antes de realizar ventas",
        duration: 2000,
      })
      setDialogoAbrirCaja(true)
      return
    }

    if (
      !montoPersonalizado ||
      isNaN(Number.parseFloat(montoPersonalizado)) ||
      Number.parseFloat(montoPersonalizado) <= 0
    ) {
      toast({
        variant: "destructive",
        description: "Por favor ingrese un monto válido",
        duration: 2000,
      })
      return
    }

    const nuevoItem: ItemPedido = {
      id: `custom-${Date.now()}`,
      nombre: descripcionPersonalizada || "Producto personalizado",
      precio: Number.parseFloat(montoPersonalizado),
      cantidad: 1,
      categoria: "personalizado",
    }

    setCarrito((prev) => [...prev, nuevoItem])
    setMontoPersonalizado("")
    setDescripcionPersonalizada("")
    setDialogoPersonalizado(false)

    toast({
      description: "Producto personalizado agregado al carrito",
      duration: 1500,
    })
  }

  // Cambiar cantidad de un item
  const cambiarCantidad = (id: string, incremento: number) => {
    setCarrito((prevCarrito) => {
      return prevCarrito.map((item) => {
        if (item.id === id) {
          const nuevaCantidad = item.cantidad + incremento
          return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item
        }
        return item
      })
    })
  }

  // Eliminar item del carrito
  const eliminarItem = (id: string) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id))
  }

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarrito([])
  }

  // Generar pedido
  const generarPedido = async () => {
    if (!cajaActual) {
      toast({
        variant: "destructive",
        description: "Debe abrir una caja antes de realizar ventas",
        duration: 2000,
      })
      setDialogoAbrirCaja(true)
      return
    }

    if (carrito.length === 0) {
      toast({
        variant: "destructive",
        description: "El carrito está vacío",
        duration: 2000,
      })
      return
    }

    if (!mesaSeleccionada) {
      setDialogoMesa(true)
      return
    }

    try {
      const pedido = await crearPedido(mesaSeleccionada, carrito, personasEnMesa)
      setIdPedido(pedido.numero_pedido)
      setPedidoGenerado(true)
      await cargarPedidosPendientes()
    } catch (error) {
      console.error("Error generando pedido:", error)
    }
  }

  // Finalizar y crear nuevo pedido
  const finalizarPedido = () => {
    setPedidoGenerado(false)
    setIdPedido(null)
    setCarrito([])
    setMesaSeleccionada(null)
    setPersonasEnMesa(1)
  }

  // Procesar pago de un pedido
  const procesarPagoHandler = async () => {
    if (!pedidoSeleccionado || !metodoPago) {
      toast({
        variant: "destructive",
        description: "Por favor seleccione un método de pago",
        duration: 2000,
      })
      return
    }

    try {
      await procesarPago(pedidoSeleccionado.id, metodoPago as any, pedidoSeleccionado.total)

      setDialogoPago(false)
      setPedidoSeleccionado(null)
      setMetodoPago("")
      await cargarPedidosPendientes()
    } catch (error) {
      console.error("Error procesando pago:", error)
    }
  }

  // Abrir caja
  const abrirCajaHandler = async () => {
    if (!empleadoSeleccionado || !cajaInicial || isNaN(Number(cajaInicial)) || Number(cajaInicial) < 0) {
      toast({
        variant: "destructive",
        description: "Por favor complete todos los campos correctamente",
        duration: 2000,
      })
      return
    }

    try {
      await abrirCaja(empleadoSeleccionado, Number(cajaInicial))
      setCajaInicial("")
      setEmpleadoSeleccionado("")
      setDialogoAbrirCaja(false)
    } catch (error) {
      console.error("Error abriendo caja:", error)
    }
  }

  // Cerrar caja
  const cerrarCajaHandler = async () => {
    if (!cajaActual) return

    if (
      !efectivoReal ||
      isNaN(Number(efectivoReal)) ||
      !tarjetaReal ||
      isNaN(Number(tarjetaReal)) ||
      !otrosReal ||
      isNaN(Number(otrosReal))
    ) {
      toast({
        variant: "destructive",
        description: "Por favor complete todos los campos con valores válidos",
        duration: 2000,
      })
      return
    }

    try {
      await cerrarCaja(cajaActual.id, Number(efectivoReal), Number(tarjetaReal), Number(otrosReal))
      setEfectivoReal("")
      setTarjetaReal("")
      setOtrosReal("")
      setDialogoCerrarCaja(false)
    } catch (error) {
      console.error("Error cerrando caja:", error)
    }
  }

  // Verificar si hay pedidos pendientes antes de cerrar caja
  const verificarCierreCaja = () => {
    if (pedidosPendientes.length > 0) {
      toast({
        variant: "destructive",
        description: "No puede cerrar la caja con pedidos pendientes",
        duration: 3000,
      })
      return
    }

    setDialogoCerrarCaja(true)
  }

  if (loadingCajas || loadingMenus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando punto de venta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
        <div className="flex gap-2">
          <Button
            variant={vistaActiva === "productos" ? "default" : "outline"}
            onClick={() => setVistaActiva("productos")}
          >
            <UtensilsCrossed className="mr-2 h-4 w-4" />
            Productos
          </Button>
          <Button variant={vistaActiva === "cuentas" ? "default" : "outline"} onClick={() => setVistaActiva("cuentas")}>
            <Receipt className="mr-2 h-4 w-4" />
            Cuentas
          </Button>
          <Button variant={vistaActiva === "turnos" ? "default" : "outline"} onClick={() => setVistaActiva("turnos")}>
            <Clock className="mr-2 h-4 w-4" />
            Turnos
          </Button>
        </div>
      </div>

      {/* Información de la caja actual */}
      {cajaActual ? (
        <Alert className="bg-green-50 border-green-200">
          <Clock className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Caja #{cajaActual.id.slice(-8)} activa</AlertTitle>
          <AlertDescription className="text-green-700">
            Abierta el {cajaActual.fecha_apertura} a las {cajaActual.hora_apertura} •{cajaActual.total_pedidos} pedidos
            • {cajaActual.total_personas} personas • ${cajaActual.total_ventas.toFixed(2)} en ventas
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay caja activa</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Debe abrir una caja para realizar operaciones en el POS</span>
            <Button size="sm" onClick={() => setDialogoAbrirCaja(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Abrir Caja
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta si no hay empleados con permisos */}
      {empleadosConPermisosPOS.length === 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <ShieldCheck className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Sin empleados autorizados</AlertTitle>
          <AlertDescription className="text-yellow-700">
            No hay empleados con permisos para operar el punto de venta. Configure los permisos en la sección de
            empleados.
          </AlertDescription>
        </Alert>
      )}

      {vistaActiva === "productos" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Panel de productos - ocupa 2/3 en desktop */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar producto..."
                  className="pl-8"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <Button onClick={() => setDialogoPersonalizado(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Monto Personalizado
              </Button>
            </div>

            <Tabs defaultValue="platos-principales" onValueChange={setCategoriaActiva}>
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="w-full justify-start h-12 p-1">
                  <TabsTrigger value="todos" className="h-10">
                    Todos
                  </TabsTrigger>
                  {categorias.map((categoria) => (
                    <TabsTrigger key={categoria} value={categoria} className="h-10">
                      {categoria === "platos-principales" && <UtensilsCrossed className="mr-2 h-4 w-4" />}
                      {categoria === "entradas" && <Pizza className="mr-2 h-4 w-4" />}
                      {categoria === "bebidas" && <Coffee className="mr-2 h-4 w-4" />}
                      {categoria === "vinos" && <Wine className="mr-2 h-4 w-4" />}
                      {categoria === "postres" && <IceCream className="mr-2 h-4 w-4" />}
                      {categoria.charAt(0).toUpperCase() + categoria.slice(1).replace("-", " ")}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {/* Contenido de todas las pestañas */}
              <TabsContent value="todos" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productosFiltrados.map((menu) => (
                    <ProductoCard key={menu.id} producto={menu} onAgregar={agregarAlCarrito} />
                  ))}
                </div>
              </TabsContent>

              {/* Contenido específico por categoría */}
              {categorias.map((categoria) => (
                <TabsContent key={categoria} value={categoria} className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productosFiltrados.map((menu) => (
                      <ProductoCard key={menu.id} producto={menu} onAgregar={agregarAlCarrito} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Panel del carrito - ocupa 1/3 en desktop */}
          <div className="md:col-span-1">
            <Card className="h-full flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Ticket Actual</h2>
                  {mesaSeleccionada ? (
                    <Button variant="outline" onClick={() => setDialogoMesa(true)}>
                      <TableIcon className="mr-2 h-4 w-4" />
                      Mesa {mesaSeleccionada}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setDialogoMesa(true)}>
                      Seleccionar Mesa
                    </Button>
                  )}
                </div>

                {carrito.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>El carrito está vacío</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="space-y-3">
                      {carrito.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="flex justify-between items-start p-2 border rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{item.nombre}</div>
                            <div className="text-sm text-muted-foreground">
                              ${item.precio.toFixed(2)} x {item.cantidad}
                            </div>
                            {item.categoria === "personalizado" && (
                              <Badge variant="outline" className="mt-1">
                                Personalizado
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="font-bold">${(item.precio * item.cantidad).toFixed(2)}</div>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => cambiarCantidad(item.id, -1)}
                                disabled={item.cantidad <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.cantidad}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => cambiarCantidad(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => eliminarItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${totalCarrito.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="personas" className="text-sm whitespace-nowrap">
                      Personas:
                    </label>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setPersonasEnMesa((prev) => Math.max(1, prev - 1))}
                        disabled={personasEnMesa <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{personasEnMesa}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setPersonasEnMesa((prev) => prev + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={carrito.length === 0}
                      onClick={vaciarCarrito}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Vaciar
                    </Button>

                    <Button className="w-full" disabled={carrito.length === 0} onClick={generarPedido}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Generar Pedido
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : vistaActiva === "cuentas" ? (
        // Vista de Cuentas
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Pedidos Pendientes</h2>
            <Button variant="outline" onClick={() => setVistaActiva("productos")}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </div>

          {pedidosPendientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TableIcon className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">No hay pedidos pendientes</p>
              <p className="text-sm">Crea un nuevo pedido para generar una cuenta</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {pedidosPendientes.map((pedido) => (
                <Card key={pedido.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <TableIcon className="mr-2 h-5 w-5" />
                        Mesa {pedido.mesa}
                      </CardTitle>
                      <Badge>#{pedido.numero_pedido}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total:</span>
                        <span className="font-bold">${pedido.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Hora:</span>
                        <div className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {pedido.hora}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Personas:</span>
                        <div className="flex items-center text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          {pedido.personas}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t">
                      <div className="text-sm font-medium mb-2">Items:</div>
                      <ScrollArea className="h-20">
                        <div className="space-y-1">
                          {(pedido.items as ItemPedido[]).map((item, index) => (
                            <div key={index} className="text-sm flex justify-between">
                              <span>
                                {item.cantidad}x {item.nombre}
                              </span>
                              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-2">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setPedidoSeleccionado(pedido)
                        setDialogoPago(true)
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Cobrar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Vista de Turnos
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Gestión de Cajas</h2>
            {cajaActual ? (
              <Button variant="destructive" onClick={verificarCierreCaja}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Caja
              </Button>
            ) : (
              <Button onClick={() => setDialogoAbrirCaja(true)} disabled={empleadosConPermisosPOS.length === 0}>
                <LogIn className="mr-2 h-4 w-4" />
                Abrir Caja
              </Button>
            )}
          </div>

          {/* Caja Actual */}
          {cajaActual && (
            <Card>
              <CardHeader>
                <CardTitle>Caja Actual #{cajaActual.id.slice(-8)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha de apertura:</span>
                      <span>{cajaActual.fecha_apertura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Hora de apertura:</span>
                      <span>{cajaActual.hora_apertura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Caja inicial:</span>
                      <span>${cajaActual.caja_inicial.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Ventas realizadas:</span>
                      <span>${cajaActual.total_ventas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Pedidos procesados:</span>
                      <span>{cajaActual.total_pedidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Personas atendidas:</span>
                      <span>{cajaActual.total_personas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Activo
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Resumen de ventas por método de pago */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-3">Ventas por método de pago</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Banknote className="h-5 w-5 mr-2 text-green-600" />
                            <span>Efectivo</span>
                          </div>
                          <span className="font-bold">${cajaActual.efectivo_esperado.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CardIcon className="h-5 w-5 mr-2 text-blue-600" />
                            <span>Tarjeta</span>
                          </div>
                          <span className="font-bold">${cajaActual.tarjeta_esperado.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Wallet className="h-5 w-5 mr-2 text-purple-600" />
                            <span>Otros</span>
                          </div>
                          <span className="font-bold">${cajaActual.otros_esperado.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="destructive" onClick={verificarCierreCaja}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Caja
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Historial de Cajas */}
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Historial de Cajas</h2>
            <Card>
              <CardContent className="p-4">
                {cajas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mb-2 opacity-20" />
                    <p>No hay cajas en el historial</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Ventas</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Personas</TableHead>
                        <TableHead>Diferencia</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cajas.map((caja) => (
                        <TableRow key={caja.id}>
                          <TableCell>#{caja.id.slice(-8)}</TableCell>
                          <TableCell>{caja.fecha_apertura}</TableCell>
                          <TableCell>
                            {caja.hora_apertura} - {caja.hora_cierre || "Abierto"}
                          </TableCell>
                          <TableCell>{(caja as any).empleados?.nombre || "N/A"}</TableCell>
                          <TableCell>${caja.total_ventas.toFixed(2)}</TableCell>
                          <TableCell>{caja.total_pedidos}</TableCell>
                          <TableCell>{caja.total_personas}</TableCell>
                          <TableCell
                            className={
                              caja.diferencia === null
                                ? ""
                                : caja.diferencia === 0
                                  ? "text-green-600"
                                  : caja.diferencia > 0
                                    ? "text-blue-600"
                                    : "text-red-600"
                            }
                          >
                            {caja.diferencia !== null ? `$${caja.diferencia.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={caja.estado === "abierto" ? "default" : "secondary"}>{caja.estado}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Diálogo para abrir caja */}
      <Dialog open={dialogoAbrirCaja} onOpenChange={setDialogoAbrirCaja}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Nueva Caja</DialogTitle>
            <DialogDescription>Complete la información para iniciar una nueva caja de trabajo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="empleado" className="text-sm font-medium">
                Empleado Autorizado
              </label>
              {empleadosConPermisosPOS.length === 0 ? (
                <div className="p-3 border rounded-md bg-muted/50 text-muted-foreground text-sm">
                  No hay empleados con permisos de POS disponibles
                </div>
              ) : (
                <Select value={empleadoSeleccionado} onValueChange={setEmpleadoSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado con permisos de POS" />
                  </SelectTrigger>
                  <SelectContent>
                    {empleadosConPermisosPOS.map((empleado) => (
                      <SelectItem key={empleado.id} value={empleado.id}>
                        <div className="flex items-center">
                          <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                          {empleado.nombre} - {empleado.cargo}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {empleadosConPermisosPOS.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Configure permisos de punto de venta para los empleados en la sección de empleados.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="cajaInicial" className="text-sm font-medium">
                Caja Inicial ($)
              </label>
              <Input
                id="cajaInicial"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={cajaInicial}
                onChange={(e) => setCajaInicial(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              La caja inicial es el monto con el que comienza el turno para dar cambio. Solo empleados con permisos de
              punto de venta pueden abrir cajas.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbrirCaja(false)}>
              Cancelar
            </Button>
            <Button onClick={abrirCajaHandler} disabled={empleadosConPermisosPOS.length === 0}>
              <LogIn className="mr-2 h-4 w-4" />
              Abrir Caja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para cerrar caja */}
      <Dialog open={dialogoCerrarCaja} onOpenChange={setDialogoCerrarCaja}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cerrar Caja #{cajaActual?.id.slice(-8)}</DialogTitle>
            <DialogDescription>Verifique los montos de caja antes de cerrar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-3">Resumen de la Caja</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Caja Inicial:</span>
                    <span>${cajaActual?.caja_inicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas Totales:</span>
                    <span>${cajaActual?.total_ventas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedidos Procesados:</span>
                    <span>{cajaActual?.total_pedidos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personas Atendidas:</span>
                    <span>{cajaActual?.total_personas}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Ventas por Método de Pago</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Efectivo Esperado:</span>
                    <span>${cajaActual?.efectivo_esperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarjeta Esperado:</span>
                    <span>${cajaActual?.tarjeta_esperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Otros Esperado:</span>
                    <span>${cajaActual?.otros_esperado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Esperado:</span>
                    <span>
                      $
                      {(
                        (cajaActual?.efectivo_esperado || 0) +
                        (cajaActual?.tarjeta_esperado || 0) +
                        (cajaActual?.otros_esperado || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Verificación de Caja</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="efectivoReal" className="text-sm font-medium">
                    Efectivo Real ($)
                  </label>
                  <Input
                    id="efectivoReal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={efectivoReal}
                    onChange={(e) => setEfectivoReal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="tarjetaReal" className="text-sm font-medium">
                    Tarjeta Real ($)
                  </label>
                  <Input
                    id="tarjetaReal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={tarjetaReal}
                    onChange={(e) => setTarjetaReal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="otrosReal" className="text-sm font-medium">
                    Otros Real ($)
                  </label>
                  <Input
                    id="otrosReal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={otrosReal}
                    onChange={(e) => setOtrosReal(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Ingrese los montos reales contados al cierre de la caja.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoCerrarCaja(false)}>
              Cancelar
            </Button>
            <Button onClick={cerrarCajaHandler}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Cierre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para monto personalizado */}
      <Dialog open={dialogoPersonalizado} onOpenChange={setDialogoPersonalizado}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Monto Personalizado</DialogTitle>
            <DialogDescription>
              Ingrese un monto y descripción para un producto que no está en el menú.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="descripcion" className="text-sm font-medium">
                Descripción
              </label>
              <Input
                id="descripcion"
                placeholder="Ej: Plato especial del chef"
                value={descripcionPersonalizada}
                onChange={(e) => setDescripcionPersonalizada(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="monto" className="text-sm font-medium">
                Monto ($)
              </label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={montoPersonalizado}
                onChange={(e) => setMontoPersonalizado(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoPersonalizado(false)}>
              Cancelar
            </Button>
            <Button onClick={agregarMontoPersonalizado}>Agregar al Carrito</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para seleccionar mesa */}
      <Dialog open={dialogoMesa} onOpenChange={setDialogoMesa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar Mesa</DialogTitle>
            <DialogDescription>Elija la mesa para este pedido.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 py-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((mesa) => (
              <Button
                key={mesa}
                variant={mesaSeleccionada === mesa ? "default" : "outline"}
                className="h-16 text-lg"
                onClick={() => {
                  setMesaSeleccionada(mesa)
                  setDialogoMesa(false)
                }}
              >
                {mesa}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoMesa(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de procesamiento de pago */}
      <Dialog open={dialogoPago} onOpenChange={setDialogoPago}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Seleccione el método de pago para el pedido #{pedidoSeleccionado?.numero_pedido}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center text-lg">
              <div className="font-medium">Total a cobrar:</div>
              <div className="font-bold">${pedidoSeleccionado?.total.toFixed(2)}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Método de pago</label>
              <Select value={metodoPago} onValueChange={setMetodoPago}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">
                    <div className="flex items-center">
                      <Banknote className="mr-2 h-4 w-4" />
                      Efectivo
                    </div>
                  </SelectItem>
                  <SelectItem value="tarjeta">
                    <div className="flex items-center">
                      <CardIcon className="mr-2 h-4 w-4" />
                      Tarjeta de Crédito/Débito
                    </div>
                  </SelectItem>
                  <SelectItem value="transferencia">
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Transferencia
                    </div>
                  </SelectItem>
                  <SelectItem value="otro">
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Otro método
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoPago(false)}>
              Cancelar
            </Button>
            <Button onClick={procesarPagoHandler}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de impresión (simulado) */}
      <Dialog open={dialogoImpresion} onOpenChange={setDialogoImpresion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Printer className="mr-2 h-5 w-5" />
              Imprimiendo Ticket
            </DialogTitle>
          </DialogHeader>

          <div className="py-8 flex flex-col items-center justify-center">
            <div className="animate-pulse mb-4">
              <Printer className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-center">Enviando el ticket a la impresora...</p>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogoImpresion(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notificación de pedido generado */}
      {isDesktop ? (
        <Dialog open={pedidoGenerado} onOpenChange={setPedidoGenerado}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Pedido Generado Exitosamente
              </DialogTitle>
              <DialogDescription>El pedido ha sido registrado correctamente.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Número de Pedido:</span>
                <span className="font-bold text-lg">#{idPedido}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Mesa:</span>
                <span>{mesaSeleccionada}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Personas:</span>
                <span>{personasEnMesa}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${totalCarrito.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Productos:</span>
                <span>{carrito.length}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={finalizarPedido}>Nuevo Pedido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={pedidoGenerado} onOpenChange={setPedidoGenerado}>
          <DrawerContent>
            <DrawerHeader className="text-center">
              <DrawerTitle className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Pedido Generado Exitosamente
              </DrawerTitle>
              <DrawerDescription>El pedido ha sido registrado correctamente.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-4 py-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Número de Pedido:</span>
                <span className="font-bold text-lg">#{idPedido}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Mesa:</span>
                <span>{mesaSeleccionada}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Personas:</span>
                <span>{personasEnMesa}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${totalCarrito.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Productos:</span>
                <span>{carrito.length}</span>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={finalizarPedido}>Nuevo Pedido</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

// Componente de tarjeta de producto
function ProductoCard({
  producto,
  onAgregar,
}: {
  producto: any
  onAgregar: (producto: any) => void
}) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onAgregar(producto)}
    >
      <div className="aspect-video w-full bg-muted relative">
        <img
          src={producto.imagen_url || `/placeholder.svg?height=100&width=200`}
          alt={producto.titulo}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="p-3">
        <div className="font-medium truncate">{producto.titulo}</div>
        <div className="text-xs text-muted-foreground truncate mb-2">{producto.descripcion}</div>
        <div className="flex justify-between items-center">
          <span className="font-bold">${producto.precio.toFixed(2)}</span>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
