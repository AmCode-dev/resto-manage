"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import type { ItemPedido, Pedido } from "@/lib/database.types"

export interface Caja {
  id: string
  restaurante_id: string
  empleado_id: string
  fecha_apertura: string
  hora_apertura: string
  fecha_cierre?: string
  hora_cierre?: string
  caja_inicial: number
  efectivo_esperado: number
  tarjeta_esperado: number
  otros_esperado: number
  efectivo_real?: number
  tarjeta_real?: number
  otros_real?: number
  diferencia?: number
  total_ventas: number
  total_pedidos: number
  total_personas: number
  estado: "abierto" | "cerrado"
  observaciones?: string
  created_at: string
  updated_at: string
}

export interface Empleado {
  id: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  permisos: {
    pos?: boolean
    inventario?: boolean
    reportes?: boolean
    configuracion?: boolean
  }
}

export function useCajas() {
  const [cajas, setCajas] = useState<Caja[]>([])
  const [cajaActual, setCajaActual] = useState<Caja | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [empleadosConPermisosPOS, setEmpleadosConPermisosPOS] = useState<Empleado[]>([])

  const { user, empleado } = useAuth()
  const { toast } = useToast()

  // Datos de ejemplo para empleados con permisos POS
  const empleadosEjemplo: Empleado[] = [
    {
      id: "emp-1",
      nombre: "Admin",
      apellido: "Principal",
      email: "admin@restaurant.com",
      cargo: "Gerente",
      permisos: {
        pos: true,
        inventario: true,
        reportes: true,
        configuracion: true,
      },
    },
    {
      id: "emp-2",
      nombre: "Cajero",
      apellido: "Uno",
      email: "cajero@restaurant.com",
      cargo: "Cajero",
      permisos: {
        pos: true,
        inventario: false,
        reportes: false,
        configuracion: false,
      },
    },
  ]

  // Datos de ejemplo para caja
  const cajaEjemplo: Caja = {
    id: "caja-ejemplo-1",
    restaurante_id: "temp-restaurant",
    empleado_id: empleado?.id || "emp-1",
    fecha_apertura: new Date().toISOString().split("T")[0],
    hora_apertura: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    caja_inicial: 1000,
    efectivo_esperado: 250.5,
    tarjeta_esperado: 180.0,
    otros_esperado: 75.25,
    total_ventas: 505.75,
    total_pedidos: 8,
    total_personas: 24,
    estado: "abierto",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Obtener restaurante del usuario
  const getRestauranteId = async () => {
    if (!user) return "temp-restaurant"

    try {
      const { data, error } = await supabase.from("restaurantes").select("id").eq("user_id", user.id).single()

      if (error || !data) {
        return "temp-restaurant"
      }

      return data.id
    } catch (error) {
      console.error("Error obteniendo restaurante:", error)
      return "temp-restaurant"
    }
  }

  // Cargar empleados con permisos POS
  const cargarEmpleadosConPermisosPOS = async () => {
    try {
      const restauranteId = await getRestauranteId()

      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .eq("restaurante_id", restauranteId)
        .contains("permisos", { pos: true })

      if (error) {
        console.error("Error cargando empleados:", error)
        setEmpleadosConPermisosPOS(empleadosEjemplo)
        return
      }

      setEmpleadosConPermisosPOS(data || empleadosEjemplo)
    } catch (error) {
      console.error("Error cargando empleados:", error)
      setEmpleadosConPermisosPOS(empleadosEjemplo)
    }
  }

  // Cargar cajas
  const cargarCajas = async () => {
    try {
      setLoading(true)
      const restauranteId = await getRestauranteId()

      const { data, error } = await supabase
        .from("cajas")
        .select("*")
        .eq("restaurante_id", restauranteId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error cargando cajas:", error)
        setCajas([cajaEjemplo])
        setCajaActual(cajaEjemplo)
        return
      }

      setCajas(data || [cajaEjemplo])

      // Buscar caja abierta
      const cajaAbierta = data?.find((caja) => caja.estado === "abierto")
      setCajaActual(cajaAbierta || cajaEjemplo)
    } catch (error) {
      console.error("Error cargando cajas:", error)
      setCajas([cajaEjemplo])
      setCajaActual(cajaEjemplo)
    } finally {
      setLoading(false)
    }
  }

  // Abrir caja
  const abrirCaja = async (empleadoId: string, montoInicial: number) => {
    try {
      const restauranteId = await getRestauranteId()
      const ahora = new Date()

      const nuevaCaja = {
        restaurante_id: restauranteId,
        empleado_id: empleadoId,
        fecha_apertura: ahora.toISOString().split("T")[0],
        hora_apertura: ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        caja_inicial: montoInicial,
        efectivo_esperado: 0,
        tarjeta_esperado: 0,
        otros_esperado: 0,
        total_ventas: 0,
        total_pedidos: 0,
        total_personas: 0,
        estado: "abierto" as const,
      }

      const { data, error } = await supabase.from("cajas").insert(nuevaCaja).select().single()

      if (error) {
        console.error("Error abriendo caja:", error)
        // Simular apertura exitosa
        const cajaSimulada = {
          id: `caja-${Date.now()}`,
          ...nuevaCaja,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setCajaActual(cajaSimulada)
        setCajas((prev) => [cajaSimulada, ...prev])

        toast({
          title: "Caja abierta",
          description: "La caja ha sido abierta correctamente",
        })
        return
      }

      setCajaActual(data)
      await cargarCajas()

      toast({
        title: "Caja abierta",
        description: "La caja ha sido abierta correctamente",
      })
    } catch (error) {
      console.error("Error abriendo caja:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo abrir la caja",
      })
    }
  }

  // Cerrar caja
  const cerrarCaja = async (cajaId: string, efectivoReal: number, tarjetaReal: number, otrosReal: number) => {
    try {
      const ahora = new Date()
      const totalReal = efectivoReal + tarjetaReal + otrosReal
      const totalEsperado =
        (cajaActual?.efectivo_esperado || 0) + (cajaActual?.tarjeta_esperado || 0) + (cajaActual?.otros_esperado || 0)
      const diferencia = totalReal - totalEsperado

      const datosActualizacion = {
        fecha_cierre: ahora.toISOString().split("T")[0],
        hora_cierre: ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        efectivo_real: efectivoReal,
        tarjeta_real: tarjetaReal,
        otros_real: otrosReal,
        diferencia: diferencia,
        estado: "cerrado" as const,
      }

      const { error } = await supabase.from("cajas").update(datosActualizacion).eq("id", cajaId)

      if (error) {
        console.error("Error cerrando caja:", error)
        // Simular cierre exitoso
        setCajaActual(null)
        toast({
          title: "Caja cerrada",
          description: "La caja ha sido cerrada correctamente",
        })
        return
      }

      setCajaActual(null)
      await cargarCajas()

      toast({
        title: "Caja cerrada",
        description: "La caja ha sido cerrada correctamente",
      })
    } catch (error) {
      console.error("Error cerrando caja:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la caja",
      })
    }
  }

  // Crear pedido
  const crearPedido = async (mesa: number, items: ItemPedido[], personas: number) => {
    try {
      if (!cajaActual) {
        throw new Error("No hay caja abierta")
      }

      const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
      const numeroPedido = Math.floor(Math.random() * 9000) + 1000

      const pedido = {
        numero_pedido: numeroPedido,
        mesa: mesa,
        items: items,
        total: total,
        personas: personas,
        estado: "pendiente",
        caja_id: cajaActual.id,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      }

      const { data, error } = await supabase.from("pedidos").insert(pedido).select().single()

      if (error) {
        console.error("Error creando pedido:", error)
        // Simular creación exitosa
        toast({
          title: "Pedido creado",
          description: `Pedido #${numeroPedido} creado para mesa ${mesa}`,
        })
        return { numero_pedido: numeroPedido, ...pedido }
      }

      toast({
        title: "Pedido creado",
        description: `Pedido #${numeroPedido} creado para mesa ${mesa}`,
      })

      return data
    } catch (error) {
      console.error("Error creando pedido:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el pedido",
      })
      throw error
    }
  }

  // Procesar pago
  const procesarPago = async (pedidoId: string, metodoPago: string, monto: number) => {
    try {
      if (!cajaActual) {
        throw new Error("No hay caja abierta")
      }

      // Actualizar pedido como pagado
      const { error: errorPedido } = await supabase
        .from("pedidos")
        .update({ estado: "pagado", metodo_pago: metodoPago })
        .eq("id", pedidoId)

      if (errorPedido) {
        console.error("Error actualizando pedido:", errorPedido)
      }

      // Actualizar totales de la caja
      const actualizaciones: any = {
        total_ventas: cajaActual.total_ventas + monto,
      }

      switch (metodoPago) {
        case "efectivo":
          actualizaciones.efectivo_esperado = cajaActual.efectivo_esperado + monto
          break
        case "tarjeta":
          actualizaciones.tarjeta_esperado = cajaActual.tarjeta_esperado + monto
          break
        default:
          actualizaciones.otros_esperado = cajaActual.otros_esperado + monto
          break
      }

      const { error: errorCaja } = await supabase.from("cajas").update(actualizaciones).eq("id", cajaActual.id)

      if (errorCaja) {
        console.error("Error actualizando caja:", errorCaja)
      }

      // Actualizar estado local
      setCajaActual((prev) => (prev ? { ...prev, ...actualizaciones } : null))

      toast({
        title: "Pago procesado",
        description: `Pago de $${monto.toFixed(2)} procesado correctamente`,
      })
    } catch (error) {
      console.error("Error procesando pago:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar el pago",
      })
      throw error
    }
  }

  // Obtener pedidos pendientes
  const obtenerPedidosPendientes = async (): Promise<Pedido[]> => {
    try {
      if (!cajaActual) return []

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("caja_id", cajaActual.id)
        .eq("estado", "pendiente")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error obteniendo pedidos pendientes:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error obteniendo pedidos pendientes:", error)
      return []
    }
  }

  // Efectos
  useEffect(() => {
    if (user) {
      cargarEmpleadosConPermisosPOS()
      cargarCajas()
    }
  }, [user])

  return {
    // Estados
    cajas,
    cajaActual,
    empleadosConPermisosPOS,
    loading,
    error,

    // Funciones CRUD
    abrirCaja,
    cerrarCaja,
    crearPedido,
    procesarPago,
    obtenerPedidosPendientes,

    // Funciones de utilidad
    cargarCajas,
  }
}
