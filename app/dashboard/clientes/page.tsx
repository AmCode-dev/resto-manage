"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Plus,
  MoreHorizontal,
  Gift,
  Calendar,
  User,
  Phone,
  Mail,
  Star,
  Clock,
  DollarSign,
  Filter,
  Tag,
  Percent,
  Award,
  Utensils,
  Check,
  Edit,
  Trash2,
  FileText,
  Send,
  Download,
  BarChart,
  Users,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

// Tipos
interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  fechaRegistro: string
  codigo: string
  visitas: number
  totalGastado: number
  ultimaVisita: string
  nivel: "Bronce" | "Plata" | "Oro" | "Platino"
  notas: string
  estado: "activo" | "inactivo"
  descuentoPersonalizado?: number
  cumpleanos?: string
  historialVisitas: HistorialVisita[]
  historialRecompensas: Recompensa[]
}

interface HistorialVisita {
  id: string
  fecha: string
  hora: string
  monto: number
  mesa: number
  personas: number
  pedidos: ItemPedido[]
  metodoPago: string
  propina?: number
  notas?: string
}

interface ItemPedido {
  id: number
  nombre: string
  precio: number
  cantidad: number
  categoria: string
}

interface Recompensa {
  id: string
  tipo: "cena_gratis" | "descuento" | "regalo" | "otro"
  descripcion: string
  valor: number
  fechaEmision: string
  fechaVencimiento: string
  fechaUso?: string
  estado: "disponible" | "usado" | "vencido"
}

interface FiltrosCliente {
  busqueda: string
  nivel: string
  estado: string
  gastoMinimo: string
  gastoMaximo: string
  visitasMinimas: string
  ultimaVisitaDesde: string
  ultimaVisitaHasta: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [dialogoNuevoCliente, setDialogoNuevoCliente] = useState(false)
  const [dialogoDetalleCliente, setDialogoDetalleCliente] = useState(false)
  const [dialogoNuevaVisita, setDialogoNuevaVisita] = useState(false)
  const [dialogoNuevaRecompensa, setDialogoNuevaRecompensa] = useState(false)
  const [dialogoFiltros, setDialogoFiltros] = useState(false)
  const [vistaActiva, setVistaActiva] = useState<"todos" | "frecuentes" | "recompensas">("todos")

