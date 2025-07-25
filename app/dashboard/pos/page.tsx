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
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Tipos
interface ProductoMenu {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen?: string
  disponible: boolean
}

interface ItemPedido {
  id: number
  nombre: string
  precio: number
  cantidad: number
  esPersonalizado?: boolean
  notas?: string
}

interface Pedido {
  id: number
  mesa: number
  items: ItemPedido[]
  total: number
  fecha: string
  hora: string
  estado: "abierto" | "cerrado" | "pagado"
  metodoPago?: string
  turnoId?: number
  personas?: number
}

interface CuentaMesa {
  mesa: number
  pedidos: Pedido[]
  totalPendiente: number
}

interface Turno {
  id: number
  fechaApertura: string
  horaApertura: string
  fechaCierre?: string
  horaCierre?: string
  cajaInicial: number
  cajaFinal?: number
  efectivoEsperado?: number
  tarjetaEsperado?: number
  otrosEsperado?: number
  efectivoReal?: number
  tarjetaReal?: number
  otrosReal?: number
  diferencia?: number
  totalVentas: number
  totalPedidos: number
  totalPersonas: number
  estado: "abierto" | "cerrado"
  usuario: string
}

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
  const [cuentasMesas, setCuentasMesas] = useState<CuentaMesa[]>([])
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaMesa | null>(null)
  const [dialogoCuenta, setDialogoCuenta] = useState<boolean>(false)
  const [dialogoPago, setDialogoPago] = useState<boolean>(false)
  const [metodoPago, setMetodoPago] = useState<string>("")
  const [pedidosHistorial, setPedidosHistorial] = useState<Pedido[]>([])
  const [dialogoImpresion, setDialogoImpresion] = useState<boolean>(false)
  const [personasEnMesa, setPersonasEnMesa] = useState<number>(1)

  // Estados para turnos
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null)
  const [historialTurnos, setHistorialTurnos] = useState<Turno[]>([])
  const [dialogoAbrirTurno, setDialogoAbrirTurno] = useState<boolean>(false)
  const [dialogoCerrarTurno, setDialogoCerrarTurno] = useState<boolean>(false)
  const [cajaInicial, setCajaInicial] = useState<string>("")
  const [efectivoReal, setEfectivoReal] = useState<string>("")
  const [tarjetaReal, setTarjetaReal] = useState<string>("")
  const [otrosReal, setOtrosReal] = useState<string>("")
  const [usuarioTurno, setUsuarioTurno] = useState<string>("Admin")

  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Cargar datos guardados al iniciar
  useEffect(() => {
    // En una aplicación real, estos datos vendrían de una API
    // Aquí simulamos cargar datos guardados
    const cuentasGuardadas: CuentaMesa[] = [
      {
        mesa: 1,
        pedidos: [
          {
            id: 5001,
            mesa: 1,
            items: [
              { id: 1, nombre: "Pasta Carbonara", precio: 12.99, cantidad: 2 },
              { id: 7, nombre: "Mojito", precio: 8.99, cantidad: 2 },
            ],
            total: 43.96,
            fecha: "20/05/2025",
            hora: "19:30",
            estado: "abierto",
            personas: 2,
          },
        ],
        totalPendiente: 43.96,
      },
      {
        mesa: 3,
        pedidos: [
          {
            id: 5002,
            mesa: 3,
            items: [
              { id: 3, nombre: "Filete de Salmón", precio: 18.99, cantidad: 1 },
              { id: 8, nombre: "Limonada Casera", precio: 3.99, cantidad: 1 },
            ],
            total: 22.98,
            fecha: "20/05/2025",
            hora: "19:15",
            estado: "abierto",
            personas: 1,
          },
          {
            id: 5003,
            mesa: 3,
            items: [{ id: 10, nombre: "Tiramisú", precio: 6.99, cantidad: 2 }],
            total: 13.98,
            fecha: "20/05/2025",
            hora: "20:05",
            estado: "abierto",
            personas: 2,
          },
        ],
        totalPendiente: 36.96,
      },
    ]

    setCuentasMesas(cuentasGuardadas)

    // Historial de pedidos pagados
    const historialPedidos: Pedido[] = [
      {
        id: 4001,
        mesa: 2,
        items: [
          { id: 5, nombre: "Paella de Mariscos", precio: 24.99, cantidad: 1 },
          { id: 6, nombre: "Vino Tinto Reserva", precio: 29.99, cantidad: 1 },
        ],
        total: 54.98,
        fecha: "20/05/2025",
        hora: "18:45",
        estado: "pagado",
        metodoPago: "tarjeta",
        personas: 2,
      },
      {
        id: 4002,
        mesa: 5,
        items: [
          { id: 16, nombre: "Hamburguesa Gourmet", precio: 15.99, cantidad: 2 },
          { id: 12, nombre: "Agua Mineral", precio: 2.5, cantidad: 2 },
        ],
        total: 36.98,
        fecha: "20/05/2025",
        hora: "18:30",
        estado: "pagado",
        metodoPago: "efectivo",
        personas: 2,
      },
    ]

    setPedidosHistorial(historialPedidos)

    // Historial de turnos
    const turnosHistorial: Turno[] = [
      {
        id: 1,
        fechaApertura: "19/05/2025",
        horaApertura: "08:00",
        fechaCierre: "19/05/2025",
        horaCierre: "16:00",
        cajaInicial: 100,
        cajaFinal: 587.45,
        efectivoEsperado: 300.5,
        tarjetaEsperado: 186.95,
        otrosEsperado: 0,
        efectivoReal: 300.5,
        tarjetaReal: 186.95,
        otrosReal: 0,
        diferencia: 0,
        totalVentas: 487.45,
        totalPedidos: 15,
        totalPersonas: 32,
        estado: "cerrado",
        usuario: "Carlos Rodríguez",
      },
      {
        id: 2,
        fechaApertura: "19/05/2025",
        horaApertura: "16:00",
        fechaCierre: "20/05/2025",
        horaCierre: "00:00",
        cajaInicial: 200,
        cajaFinal: 845.75,
        efectivoEsperado: 420.8,
        tarjetaEsperado: 224.95,
        otrosEsperado: 0,
        efectivoReal: 420.8,
        tarjetaReal: 224.95,
        otrosReal: 0,
        diferencia: 0,
        totalVentas: 645.75,
        totalPedidos: 22,
        totalPersonas: 48,
        estado: "cerrado",
        usuario: "María López",
      },
    ]

    setHistorialTurnos(turnosHistorial)
  }, [])

  // Calcular total del carrito
  const totalCarrito = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0)

  // Filtrar productos por búsqueda y categoría
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = categoriaActiva === "todos" || producto.categoria === categoriaActiva
    return coincideBusqueda && coincideCategoria && producto.disponible
  })

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: ProductoMenu) => {
    if (!turnoActual) {
      toast({
        variant: "destructive",
        description: "Debe abrir un turno antes de realizar ventas",
        duration: 2000,
      })
      setDialogoAbrirTurno(true)
      return
    }

    setCarrito((prevCarrito) => {
      const itemExistente = prevCarrito.find((item) => item.id === producto.id && !item.esPersonalizado)

      if (itemExistente) {
        return prevCarrito.map((item) =>
          item.id === producto.id && !item.esPersonalizado ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      } else {
        return [...prevCarrito, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 }]
      }
    })

    // Mostrar toast de confirmación
    toast({
      description: `${producto.nombre} agregado al carrito`,
      duration: 1500,
    })
  }

  // Agregar monto personalizado
  const agregarMontoPersonalizado = () => {
    if (!turnoActual) {
      toast({
        variant: "destructive",
        description: "Debe abrir un turno antes de realizar ventas",
        duration: 2000,
      })
      setDialogoAbrirTurno(true)
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
      id: Date.now(), // ID único basado en timestamp
      nombre: descripcionPersonalizada || "Producto personalizado",
      precio: Number.parseFloat(montoPersonalizado),
      cantidad: 1,
      esPersonalizado: true,
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
  const cambiarCantidad = (id: number, incremento: number) => {
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
  const eliminarItem = (id: number) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id))
  }

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarrito([])
  }

  // Generar pedido
  const generarPedido = () => {
    if (!turnoActual) {
      toast({
        variant: "destructive",
        description: "Debe abrir un turno antes de realizar ventas",
        duration: 2000,
      })
      setDialogoAbrirTurno(true)
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

    // Generar ID de pedido (en una app real, esto vendría del backend)
    const nuevoPedidoId = Math.floor(1000 + Math.random() * 9000)

    // Crear nuevo pedido
    const nuevoPedido: Pedido = {
      id: nuevoPedidoId,
      mesa: mesaSeleccionada,
      items: [...carrito],
      total: totalCarrito,
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      estado: "abierto",
      turnoId: turnoActual.id,
      personas: personasEnMesa,
    }

    // Actualizar cuentas de mesas
    setCuentasMesas((prevCuentas) => {
      // Buscar si ya existe una cuenta para esta mesa
      const cuentaExistente = prevCuentas.find((cuenta) => cuenta.mesa === mesaSeleccionada)

      if (cuentaExistente) {
        // Actualizar cuenta existente
        return prevCuentas.map((cuenta) => {
          if (cuenta.mesa === mesaSeleccionada) {
            return {
              ...cuenta,
              pedidos: [...cuenta.pedidos, nuevoPedido],
              totalPendiente: cuenta.totalPendiente + totalCarrito,
            }
          }
          return cuenta
        })
      } else {
        // Crear nueva cuenta para la mesa
        return [
          ...prevCuentas,
          {
            mesa: mesaSeleccionada,
            pedidos: [nuevoPedido],
            totalPendiente: totalCarrito,
          },
        ]
      }
    })

    // Actualizar estadísticas del turno actual
    setTurnoActual((prev) => {
      if (!prev) return null
      return {
        ...prev,
        totalPedidos: prev.totalPedidos + 1,
        totalPersonas: prev.totalPersonas + personasEnMesa,
      }
    })

    setIdPedido(nuevoPedidoId)
    setPedidoGenerado(true)

    // En una app real, aquí enviaríamos el pedido al backend
    console.log("Pedido generado:", nuevoPedido)
  }

  // Finalizar y crear nuevo pedido
  const finalizarPedido = () => {
    setPedidoGenerado(false)
    setIdPedido(null)
    setCarrito([])
    setMesaSeleccionada(null)
    setPersonasEnMesa(1)
  }

  // Procesar pago de una cuenta
  const procesarPago = () => {
    if (!turnoActual) {
      toast({
        variant: "destructive",
        description: "Debe abrir un turno antes de procesar pagos",
        duration: 2000,
      })
      setDialogoAbrirTurno(true)
      return
    }

    if (!cuentaSeleccionada || !metodoPago) {
      toast({
        variant: "destructive",
        description: "Por favor seleccione un método de pago",
        duration: 2000,
      })
      return
    }

    // Actualizar estado de los pedidos a pagados
    const pedidosPagados = cuentaSeleccionada.pedidos.map((pedido) => ({
      ...pedido,
      estado: "pagado" as const,
      metodoPago,
      turnoId: turnoActual.id,
    }))

    // Añadir al historial de pedidos
    setPedidosHistorial((prev) => [...prev, ...pedidosPagados])

    // Actualizar estadísticas del turno actual
    setTurnoActual((prev) => {
      if (!prev) return null

      // Calcular totales por método de pago
      let nuevoEfectivoEsperado = prev.efectivoEsperado || 0
      let nuevoTarjetaEsperado = prev.tarjetaEsperado || 0
      let nuevoOtrosEsperado = prev.otrosEsperado || 0

      if (metodoPago === "efectivo") {
        nuevoEfectivoEsperado += cuentaSeleccionada.totalPendiente
      } else if (metodoPago === "tarjeta") {
        nuevoTarjetaEsperado += cuentaSeleccionada.totalPendiente
      } else {
        nuevoOtrosEsperado += cuentaSeleccionada.totalPendiente
      }

      return {
        ...prev,
        totalVentas: prev.totalVentas + cuentaSeleccionada.totalPendiente,
        efectivoEsperado: nuevoEfectivoEsperado,
        tarjetaEsperado: nuevoTarjetaEsperado,
        otrosEsperado: nuevoOtrosEsperado,
      }
    })

    // Eliminar la cuenta de la mesa
    setCuentasMesas((prev) => prev.filter((cuenta) => cuenta.mesa !== cuentaSeleccionada.mesa))

    // Cerrar diálogos
    setDialogoPago(false)
    setDialogoCuenta(false)
    setCuentaSeleccionada(null)
    setMetodoPago("")

    toast({
      description: `Pago procesado correctamente para la mesa ${cuentaSeleccionada.mesa}`,
      duration: 2000,
    })
  }

  // Imprimir cuenta (simulado)
  const imprimirCuenta = () => {
    if (!cuentaSeleccionada) return

    setDialogoImpresion(true)

    // En una aplicación real, aquí se enviaría la orden de impresión
    console.log("Imprimiendo cuenta para mesa:", cuentaSeleccionada)
  }

  // Abrir un nuevo turno
  const abrirTurno = () => {
    if (!cajaInicial || isNaN(Number(cajaInicial)) || Number(cajaInicial) < 0) {
      toast({
        variant: "destructive",
        description: "Por favor ingrese un monto válido para la caja inicial",
        duration: 2000,
      })
      return
    }

    const nuevoTurno: Turno = {
      id: historialTurnos.length + 3, // Simulamos un ID incremental
      fechaApertura: new Date().toLocaleDateString(),
      horaApertura: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      cajaInicial: Number(cajaInicial),
      totalVentas: 0,
      totalPedidos: 0,
      totalPersonas: 0,
      estado: "abierto",
      usuario: usuarioTurno,
    }

    setTurnoActual(nuevoTurno)
    setCajaInicial("")
    setDialogoAbrirTurno(false)

    toast({
      description: `Turno #${nuevoTurno.id} abierto correctamente`,
      duration: 2000,
    })
  }

  // Cerrar el turno actual
  const cerrarTurno = () => {
    if (!turnoActual) return

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

    // Calcular totales
    const efectivoRealNum = Number(efectivoReal)
    const tarjetaRealNum = Number(tarjetaReal)
    const otrosRealNum = Number(otrosReal)

    const efectivoEsperadoNum = turnoActual.efectivoEsperado || 0
    const tarjetaEsperadoNum = turnoActual.tarjetaEsperado || 0
    const otrosEsperadoNum = turnoActual.otrosEsperado || 0

    const totalEsperado = efectivoEsperadoNum + tarjetaEsperadoNum + otrosEsperadoNum
    const totalReal = efectivoRealNum + tarjetaRealNum + otrosRealNum
    const diferencia = totalReal - totalEsperado

    const cajaFinal = turnoActual.cajaInicial + totalReal

    // Crear turno cerrado
    const turnoCerrado: Turno = {
      ...turnoActual,
      fechaCierre: new Date().toLocaleDateString(),
      horaCierre: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      cajaFinal,
      efectivoEsperado: efectivoEsperadoNum,
      tarjetaEsperado: tarjetaEsperadoNum,
      otrosEsperado: otrosEsperadoNum,
      efectivoReal: efectivoRealNum,
      tarjetaReal: tarjetaRealNum,
      otrosReal: otrosRealNum,
      diferencia,
      estado: "cerrado",
    }

    // Actualizar historial de turnos
    setHistorialTurnos((prev) => [...prev, turnoCerrado])

    // Cerrar turno actual
    setTurnoActual(null)
    setEfectivoReal("")
    setTarjetaReal("")
    setOtrosReal("")
    setDialogoCerrarTurno(false)

    toast({
      description: `Turno #${turnoCerrado.id} cerrado correctamente`,
      duration: 2000,
    })
  }

  // Verificar si hay cuentas pendientes antes de cerrar turno
  const verificarCierreTurno = () => {
    if (cuentasMesas.length > 0) {
      toast({
        variant: "destructive",
        description: "No puede cerrar el turno con cuentas pendientes",
        duration: 3000,
      })
      return
    }

    setDialogoCerrarTurno(true)
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

      {/* Información del turno actual */}
      {turnoActual ? (
        <Alert className="bg-green-50 border-green-200">
          <Clock className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Turno #{turnoActual.id} activo</AlertTitle>
          <AlertDescription className="text-green-700">
            Abierto el {turnoActual.fechaApertura} a las {turnoActual.horaApertura} por {turnoActual.usuario} •
            {turnoActual.totalPedidos} pedidos • {turnoActual.totalPersonas} personas • $
            {turnoActual.totalVentas.toFixed(2)} en ventas
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay turno activo</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Debe abrir un turno para realizar operaciones en el POS</span>
            <Button size="sm" onClick={() => setDialogoAbrirTurno(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Abrir Turno
            </Button>
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
                  <TabsTrigger value="platos-principales" className="h-10">
                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                    Platos Principales
                  </TabsTrigger>
                  <TabsTrigger value="entradas" className="h-10">
                    <Pizza className="mr-2 h-4 w-4" />
                    Entradas
                  </TabsTrigger>
                  <TabsTrigger value="bebidas" className="h-10">
                    <Coffee className="mr-2 h-4 w-4" />
                    Bebidas
                  </TabsTrigger>
                  <TabsTrigger value="vinos" className="h-10">
                    <Wine className="mr-2 h-4 w-4" />
                    Vinos
                  </TabsTrigger>
                  <TabsTrigger value="postres" className="h-10">
                    <IceCream className="mr-2 h-4 w-4" />
                    Postres
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>

              {/* Contenido de todas las pestañas */}
              <TabsContent value="todos" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productosFiltrados.map((producto) => (
                    <ProductoCard key={producto.id} producto={producto} onAgregar={agregarAlCarrito} />
                  ))}
                </div>
              </TabsContent>

              {/* Contenido específico por categoría */}
              {["platos-principales", "entradas", "bebidas", "vinos", "postres"].map((categoria) => (
                <TabsContent key={categoria} value={categoria} className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productosFiltrados.map((producto) => (
                      <ProductoCard key={producto.id} producto={producto} onAgregar={agregarAlCarrito} />
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
                      {carrito.map((item) => (
                        <div
                          key={`${item.id}-${item.esPersonalizado ? "custom" : "product"}`}
                          className="flex justify-between items-start p-2 border rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{item.nombre}</div>
                            <div className="text-sm text-muted-foreground">
                              ${item.precio.toFixed(2)} x {item.cantidad}
                            </div>
                            {item.esPersonalizado && (
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
                                className="h-7 w-7"
                                onClick={() => cambiarCantidad(item.id, -1)}
                                disabled={item.cantidad <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.cantidad}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
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
                        className="h-8 w-8"
                        onClick={() => setPersonasEnMesa((prev) => Math.max(1, prev - 1))}
                        disabled={personasEnMesa <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{personasEnMesa}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPersonasEnMesa((prev) => prev + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
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
            <h2 className="text-xl font-bold">Cuentas Activas</h2>
            <Button variant="outline" onClick={() => setVistaActiva("productos")}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </div>

          {cuentasMesas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TableIcon className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">No hay cuentas activas</p>
              <p className="text-sm">Crea un nuevo pedido para generar una cuenta</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {cuentasMesas.map((cuenta) => (
                <Card key={cuenta.mesa} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <TableIcon className="mr-2 h-5 w-5" />
                        Mesa {cuenta.mesa}
                      </CardTitle>
                      <Badge>{cuenta.pedidos.length} pedido(s)</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total pendiente:</span>
                        <span className="font-bold">${cuenta.totalPendiente.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Último pedido:</span>
                        <div className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {cuenta.pedidos[cuenta.pedidos.length - 1].hora}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Personas:</span>
                        <div className="flex items-center text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          {cuenta.pedidos.reduce((total, pedido) => total + (pedido.personas || 0), 0)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t">
                      <div className="text-sm font-medium mb-2">Resumen de pedidos:</div>
                      <ScrollArea className="h-24">
                        <div className="space-y-2">
                          {cuenta.pedidos.map((pedido) => (
                            <div key={pedido.id} className="text-sm p-2 bg-muted/50 rounded-md">
                              <div className="flex justify-between">
                                <span>#{pedido.id}</span>
                                <span>${pedido.total.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {pedido.fecha} - {pedido.hora}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-2 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCuentaSeleccionada(cuenta)
                        setDialogoCuenta(true)
                      }}
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      Ver Cuenta
                    </Button>
                    <Button
                      onClick={() => {
                        setCuentaSeleccionada(cuenta)
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

          {/* Historial de Pedidos */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Historial de Pedidos</h2>
            <Card>
              <CardContent className="p-4">
                {pedidosHistorial.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mb-2 opacity-20" />
                    <p>No hay pedidos en el historial</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Mesa</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Personas</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Método de Pago</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosHistorial.map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell>{pedido.id}</TableCell>
                          <TableCell>{pedido.mesa}</TableCell>
                          <TableCell>{pedido.fecha}</TableCell>
                          <TableCell>{pedido.hora}</TableCell>
                          <TableCell>{pedido.personas || 1}</TableCell>
                          <TableCell>${pedido.total.toFixed(2)}</TableCell>
                          <TableCell>
                            {pedido.metodoPago === "efectivo" ? (
                              <div className="flex items-center">
                                <Banknote className="h-4 w-4 mr-1" />
                                Efectivo
                              </div>
                            ) : pedido.metodoPago === "tarjeta" ? (
                              <div className="flex items-center">
                                <CardIcon className="h-4 w-4 mr-1" />
                                Tarjeta
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Wallet className="h-4 w-4 mr-1" />
                                Otro
                              </div>
                            )}
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
      ) : (
        // Vista de Turnos
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Gestión de Turnos</h2>
            {turnoActual ? (
              <Button variant="destructive" onClick={verificarCierreTurno}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Turno
              </Button>
            ) : (
              <Button onClick={() => setDialogoAbrirTurno(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Abrir Turno
              </Button>
            )}
          </div>

          {/* Turno Actual */}
          {turnoActual && (
            <Card>
              <CardHeader>
                <CardTitle>Turno Actual #{turnoActual.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha de apertura:</span>
                      <span>{turnoActual.fechaApertura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Hora de apertura:</span>
                      <span>{turnoActual.horaApertura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Caja inicial:</span>
                      <span>${turnoActual.cajaInicial.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Usuario:</span>
                      <span>{turnoActual.usuario}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Ventas realizadas:</span>
                      <span>${turnoActual.totalVentas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Pedidos procesados:</span>
                      <span>{turnoActual.totalPedidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Personas atendidas:</span>
                      <span>{turnoActual.totalPersonas}</span>
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
                          <span className="font-bold">${(turnoActual.efectivoEsperado || 0).toFixed(2)}</span>
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
                          <span className="font-bold">${(turnoActual.tarjetaEsperado || 0).toFixed(2)}</span>
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
                          <span className="font-bold">${(turnoActual.otrosEsperado || 0).toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="destructive" onClick={verificarCierreTurno}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Turno
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Historial de Turnos */}
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Historial de Turnos</h2>
            <Card>
              <CardContent className="p-4">
                {historialTurnos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mb-2 opacity-20" />
                    <p>No hay turnos en el historial</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Ventas</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Personas</TableHead>
                        <TableHead>Diferencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historialTurnos.map((turno) => (
                        <TableRow key={turno.id}>
                          <TableCell>{turno.id}</TableCell>
                          <TableCell>{turno.fechaApertura}</TableCell>
                          <TableCell>
                            {turno.horaApertura} - {turno.horaCierre}
                          </TableCell>
                          <TableCell>{turno.usuario}</TableCell>
                          <TableCell>${turno.totalVentas.toFixed(2)}</TableCell>
                          <TableCell>{turno.totalPedidos}</TableCell>
                          <TableCell>{turno.totalPersonas}</TableCell>
                          <TableCell
                            className={
                              turno.diferencia === 0
                                ? "text-green-600"
                                : turno.diferencia && turno.diferencia > 0
                                  ? "text-blue-600"
                                  : "text-red-600"
                            }
                          >
                            {turno.diferencia !== undefined ? `$${turno.diferencia.toFixed(2)}` : "-"}
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

      {/* Diálogo para abrir turno */}
      <Dialog open={dialogoAbrirTurno} onOpenChange={setDialogoAbrirTurno}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Nuevo Turno</DialogTitle>
            <DialogDescription>Complete la información para iniciar un nuevo turno de trabajo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="usuario" className="text-sm font-medium">
                Usuario
              </label>
              <Input id="usuario" value={usuarioTurno} onChange={(e) => setUsuarioTurno(e.target.value)} />
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
              La caja inicial es el monto con el que comienza el turno para dar cambio.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAbrirTurno(false)}>
              Cancelar
            </Button>
            <Button onClick={abrirTurno}>
              <LogIn className="mr-2 h-4 w-4" />
              Abrir Turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para cerrar turno */}
      <Dialog open={dialogoCerrarTurno} onOpenChange={setDialogoCerrarTurno}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cerrar Turno #{turnoActual?.id}</DialogTitle>
            <DialogDescription>Verifique los montos de caja antes de cerrar el turno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-3">Resumen del Turno</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Caja Inicial:</span>
                    <span>${turnoActual?.cajaInicial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventas Totales:</span>
                    <span>${turnoActual?.totalVentas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedidos Procesados:</span>
                    <span>{turnoActual?.totalPedidos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personas Atendidas:</span>
                    <span>{turnoActual?.totalPersonas}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Ventas por Método de Pago</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Efectivo Esperado:</span>
                    <span>${(turnoActual?.efectivoEsperado || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarjeta Esperado:</span>
                    <span>${(turnoActual?.tarjetaEsperado || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Otros Esperado:</span>
                    <span>${(turnoActual?.otrosEsperado || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Esperado:</span>
                    <span>
                      $
                      {(
                        (turnoActual?.efectivoEsperado || 0) +
                        (turnoActual?.tarjetaEsperado || 0) +
                        (turnoActual?.otrosEsperado || 0)
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
                Ingrese los montos reales contados al cierre del turno.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoCerrarTurno(false)}>
              Cancelar
            </Button>
            <Button onClick={cerrarTurno}>
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

      {/* Diálogo de detalles de cuenta */}
      <Dialog open={dialogoCuenta} onOpenChange={setDialogoCuenta}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TableIcon className="mr-2 h-5 w-5" />
              Cuenta Mesa {cuentaSeleccionada?.mesa}
            </DialogTitle>
            <DialogDescription>Detalle de todos los pedidos pendientes para esta mesa</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {cuentaSeleccionada?.pedidos.map((pedido) => (
              <div key={pedido.id} className="border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Pedido #{pedido.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {pedido.fecha} - {pedido.hora}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {pedido.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        {item.cantidad}x {item.nombre}
                      </div>
                      <div>${(item.precio * item.cantidad).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-medium pt-2 border-t">
                  <div>Subtotal</div>
                  <div>${pedido.total.toFixed(2)}</div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t text-lg font-bold">
              <div>Total a pagar</div>
              <div>${cuentaSeleccionada?.totalPendiente.toFixed(2)}</div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="sm:flex-1" onClick={imprimirCuenta}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Cuenta
            </Button>
            <Button
              className="sm:flex-1"
              onClick={() => {
                setDialogoPago(true)
                setDialogoCuenta(false)
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Procesar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de procesamiento de pago */}
      <Dialog open={dialogoPago} onOpenChange={setDialogoPago}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>Seleccione el método de pago para la mesa {cuentaSeleccionada?.mesa}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center text-lg">
              <div className="font-medium">Total a cobrar:</div>
              <div className="font-bold">${cuentaSeleccionada?.totalPendiente.toFixed(2)}</div>
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
            <Button onClick={procesarPago}>
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
              Imprimiendo Cuenta
            </DialogTitle>
          </DialogHeader>

          <div className="py-8 flex flex-col items-center justify-center">
            <div className="animate-pulse mb-4">
              <Printer className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-center">Enviando la cuenta a la impresora...</p>
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
              <DialogDescription>El pedido ha sido enviado a cocina.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Número de Pedido:</span>
                <span className="font-bold text-lg">{idPedido}</span>
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
              <DrawerDescription>El pedido ha sido enviado a cocina.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-4 py-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Número de Pedido:</span>
                <span className="font-bold text-lg">{idPedido}</span>
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
  producto: ProductoMenu
  onAgregar: (producto: ProductoMenu) => void
}) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onAgregar(producto)}
    >
      <div className="aspect-video w-full bg-muted relative">
        <img
          src={producto.imagen || `/placeholder.svg?height=100&width=200`}
          alt={producto.nombre}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="p-3">
        <div className="font-medium truncate">{producto.nombre}</div>
        <div className="flex justify-between items-center mt-1">
          <span className="font-bold">${producto.precio.toFixed(2)}</span>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Datos de ejemplo
const productos: ProductoMenu[] = [
  {
    id: 1,
    nombre: "Pasta Carbonara",
    precio: 12.99,
    categoria: "platos-principales",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 2,
    nombre: "Ensalada César",
    precio: 8.99,
    categoria: "entradas",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 3,
    nombre: "Filete de Salmón",
    precio: 18.99,
    categoria: "platos-principales",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 4,
    nombre: "Postre del Chef",
    precio: 7.99,
    categoria: "postres",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 5,
    nombre: "Paella de Mariscos",
    precio: 24.99,
    categoria: "platos-principales",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 6,
    nombre: "Vino Tinto Reserva",
    precio: 29.99,
    categoria: "vinos",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 7,
    nombre: "Mojito",
    precio: 8.99,
    categoria: "bebidas",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 8,
    nombre: "Limonada Casera",
    precio: 3.99,
    categoria: "bebidas",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 9,
    nombre: "Bruschetta",
    precio: 6.99,
    categoria: "entradas",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 10,
    nombre: "Tiramisú",
    precio: 6.99,
    categoria: "postres",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 11,
    nombre: "Risotto de Champiñones",
    precio: 14.99,
    categoria: "platos-principales",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 12,
    nombre: "Agua Mineral",
    precio: 2.5,
    categoria: "bebidas",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 13,
    nombre: "Vino Blanco",
    precio: 24.99,
    categoria: "vinos",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 14,
    nombre: "Helado de Vainilla",
    precio: 4.99,
    categoria: "postres",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 15,
    nombre: "Calamares a la Romana",
    precio: 9.99,
    categoria: "entradas",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
  {
    id: 16,
    nombre: "Hamburguesa Gourmet",
    precio: 15.99,
    categoria: "platos-principales",
    imagen: "/placeholder.svg?height=100&width=200",
    disponible: true,
  },
]