  // Estados para nuevo cliente
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoApellido, setNuevoApellido] = useState("")
  const [nuevoEmail, setNuevoEmail] = useState("")
  const [nuevoTelefono, setNuevoTelefono] = useState("")
  const [nuevoCumpleanos, setNuevoCumpleanos] = useState("")
  const [nuevoNotas, setNuevoNotas] = useState("")

  // Estados para nueva visita
  const [nuevaVisitaFecha, setNuevaVisitaFecha] = useState("")
  const [nuevaVisitaHora, setNuevaVisitaHora] = useState("")
  const [nuevaVisitaMonto, setNuevaVisitaMonto] = useState("")
  const [nuevaVisitaMesa, setNuevaVisitaMesa] = useState("")
  const [nuevaVisitaPersonas, setNuevaVisitaPersonas] = useState("")
  const [nuevaVisitaMetodoPago, setNuevaVisitaMetodoPago] = useState("")
  const [nuevaVisitaPropina, setNuevaVisitaPropina] = useState("")
  const [nuevaVisitaNotas, setNuevaVisitaNotas] = useState("")

  // Estados para nueva recompensa
  const [nuevaRecompensaTipo, setNuevaRecompensaTipo] = useState<"cena_gratis" | "descuento" | "regalo" | "otro">(
    "cena_gratis",
  )
  const [nuevaRecompensaDescripcion, setNuevaRecompensaDescripcion] = useState("")
  const [nuevaRecompensaValor, setNuevaRecompensaValor] = useState("")
  const [nuevaRecompensaFechaVencimiento, setNuevaRecompensaFechaVencimiento] = useState("")

  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosCliente>({
    busqueda: "",
    nivel: "",
    estado: "",
    gastoMinimo: "",
    gastoMaximo: "",
    visitasMinimas: "",
    ultimaVisitaDesde: "",
    ultimaVisitaHasta: "",
  })

  const [filtrosAplicados, setFiltrosAplicados] = useState(false)

  const { toast } = useToast()

  // Cargar datos de clientes (simulado)
  useEffect(() => {
    // En una aplicación real, estos datos vendrían de una API
    const clientesMock: Cliente[] = [
      {
        id: "CL001",
        nombre: "María",
        apellido: "González",
        email: "maria.gonzalez@email.com",
        telefono: "555-123-4567",
        fechaRegistro: "2024-01-15",
        codigo: "MG4567",
        visitas: 12,
        totalGastado: 845.75,
        ultimaVisita: "2025-05-15",
        nivel: "Oro",
        notas: "Prefiere mesa junto a la ventana. Alérgica a los mariscos.",
        estado: "activo",
        descuentoPersonalizado: 10,
        cumpleanos: "1985-06-22",
        historialVisitas: [
          {
            id: "V12345",
            fecha: "2025-05-15",
            hora: "20:30",
            monto: 98.5,
            mesa: 7,
            personas: 2,
            pedidos: [
              { id: 1, nombre: "Pasta Carbonara", precio: 15.99, cantidad: 1, categoria: "platos-principales" },
              { id: 2, nombre: "Ensalada César", precio: 8.99, cantidad: 1, categoria: "entradas" },
              { id: 3, nombre: "Vino Tinto", precio: 29.99, cantidad: 1, categoria: "bebidas" },
              { id: 4, nombre: "Tiramisú", precio: 7.99, cantidad: 2, categoria: "postres" },
            ],
            metodoPago: "tarjeta",
            propina: 15.0,
            notas: "Celebración de aniversario",
          },
          {
            id: "V12300",
            fecha: "2025-04-28",
            hora: "13:15",
            monto: 45.75,
            mesa: 3,
            personas: 1,
            pedidos: [
              { id: 5, nombre: "Risotto de Champiñones", precio: 16.99, cantidad: 1, categoria: "platos-principales" },
              { id: 6, nombre: "Agua Mineral", precio: 2.99, cantidad: 1, categoria: "bebidas" },
              { id: 7, nombre: "Cheesecake", precio: 6.99, cantidad: 1, categoria: "postres" },
            ],
            metodoPago: "efectivo",
            propina: 5.0,
          },
          {
            id: "V12250",
            fecha: "2025-04-10",
            hora: "19:45",
            monto: 125.3,
            mesa: 5,
            personas: 4,
            pedidos: [
              { id: 8, nombre: "Pizza Margherita", precio: 14.99, cantidad: 1, categoria: "platos-principales" },
              { id: 9, nombre: "Lasaña", precio: 16.99, cantidad: 1, categoria: "platos-principales" },
              { id: 10, nombre: "Espagueti Bolognese", precio: 15.99, cantidad: 1, categoria: "platos-principales" },
              { id: 11, nombre: "Ravioles", precio: 17.99, cantidad: 1, categoria: "platos-principales" },
              { id: 12, nombre: "Cerveza", precio: 5.99, cantidad: 4, categoria: "bebidas" },
              { id: 13, nombre: "Helado", precio: 5.99, cantidad: 2, categoria: "postres" },
            ],
            metodoPago: "tarjeta",
            propina: 20.0,
          },
        ],
        historialRecompensas: [
          {
            id: "R5001",
            tipo: "cena_gratis",
            descripcion: "Cena para dos personas gratis",
            valor: 100.0,
            fechaEmision: "2025-03-15",
            fechaVencimiento: "2025-06-15",
            fechaUso: "2025-04-10",
            estado: "usado",
          },
          {
            id: "R5002",
            tipo: "descuento",
            descripcion: "15% de descuento en próxima visita",
            valor: 15,
            fechaEmision: "2025-05-15",
            fechaVencimiento: "2025-07-15",
            estado: "disponible",
          },
        ],
      },
      {
        id: "CL002",
        nombre: "Carlos",
        apellido: "Rodríguez",
        email: "carlos.rodriguez@email.com",
        telefono: "555-987-6543",
        fechaRegistro: "2024-02-20",
        codigo: "CR6543",
        visitas: 8,
        totalGastado: 560.25,
        ultimaVisita: "2025-05-10",
        nivel: "Plata",
        notas: "Le gusta la comida picante. Suele pedir vino tinto.",
        estado: "activo",
        cumpleanos: "1978-11-14",
        historialVisitas: [
          {
            id: "V12346",
            fecha: "2025-05-10",
            hora: "21:00",
            monto: 87.25,
            mesa: 4,
            personas: 2,
            pedidos: [
              { id: 14, nombre: "Filete de Res", precio: 24.99, cantidad: 1, categoria: "platos-principales" },
              { id: 15, nombre: "Salmón a la Parrilla", precio: 22.99, cantidad: 1, categoria: "platos-principales" },
              { id: 16, nombre: "Vino Tinto", precio: 29.99, cantidad: 1, categoria: "bebidas" },
            ],
            metodoPago: "tarjeta",
            propina: 15.0,
          },
          {
            id: "V12347",
            fecha: "2025-04-25",
            hora: "20:15",
            monto: 65.5,
            mesa: 6,
            personas: 1,
            pedidos: [
              { id: 17, nombre: "Paella", precio: 28.99, cantidad: 1, categoria: "platos-principales" },
              { id: 18, nombre: "Sangría", precio: 9.99, cantidad: 1, categoria: "bebidas" },
              { id: 19, nombre: "Flan", precio: 6.99, cantidad: 1, categoria: "postres" },
            ],
            metodoPago: "efectivo",
            propina: 10.0,
          },
        ],
        historialRecompensas: [
          {
            id: "R5003",
            tipo: "descuento",
            descripcion: "10% de descuento en próxima visita",
            valor: 10,
            fechaEmision: "2025-04-25",
            fechaVencimiento: "2025-06-25",
            estado: "disponible",
          },
        ],
      },
      {
        id: "CL003",
        nombre: "Ana",
        apellido: "Martínez",
        email: "ana.martinez@email.com",
        telefono: "555-456-7890",
        fechaRegistro: "2024-03-05",
        codigo: "AM7890",
        visitas: 5,
        totalGastado: 320.5,
        ultimaVisita: "2025-05-05",
        nivel: "Bronce",
        notas: "Vegetariana. Prefiere mesa tranquila.",
        estado: "activo",
        cumpleanos: "1990-04-30",
        historialVisitas: [
          {
            id: "V12348",
            fecha: "2025-05-05",
            hora: "19:30",
            monto: 55.75,
            mesa: 2,
            personas: 1,
            pedidos: [
              { id: 20, nombre: "Risotto de Verduras", precio: 16.99, cantidad: 1, categoria: "platos-principales" },
              { id: 21, nombre: "Ensalada Mixta", precio: 8.99, cantidad: 1, categoria: "entradas" },
              { id: 22, nombre: "Vino Blanco", precio: 24.99, cantidad: 1, categoria: "bebidas" },
            ],
            metodoPago: "tarjeta",
            propina: 8.0,
          },
        ],
        historialRecompensas: [],
      },
      {
        id: "CL004",
        nombre: "Roberto",
        apellido: "Fernández",
        email: "roberto.fernandez@email.com",
        telefono: "555-789-0123",
        fechaRegistro: "2024-01-10",
        codigo: "RF0123",
        visitas: 15,
        totalGastado: 1250.75,
        ultimaVisita: "2025-05-18",
        nivel: "Platino",
        notas: "Cliente VIP. Empresario, suele traer clientes.",
        estado: "activo",
        descuentoPersonalizado: 15,
        cumpleanos: "1972-08-15",
        historialVisitas: [
          {
            id: "V12349",
            fecha: "2025-05-18",
            hora: "20:45",
            monto: 345.5,
            mesa: 8,
            personas: 6,
            pedidos: [
              { id: 23, nombre: "Parrillada Mixta", precio: 89.99, cantidad: 1, categoria: "platos-principales" },
              { id: 24, nombre: "Tabla de Quesos", precio: 18.99, cantidad: 2, categoria: "entradas" },
              { id: 25, nombre: "Botella Champagne", precio: 79.99, cantidad: 1, categoria: "bebidas" },
              { id: 26, nombre: "Vino Reserva", precio: 59.99, cantidad: 1, categoria: "bebidas" },
              { id: 27, nombre: "Surtido de Postres", precio: 24.99, cantidad: 1, categoria: "postres" },
            ],
            metodoPago: "tarjeta",
            propina: 60.0,
            notas: "Reunión de negocios",
          },
        ],
        historialRecompensas: [
          {
            id: "R5004",
            tipo: "cena_gratis",
            descripcion: "Cena para dos personas gratis",
            valor: 100.0,
            fechaEmision: "2025-04-10",
            fechaVencimiento: "2025-07-10",
            estado: "disponible",
          },
          {
            id: "R5005",
            tipo: "regalo",
            descripcion: "Botella de vino de cortesía",
            valor: 45.0,
            fechaEmision: "2025-03-15",
            fechaVencimiento: "2025-06-15",
            fechaUso: "2025-04-20",
            estado: "usado",
          },
        ],
      },
      {
        id: "CL005",
        nombre: "Laura",
        apellido: "Sánchez",
        email: "laura.sanchez@email.com",
        telefono: "555-234-5678",
        fechaRegistro: "2024-04-15",
        codigo: "LS5678",
        visitas: 3,
        totalGastado: 180.25,
        ultimaVisita: "2025-04-30",
        nivel: "Bronce",
        notas: "Nueva cliente. Interesada en eventos privados.",
        estado: "activo",
        cumpleanos: "1988-12-03",
        historialVisitas: [
          {
            id: "V12350",
            fecha: "2025-04-30",
            hora: "18:30",
            monto: 65.75,
            mesa: 3,
            personas: 2,
            pedidos: [
              { id: 28, nombre: "Pasta al Pesto", precio: 14.99, cantidad: 1, categoria: "platos-principales" },
              { id: 29, nombre: "Pollo a la Parrilla", precio: 16.99, cantidad: 1, categoria: "platos-principales" },
              { id: 30, nombre: "Limonada", precio: 3.99, cantidad: 2, categoria: "bebidas" },
              { id: 31, nombre: "Tarta de Manzana", precio: 6.99, cantidad: 1, categoria: "postres" },
            ],
            metodoPago: "efectivo",
            propina: 10.0,
          },
        ],
        historialRecompensas: [],
      },
      {
        id: "CL006",
        nombre: "Miguel",
        apellido: "López",
        email: "miguel.lopez@email.com",
        telefono: "555-345-6789",
        fechaRegistro: "2023-12-05",
        codigo: "ML6789",
        visitas: 0,
        totalGastado: 0,
        ultimaVisita: "",
        nivel: "Bronce",
        notas: "Registrado pero aún no ha visitado el restaurante.",
        estado: "inactivo",
        cumpleanos: "1983-07-19",
        historialVisitas: [],
        historialRecompensas: [],
      },
    ]

    setClientes(clientesMock)
  }, [])

  // Filtrar clientes según los criterios
  const clientesFiltrados = clientes.filter((cliente) => {
    // Filtro de búsqueda (nombre, apellido, email, teléfono o código)
    const coincideBusqueda =
      filtros.busqueda === "" ||
      cliente.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cliente.email.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cliente.telefono.includes(filtros.busqueda) ||
      cliente.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase())

    // Filtro de nivel
    const coincideNivel = filtros.nivel === "" || cliente.nivel === filtros.nivel

    // Filtro de estado
    const coincideEstado = filtros.estado === "" || cliente.estado === filtros.estado

    // Filtro de gasto mínimo
    const coincideGastoMinimo =
      filtros.gastoMinimo === "" || cliente.totalGastado >= Number.parseFloat(filtros.gastoMinimo)

    // Filtro de gasto máximo
    const coincideGastoMaximo =
      filtros.gastoMaximo === "" || cliente.totalGastado <= Number.parseFloat(filtros.gastoMaximo)

    // Filtro de visitas mínimas
    const coincideVisitasMinimas =
      filtros.visitasMinimas === "" || cliente.visitas >= Number.parseInt(filtros.visitasMinimas)

    // Filtro de última visita desde
    const coincideUltimaVisitaDesde =
      filtros.ultimaVisitaDesde === "" || (cliente.ultimaVisita && cliente.ultimaVisita >= filtros.ultimaVisitaDesde)

    // Filtro de última visita hasta
    const coincideUltimaVisitaHasta =
      filtros.ultimaVisitaHasta === "" || (cliente.ultimaVisita && cliente.ultimaVisita <= filtros.ultimaVisitaHasta)

    return (
      coincideBusqueda &&
      coincideNivel &&
      coincideEstado &&
      coincideGastoMinimo &&
      coincideGastoMaximo &&
      coincideVisitasMinimas &&
      coincideUltimaVisitaDesde &&
      coincideUltimaVisitaHasta
    )
  })

  // Filtrar clientes según la vista activa
  const clientesMostrados = clientesFiltrados.filter((cliente) => {
    if (vistaActiva === "todos") return true
    if (vistaActiva === "frecuentes") return cliente.visitas >= 5
    if (vistaActiva === "recompensas") return cliente.historialRecompensas.some((r) => r.estado === "disponible")
    return true
  })

  // Crear nuevo cliente
  const crearNuevoCliente = () => {
    if (!nuevoNombre || !nuevoApellido || !nuevoEmail || !nuevoTelefono) {
      toast({
        variant: "destructive",
        description: "Por favor complete los campos obligatorios",
        duration: 3000,
      })
      return
    }

    // Generar código único para el cliente (en una app real, esto sería más sofisticado)
    const codigo = `${nuevoNombre.charAt(0)}${nuevoApellido.charAt(0)}${Math.floor(1000 + Math.random() * 9000)}`

    const nuevoCliente: Cliente = {
      id: `CL${Math.floor(100 + Math.random() * 900)}`,
      nombre: nuevoNombre,
      apellido: nuevoApellido,
      email: nuevoEmail,
      telefono: nuevoTelefono,
      fechaRegistro: new Date().toISOString().split("T")[0],
      codigo: codigo,
      visitas: 0,
      totalGastado: 0,
      ultimaVisita: "",
      nivel: "Bronce",
      notas: nuevoNotas,
      estado: "activo",
      cumpleanos: nuevoCumpleanos,
      historialVisitas: [],
      historialRecompensas: [],
    }

    setClientes((prevClientes) => [...prevClientes, nuevoCliente])

    // Limpiar formulario
    setNuevoNombre("")
    setNuevoApellido("")
    setNuevoEmail("")
    setNuevoTelefono("")
    setNuevoCumpleanos("")
    setNuevoNotas("")

    setDialogoNuevoCliente(false)

    toast({
      description: `Cliente ${nuevoNombre} ${nuevoApellido} creado exitosamente`,
      duration: 3000,
    })
  }

  // Registrar nueva visita
  const registrarNuevaVisita = () => {
    if (!clienteSeleccionado) return

    if (
      !nuevaVisitaFecha ||
      !nuevaVisitaHora ||
      !nuevaVisitaMonto ||
      !nuevaVisitaMesa ||
      !nuevaVisitaPersonas ||
      !nuevaVisitaMetodoPago
    ) {
      toast({
        variant: "destructive",
        description: "Por favor complete todos los campos obligatorios",
        duration: 3000,
      })
      return
    }

    const monto = Number.parseFloat(nuevaVisitaMonto)

    // Crear nueva visita
    const nuevaVisita: HistorialVisita = {
      id: `V${Math.floor(10000 + Math.random() * 90000)}`,
      fecha: nuevaVisitaFecha,
      hora: nuevaVisitaHora,
      monto: monto,
      mesa: Number.parseInt(nuevaVisitaMesa),
      personas: Number.parseInt(nuevaVisitaPersonas),
      pedidos: [
        // En una app real, aquí se agregarían los pedidos reales
        { id: 100, nombre: "Pedido ejemplo", precio: monto, cantidad: 1, categoria: "platos-principales" },
      ],
      metodoPago: nuevaVisitaMetodoPago,
      propina: nuevaVisitaPropina ? Number.parseFloat(nuevaVisitaPropina) : undefined,
      notas: nuevaVisitaNotas || undefined,
    }

    // Actualizar cliente
    const clienteActualizado = {
      ...clienteSeleccionado,
      visitas: clienteSeleccionado.visitas + 1,
      totalGastado: clienteSeleccionado.totalGastado + monto,
      ultimaVisita: nuevaVisitaFecha,
      historialVisitas: [nuevaVisita, ...clienteSeleccionado.historialVisitas],
    }

    // Actualizar nivel del cliente basado en visitas o gasto total
    let nuevoNivel = clienteActualizado.nivel
    if (clienteActualizado.visitas >= 15 || clienteActualizado.totalGastado >= 1000) {
      nuevoNivel = "Platino"
    } else if (clienteActualizado.visitas >= 10 || clienteActualizado.totalGastado >= 750) {
      nuevoNivel = "Oro"
    } else if (clienteActualizado.visitas >= 5 || clienteActualizado.totalGastado >= 400) {
      nuevoNivel = "Plata"
    }

    clienteActualizado.nivel = nuevoNivel

    // Verificar si el cliente ha alcanzado 9 visitas para otorgar recompensa
    if (clienteActualizado.visitas % 9 === 0) {
      // Crear recompensa de cena gratis
      const nuevaRecompensa: Recompensa = {
        id: `R${Math.floor(5000 + Math.random() * 5000)}`,
        tipo: "cena_gratis",
        descripcion: "Cena para dos personas gratis",
        valor: 100.0,
        fechaEmision: new Date().toISOString().split("T")[0],
        fechaVencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        estado: "disponible",
      }

      clienteActualizado.historialRecompensas = [nuevaRecompensa, ...clienteActualizado.historialRecompensas]

      toast({
        description: `¡${clienteSeleccionado.nombre} ha ganado una cena para dos gratis!`,
        duration: 5000,
      })
    }

    // Actualizar lista de clientes
    setClientes((prevClientes) => prevClientes.map((c) => (c.id === clienteSeleccionado.id ? clienteActualizado : c)))

    // Actualizar cliente seleccionado
    setClienteSeleccionado(clienteActualizado)

    // Limpiar formulario
    setNuevaVisitaFecha("")
    setNuevaVisitaHora("")
    setNuevaVisitaMonto("")
    setNuevaVisitaMesa("")
    setNuevaVisitaPersonas("")
    setNuevaVisitaMetodoPago("")
    setNuevaVisitaPropina("")
    setNuevaVisitaNotas("")

    setDialogoNuevaVisita(false)

    toast({
      description: `Visita registrada exitosamente para ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
      duration: 3000,
    })
  }

  // Crear nueva recompensa
  const crearNuevaRecompensa = () => {
    if (!clienteSeleccionado) return

    if (
      !nuevaRecompensaTipo ||
      !nuevaRecompensaDescripcion ||
      !nuevaRecompensaValor ||
      !nuevaRecompensaFechaVencimiento
    ) {
      toast({
        variant: "destructive",
        description: "Por favor complete todos los campos obligatorios",
        duration: 3000,
      })
      return
    }

    // Crear nueva recompensa
    const nuevaRecompensa: Recompensa = {
      id: `R${Math.floor(5000 + Math.random() * 5000)}`,
      tipo: nuevaRecompensaTipo,
      descripcion: nuevaRecompensaDescripcion,
      valor: Number.parseFloat(nuevaRecompensaValor),
      fechaEmision: new Date().toISOString().split("T")[0],
      fechaVencimiento: nuevaRecompensaFechaVencimiento,
      estado: "disponible",
    }

    // Actualizar cliente
    const clienteActualizado = {
      ...clienteSeleccionado,
      historialRecompensas: [nuevaRecompensa, ...clienteSeleccionado.historialRecompensas],
    }

    // Actualizar lista de clientes
    setClientes((prevClientes) => prevClientes.map((c) => (c.id === clienteSeleccionado.id ? clienteActualizado : c)))

    // Actualizar cliente seleccionado
    setClienteSeleccionado(clienteActualizado)

    // Limpiar formulario
    setNuevaRecompensaTipo("cena_gratis")
    setNuevaRecompensaDescripcion("")
    setNuevaRecompensaValor("")
    setNuevaRecompensaFechaVencimiento("")

    setDialogoNuevaRecompensa(false)

    toast({
      description: `Recompensa creada exitosamente para ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
      duration: 3000,
    })
  }

  // Aplicar filtros
  const aplicarFiltros = () => {
    setFiltrosAplicados(true)
    setDialogoFiltros(false)

    toast({
      description: "Filtros aplicados correctamente",
      duration: 2000,
    })
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      nivel: "",
      estado: "",
      gastoMinimo: "",
      gastoMaximo: "",
      visitasMinimas: "",
      ultimaVisitaDesde: "",
      ultimaVisitaHasta: "",
    })

    setFiltrosAplicados(false)

    toast({
      description: "Filtros eliminados",
      duration: 2000,
    })
  }

  // Marcar recompensa como usada
  const marcarRecompensaComoUsada = (recompensaId: string) => {
    if (!clienteSeleccionado) return

    // Actualizar estado de la recompensa
    const clienteActualizado = {
      ...clienteSeleccionado,
      historialRecompensas: clienteSeleccionado.historialRecompensas.map((r) =>
        r.id === recompensaId ? { ...r, estado: "usado", fechaUso: new Date().toISOString().split("T")[0] } : r,
      ),
    }

    // Actualizar lista de clientes
    setClientes((prevClientes) => prevClientes.map((c) => (c.id === clienteSeleccionado.id ? clienteActualizado : c)))

    // Actualizar cliente seleccionado
    setClienteSeleccionado(clienteActualizado)

    toast({
      description: "Recompensa marcada como usada",
      duration: 2000,
    })
  }

  // Obtener color de badge según nivel
  const getColorBadgeNivel = (nivel: string) => {
    switch (nivel) {
      case "Bronce":
        return "bg-amber-700 hover:bg-amber-700"
      case "Plata":
        return "bg-slate-400 hover:bg-slate-400"
      case "Oro":
        return "bg-amber-400 hover:bg-amber-400 text-black"
      case "Platino":
        return "bg-gradient-to-r from-purple-400 to-blue-500 hover:from-purple-400 hover:to-blue-500"
      default:
        return ""
    }
  }

  // Obtener icono según nivel
  const getIconoNivel = (nivel: string) => {
    switch (nivel) {
      case "Bronce":
        return <Award className="h-3 w-3" />
      case "Plata":
        return <Award className="h-3 w-3" />
      case "Oro":
        return <Star className="h-3 w-3" />
      case "Platino":
        return <Award className="h-3 w-3" />
      default:
        return null
    }
  }

  // Obtener progreso hacia siguiente nivel
  const getProgresoNivel = (cliente: Cliente) => {
    if (cliente.nivel === "Bronce") {
      // Progreso hacia Plata (5 visitas o $400)
      const progresoVisitas = Math.min((cliente.visitas / 5) * 100, 100)
      const progresoGasto = Math.min((cliente.totalGastado / 400) * 100, 100)
      return Math.max(progresoVisitas, progresoGasto)
    } else if (cliente.nivel === "Plata") {
      // Progreso hacia Oro (10 visitas o $750)
      const progresoVisitas = Math.min(((cliente.visitas - 5) / 5) * 100, 100)
      const progresoGasto = Math.min(((cliente.totalGastado - 400) / 350) * 100, 100)
      return Math.max(progresoVisitas, progresoGasto)
    } else if (cliente.nivel === "Oro") {
      // Progreso hacia Platino (15 visitas o $1000)
      const progresoVisitas = Math.min(((cliente.visitas - 10) / 5) * 100, 100)
      const progresoGasto = Math.min(((cliente.totalGastado - 750) / 250) * 100, 100)
      return Math.max(progresoVisitas, progresoGasto)
    }
    return 100 // Platino ya es el nivel máximo
  }

  // Obtener progreso hacia próxima recompensa
  const getProgresoRecompensa = (cliente: Cliente) => {
    // Calcular progreso hacia la próxima cena gratis (cada 9 visitas)
    const visitasDesdeUltimaRecompensa = cliente.visitas % 9
    return (visitasDesdeUltimaRecompensa / 9) * 100
  }

  // Obtener visitas restantes para próxima recompensa
  const getVisitasRestantesRecompensa = (cliente: Cliente) => {
    const visitasDesdeUltimaRecompensa = cliente.visitas % 9
    return 9 - visitasDesdeUltimaRecompensa
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fidelización de Clientes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogoFiltros(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {filtrosAplicados && (
              <Badge variant="secondary" className="ml-2">
                Activos
              </Badge>
            )}
          </Button>
          <Button onClick={() => setDialogoNuevoCliente(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, teléfono o código..."
          className="flex-1"
          value={filtros.busqueda}
          onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
        />
      </div>

      <Tabs defaultValue="todos" onValueChange={(value) => setVistaActiva(value as any)}>
        <TabsList>
          <TabsTrigger value="todos" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Todos los Clientes
          </TabsTrigger>
          <TabsTrigger value="frecuentes" className="flex items-center">
            <Star className="mr-2 h-4 w-4" />
            Clientes Frecuentes
          </TabsTrigger>
          <TabsTrigger value="recompensas" className="flex items-center">
            <Gift className="mr-2 h-4 w-4" />
            Con Recompensas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Visitas</TableHead>
                    <TableHead>Total Gastado</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No se encontraron clientes con los criterios seleccionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesMostrados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.codigo}</TableCell>
                        <TableCell>
                          {cliente.nombre} {cliente.apellido}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs flex items-center">
                              <Mail className="h-3 w-3 mr-1" /> {cliente.email}
                            </span>
                            <span className="text-xs flex items-center">
                              <Phone className="h-3 w-3 mr-1" /> {cliente.telefono}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getColorBadgeNivel(cliente.nivel)}>
                            {getIconoNivel(cliente.nivel)} {cliente.nivel}
                          </Badge>
                        </TableCell>
                        <TableCell>{cliente.visitas}</TableCell>
                        <TableCell>${cliente.totalGastado.toFixed(2)}</TableCell>
                        <TableCell>
                          {cliente.ultimaVisita ? (
                            <span className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1" /> {cliente.ultimaVisita}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sin visitas</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cliente.estado === "activo" ? "default" : "secondary"}>
                            {cliente.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  setDialogoDetalleCliente(true)
                                }}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  setDialogoNuevaVisita(true)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Registrar visita
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  setDialogoNuevaRecompensa(true)
                                }}
                              >
                                <Gift className="h-4 w-4 mr-2" />
                                Crear recompensa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar cliente
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar cliente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frecuentes" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Visitas</TableHead>
                    <TableHead>Total Gastado</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Próxima Recompensa</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No se encontraron clientes frecuentes
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesMostrados.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.codigo}</TableCell>
                        <TableCell>
                          {cliente.nombre} {cliente.apellido}
                        </TableCell>
                        <TableCell>
                          <Badge className={getColorBadgeNivel(cliente.nivel)}>
                            {getIconoNivel(cliente.nivel)} {cliente.nivel}
                          </Badge>
                        </TableCell>
                        <TableCell>{cliente.visitas}</TableCell>
                        <TableCell>${cliente.totalGastado.toFixed(2)}</TableCell>
                        <TableCell>{cliente.ultimaVisita}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                              <span>{getVisitasRestantesRecompensa(cliente)} visitas más</span>
                              <span>{Math.round(getProgresoRecompensa(cliente))}%</span>
                            </div>
                            <Progress value={getProgresoRecompensa(cliente)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  setDialogoDetalleCliente(true)
                                }}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  setDialogoNuevaVisita(true)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Registrar visita
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  setDialogoNuevaRecompensa(true)
                                }}
                              >
                                <Gift className="h-4 w-4 mr-2" />
                                Crear recompensa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recompensas" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Recompensa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron clientes con recompensas disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientesMostrados.flatMap((cliente) =>
                      cliente.historialRecompensas
                        .filter((r) => r.estado === "disponible")
                        .map((recompensa) => (
                          <TableRow key={`${cliente.id}-${recompensa.id}`}>
                            <TableCell className="font-medium">{cliente.codigo}</TableCell>
                            <TableCell>
                              {cliente.nombre} {cliente.apellido}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {recompensa.tipo === "cena_gratis" && (
                                  <Utensils className="h-4 w-4 mr-2 text-green-500" />
                                )}
                                {recompensa.tipo === "descuento" && <Percent className="h-4 w-4 mr-2 text-blue-500" />}
                                {recompensa.tipo === "regalo" && <Gift className="h-4 w-4 mr-2 text-purple-500" />}
                                {recompensa.tipo === "otro" && <Tag className="h-4 w-4 mr-2 text-orange-500" />}
                                {recompensa.descripcion}
                              </div>
                            </TableCell>
                            <TableCell>
                              {recompensa.tipo === "descuento"
                                ? `${recompensa.valor}%`
                                : `$${recompensa.valor.toFixed(2)}`}
                            </TableCell>
                            <TableCell>{recompensa.fechaEmision}</TableCell>
                            <TableCell>{recompensa.fechaVencimiento}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setClienteSeleccionado(cliente)
                                  marcarRecompensaComoUsada(recompensa.id)
                                }}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Marcar como usada
                              </Button>
                            </TableCell>
                          </TableRow>
                        )),
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear nuevo cliente */}
      <Dialog open={dialogoNuevoCliente} onOpenChange={setDialogoNuevoCliente}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Complete la información para registrar un nuevo cliente en el programa de fidelización.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={nuevoApellido}
                  onChange={(e) => setNuevoApellido(e.target.value)}
                  placeholder="Apellido del cliente"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  placeholder="555-123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cumpleanos">Fecha de Cumpleaños</Label>
              <Input
                id="cumpleanos"
                type="date"
                value={nuevoCumpleanos}
                onChange={(e) => setNuevoCumpleanos(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={nuevoNotas}
                onChange={(e) => setNuevoNotas(e.target.value)}
                placeholder="Preferencias, alergias u otra información relevante"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoNuevoCliente(false)}>
              Cancelar
            </Button>
            <Button onClick={crearNuevoCliente}>Registrar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles de cliente */}
      <Dialog open={dialogoDetalleCliente} onOpenChange={setDialogoDetalleCliente}>
        <DialogContent className="sm:max-w-[800px]">
          {clienteSeleccionado && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                  </DialogTitle>
                  <Badge className={getColorBadgeNivel(clienteSeleccionado.nivel)}>
                    {getIconoNivel(clienteSeleccionado.nivel)} Nivel {clienteSeleccionado.nivel}
                  </Badge>
                </div>
                <DialogDescription>
                  Código: <span className="font-medium">{clienteSeleccionado.codigo}</span> • Registrado:{" "}
                  <span className="font-medium">{clienteSeleccionado.fechaRegistro}</span>
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="visitas">Historial de Visitas</TabsTrigger>
                  <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
                  <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Información de Contacto</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{clienteSeleccionado.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{clienteSeleccionado.telefono}</span>
                          </div>
                          {clienteSeleccionado.cumpleanos && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Cumpleaños: {clienteSeleccionado.cumpleanos}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Programa de Fidelización</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Nivel actual:</span>
                            <Badge className={getColorBadgeNivel(clienteSeleccionado.nivel)}>
                              {clienteSeleccionado.nivel}
                            </Badge>
                          </div>

                          {clienteSeleccionado.nivel !== "Platino" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progreso al siguiente nivel</span>
                                <span>{Math.round(getProgresoNivel(clienteSeleccionado))}%</span>
                              </div>
                              <Progress value={getProgresoNivel(clienteSeleccionado)} className="h-2" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progreso a próxima cena gratis</span>
                              <span>{9 - (clienteSeleccionado.visitas % 9)} visitas más</span>
                            </div>
                            <Progress value={getProgresoRecompensa(clienteSeleccionado)} className="h-2" />
                          </div>

                          {clienteSeleccionado.descuentoPersonalizado && (
                            <div className="flex items-center">
                              <Percent className="h-4 w-4 mr-2 text-blue-500" />
                              <span>Descuento personalizado: {clienteSeleccionado.descuentoPersonalizado}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Resumen de Actividad</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Card className="p-3">
                            <div className="flex flex-col items-center">
                              <Clock className="h-8 w-8 mb-2 text-blue-500" />
                              <span className="text-sm text-muted-foreground">Visitas</span>
                              <span className="text-2xl font-bold">{clienteSeleccionado.visitas}</span>
                            </div>
                          </Card>
                          <Card className="p-3">
                            <div className="flex flex-col items-center">
                              <DollarSign className="h-8 w-8 mb-2 text-green-500" />
                              <span className="text-sm text-muted-foreground">Total Gastado</span>
                              <span className="text-2xl font-bold">${clienteSeleccionado.totalGastado.toFixed(2)}</span>
                            </div>
                          </Card>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Última visita: {clienteSeleccionado.ultimaVisita || "Sin visitas registradas"}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Notas</h3>
                        <Card className="p-3">
                          <p className="text-sm">
                            {clienteSeleccionado.notas || "No hay notas registradas para este cliente."}
                          </p>
                        </Card>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDialogoNuevaVisita(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Visita
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setDialogoNuevaRecompensa(true)
                          }}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Crear Recompensa
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="visitas">
                  <div className="py-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Historial de Visitas</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDialogoNuevaVisita(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Nueva Visita
                      </Button>
                    </div>

                    {clienteSeleccionado.historialVisitas.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No hay visitas registradas para este cliente</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {clienteSeleccionado.historialVisitas.map((visita) => (
                            <Card key={visita.id} className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="font-medium flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {visita.fecha} - {visita.hora}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Users className="h-3 w-3 mr-1" /> {visita.personas} personas • Mesa {visita.mesa}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">${visita.monto.toFixed(2)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {visita.metodoPago === "efectivo"
                                      ? "Efectivo"
                                      : visita.metodoPago === "tarjeta"
                                        ? "Tarjeta"
                                        : visita.metodoPago}
                                    {visita.propina && ` + $${visita.propina.toFixed(2)} propina`}
                                  </div>
                                </div>
                              </div>

                              <Separator className="my-3" />

                              <div>
                                <h4 className="text-sm font-medium mb-2">Pedidos</h4>
                                <div className="space-y-2">
                                  {visita.pedidos.map((pedido, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <div>
                                        {pedido.cantidad}x {pedido.nombre}
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          {pedido.categoria}
                                        </Badge>
                                      </div>
                                      <div>${(pedido.precio * pedido.cantidad).toFixed(2)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {visita.notas && (
                                <div className="mt-3 text-sm">
                                  <span className="font-medium">Notas:</span> {visita.notas}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="recompensas">
                  <div className="py-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Recompensas</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDialogoNuevaRecompensa(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Nueva Recompensa
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Gift className="h-4 w-4 mr-2 text-green-500" />
                          Recompensas Disponibles
                        </h4>

                        {clienteSeleccionado.historialRecompensas.filter((r) => r.estado === "disponible").length ===
                        0 ? (
                          <div className="text-center py-4 text-muted-foreground bg-muted rounded-md">
                            <p>No hay recompensas disponibles actualmente</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {clienteSeleccionado.historialRecompensas
                              .filter((r) => r.estado === "disponible")
                              .map((recompensa) => (
                                <Card key={recompensa.id} className="p-3">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-medium flex items-center">
                                        {recompensa.tipo === "cena_gratis" && (
                                          <Utensils className="h-4 w-4 mr-2 text-green-500" />
                                        )}
                                        {recompensa.tipo === "descuento" && (
                                          <Percent className="h-4 w-4 mr-2 text-blue-500" />
                                        )}
                                        {recompensa.tipo === "regalo" && (
                                          <Gift className="h-4 w-4 mr-2 text-purple-500" />
                                        )}
                                        {recompensa.tipo === "otro" && <Tag className="h-4 w-4 mr-2 text-orange-500" />}
                                        {recompensa.descripcion}
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        Válido hasta: {recompensa.fechaVencimiento}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="font-bold">
                                        {recompensa.tipo === "descuento"
                                          ? `${recompensa.valor}%`
                                          : `$${recompensa.valor.toFixed(2)}`}
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => marcarRecompensaComoUsada(recompensa.id)}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Usar
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          Historial de Recompensas
                        </h4>

                        {clienteSeleccionado.historialRecompensas.filter((r) => r.estado !== "disponible").length ===
                        0 ? (
                          <div className="text-center py-4 text-muted-foreground bg-muted rounded-md">
                            <p>No hay historial de recompensas</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Emisión</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha Uso</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clienteSeleccionado.historialRecompensas
                                .filter((r) => r.estado !== "disponible")
                                .map((recompensa) => (
                                  <TableRow key={recompensa.id}>
                                    <TableCell>{recompensa.descripcion}</TableCell>
                                    <TableCell>
                                      {recompensa.tipo === "descuento"
                                        ? `${recompensa.valor}%`
                                        : `$${recompensa.valor.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell>{recompensa.fechaEmision}</TableCell>
                                    <TableCell>{recompensa.fechaVencimiento}</TableCell>
                                    <TableCell>
                                      <Badge variant={recompensa.estado === "usado" ? "outline" : "secondary"}>
                                        {recompensa.estado === "usado" ? "Usada" : "Vencida"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{recompensa.fechaUso || "-"}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="estadisticas">
                  <div className="py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <CardTitle className="text-lg mb-4 flex items-center">
                          <BarChart className="h-5 w-5 mr-2" />
                          Análisis de Consumo
                        </CardTitle>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Gasto Promedio por Visita</h4>
                            <div className="text-2xl font-bold">
                              $
                              {clienteSeleccionado.visitas > 0
                                ? (clienteSeleccionado.totalGastado / clienteSeleccionado.visitas).toFixed(2)
                                : "0.00"}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Frecuencia de Visitas</h4>
                            <div className="text-lg">
                              {clienteSeleccionado.visitas > 0
                                ? `${(clienteSeleccionado.visitas / 12).toFixed(1)} visitas/mes (aprox.)`
                                : "Sin datos suficientes"}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Personas Promedio por Visita</h4>
                            <div className="text-lg">
                              {clienteSeleccionado.historialVisitas.length > 0
                                ? (
                                    clienteSeleccionado.historialVisitas.reduce((sum, v) => sum + v.personas, 0) /
                                    clienteSeleccionado.historialVisitas.length
                                  ).toFixed(1)
                                : "Sin datos"}
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <CardTitle className="text-lg mb-4 flex items-center">
                          <Utensils className="h-5 w-5 mr-2" />
                          Preferencias
                        </CardTitle>

                        {clienteSeleccionado.historialVisitas.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No hay suficientes datos para mostrar preferencias</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Categorías Más Pedidas</h4>
                              <div className="space-y-2">
                                {/* Aquí se mostrarían estadísticas de categorías preferidas */}
                                <div className="flex justify-between items-center">
                                  <span>Platos Principales</span>
                                  <span className="font-medium">65%</span>
                                </div>
                                <Progress value={65} className="h-2" />

                                <div className="flex justify-between items-center">
                                  <span>Bebidas</span>
                                  <span className="font-medium">20%</span>
                                </div>
                                <Progress value={20} className="h-2" />

                                <div className="flex justify-between items-center">
                                  <span>Postres</span>
                                  <span className="font-medium">15%</span>
                                </div>
                                <Progress value={15} className="h-2" />
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2">Método de Pago Preferido</h4>
                              <div className="text-lg">
                                {clienteSeleccionado.historialVisitas.filter((v) => v.metodoPago === "tarjeta").length >
                                clienteSeleccionado.historialVisitas.filter((v) => v.metodoPago === "efectivo").length
                                  ? "Tarjeta"
                                  : "Efectivo"}
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>

                    <div className="mt-4">
                      <Card className="p-4">
                        <CardTitle className="text-lg mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Reportes
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Historial
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Resumen
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogoDetalleCliente(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para registrar nueva visita */}
      <Dialog open={dialogoNuevaVisita} onOpenChange={setDialogoNuevaVisita}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nueva Visita</DialogTitle>
            <DialogDescription>
              Registre una nueva visita para {clienteSeleccionado?.nombre} {clienteSeleccionado?.apellido}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={nuevaVisitaFecha}
                  onChange={(e) => setNuevaVisitaFecha(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Hora *</Label>
                <Input
                  id="hora"
                  type="time"
                  value={nuevaVisitaHora}
                  onChange={(e) => setNuevaVisitaHora(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mesa">Mesa *</Label>
                <Input
                  id="mesa"
                  type="number"
                  min="1"
                  value={nuevaVisitaMesa}
                  onChange={(e) => setNuevaVisitaMesa(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personas">Personas *</Label>
                <Input
                  id="personas"
                  type="number"
                  min="1"
                  value={nuevaVisitaPersonas}
                  onChange={(e) => setNuevaVisitaPersonas(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Monto Total ($) *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={nuevaVisitaMonto}
                onChange={(e) => setNuevaVisitaMonto(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodoPago">Método de Pago *</Label>
              <Select value={nuevaVisitaMetodoPago} onValueChange={setNuevaVisitaMetodoPago}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="propina">Propina ($)</Label>
              <Input
                id="propina"
                type="number"
                step="0.01"
                min="0"
                value={nuevaVisitaPropina}
                onChange={(e) => setNuevaVisitaPropina(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={nuevaVisitaNotas}
                onChange={(e) => setNuevaVisitaNotas(e.target.value)}
                placeholder="Observaciones o detalles adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoNuevaVisita(false)}>
              Cancelar
            </Button>
            <Button onClick={registrarNuevaVisita}>Registrar Visita</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear nueva recompensa */}
      <Dialog open={dialogoNuevaRecompensa} onOpenChange={setDialogoNuevaRecompensa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Recompensa</DialogTitle>
            <DialogDescription>
              Cree una nueva recompensa para {clienteSeleccionado?.nombre} {clienteSeleccionado?.apellido}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Recompensa *</Label>
              <Select value={nuevaRecompensaTipo} onValueChange={(value) => setNuevaRecompensaTipo(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de recompensa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cena_gratis">
                    <div className="flex items-center">
                      <Utensils className="h-4 w-4 mr-2 text-green-500" />
                      Cena Gratis
                    </div>
                  </SelectItem>
                  <SelectItem value="descuento">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2 text-blue-500" />
                      Descuento
                    </div>
                  </SelectItem>
                  <SelectItem value="regalo">
                    <div className="flex items-center">
                      <Gift className="h-4 w-4 mr-2 text-purple-500" />
                      Regalo
                    </div>
                  </SelectItem>
                  <SelectItem value="otro">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-orange-500" />
                      Otro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input
                id="descripcion"
                value={nuevaRecompensaDescripcion}
                onChange={(e) => setNuevaRecompensaDescripcion(e.target.value)}
                placeholder="Ej: Cena para dos personas gratis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">
                {nuevaRecompensaTipo === "descuento" ? "Porcentaje de Descuento (%)" : "Valor ($)"}
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={nuevaRecompensaValor}
                onChange={(e) => setNuevaRecompensaValor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={nuevaRecompensaFechaVencimiento}
                onChange={(e) => setNuevaRecompensaFechaVencimiento(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoNuevaRecompensa(false)}>
              Cancelar
            </Button>
            <Button onClick={crearNuevaRecompensa}>Crear Recompensa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para filtros avanzados */}
      <Dialog open={dialogoFiltros} onOpenChange={setDialogoFiltros}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Filtros Avanzados</DialogTitle>
            <DialogDescription>Filtre la lista de clientes según diferentes criterios</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nivel">Nivel</Label>
                <Select value={filtros.nivel} onValueChange={(value) => setFiltros({ ...filtros, nivel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los niveles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los niveles</SelectItem>
                    <SelectItem value="Bronce">Bronce</SelectItem>
                    <SelectItem value="Plata">Plata</SelectItem>
                    <SelectItem value="Oro">Oro</SelectItem>
                    <SelectItem value="Platino">Platino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={filtros.estado} onValueChange={(value) => setFiltros({ ...filtros, estado: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gastoMinimo">Gasto Mínimo ($)</Label>
                <Input
                  id="gastoMinimo"
                  type="number"
                  min="0"
                  value={filtros.gastoMinimo}
                  onChange={(e) => setFiltros({ ...filtros, gastoMinimo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastoMaximo">Gasto Máximo ($)</Label>
                <Input
                  id="gastoMaximo"
                  type="number"
                  min="0"
                  value={filtros.gastoMaximo}
                  onChange={(e) => setFiltros({ ...filtros, gastoMaximo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitasMinimas">Visitas Mínimas</Label>
              <Input
                id="visitasMinimas"
                type="number"
                min="0"
                value={filtros.visitasMinimas}
                onChange={(e) => setFiltros({ ...filtros, visitasMinimas: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ultimaVisitaDesde">Última Visita Desde</Label>
                <Input
                  id="ultimaVisitaDesde"
                  type="date"
                  value={filtros.ultimaVisitaDesde}
                  onChange={(e) => setFiltros({ ...filtros, ultimaVisitaDesde: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ultimaVisitaHasta">Última Visita Hasta</Label>
                <Input
                  id="ultimaVisitaHasta"
                  type="date"
                  value={filtros.ultimaVisitaHasta}
                  onChange={(e) => setFiltros({ ...filtros, ultimaVisitaHasta: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
            <Button onClick={aplicarFiltros}>Aplicar Filtros</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
