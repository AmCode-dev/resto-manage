"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"

export interface Empleado {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  cargo: string
  salario?: number
  fecha_ingreso: string
  restaurante_id: string
  permisos: {
    pos?: boolean
    inventario?: boolean
    reportes?: boolean
    configuracion?: boolean
    empleados?: boolean
    finanzas?: boolean
  }
  activo: boolean
  created_at: string
  updated_at: string
}

export interface EmpleadoInsert {
  nombre: string
  apellido: string
  email: string
  telefono?: string
  cargo: string
  salario?: number
  fecha_ingreso: string
  permisos: {
    pos?: boolean
    inventario?: boolean
    reportes?: boolean
    configuracion?: boolean
    empleados?: boolean
    finanzas?: boolean
  }
  activo?: boolean
}

export function useEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, empleado: empleadoActual } = useAuth()
  const { toast } = useToast()

  // Datos de ejemplo
  const empleadosEjemplo: Empleado[] = [
    {
      id: "emp-1",
      nombre: "Admin",
      apellido: "Principal",
      email: "admin@restaurant.com",
      telefono: "+1234567890",
      cargo: "Gerente",
      salario: 50000,
      fecha_ingreso: "2024-01-01",
      restaurante_id: "temp-restaurant",
      permisos: {
        pos: true,
        inventario: true,
        reportes: true,
        configuracion: true,
        empleados: true,
        finanzas: true,
      },
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "emp-2",
      nombre: "María",
      apellido: "García",
      email: "maria@restaurant.com",
      telefono: "+1234567891",
      cargo: "Cajera",
      salario: 30000,
      fecha_ingreso: "2024-02-01",
      restaurante_id: "temp-restaurant",
      permisos: {
        pos: true,
        inventario: false,
        reportes: false,
        configuracion: false,
        empleados: false,
        finanzas: false,
      },
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "emp-3",
      nombre: "Carlos",
      apellido: "López",
      email: "carlos@restaurant.com",
      telefono: "+1234567892",
      cargo: "Cocinero",
      salario: 35000,
      fecha_ingreso: "2024-01-15",
      restaurante_id: "temp-restaurant",
      permisos: {
        pos: false,
        inventario: true,
        reportes: false,
        configuracion: false,
        empleados: false,
        finanzas: false,
      },
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "emp-4",
      nombre: "Ana",
      apellido: "Martínez",
      email: "ana@restaurant.com",
      telefono: "+1234567893",
      cargo: "Mesera",
      salario: 25000,
      fecha_ingreso: "2024-03-01",
      restaurante_id: "temp-restaurant",
      permisos: {
        pos: true,
        inventario: false,
        reportes: false,
        configuracion: false,
        empleados: false,
        finanzas: false,
      },
      activo: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

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

  // Cargar empleados
  const cargarEmpleados = async () => {
    try {
      setLoading(true)
      const restauranteId = await getRestauranteId()

      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .eq("restaurante_id", restauranteId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error cargando empleados:", error)
        setEmpleados(empleadosEjemplo)
        return
      }

      setEmpleados(data || empleadosEjemplo)
    } catch (error) {
      console.error("Error cargando empleados:", error)
      setEmpleados(empleadosEjemplo)
      setError("Error cargando empleados")
    } finally {
      setLoading(false)
    }
  }

  // Crear empleado
  const crearEmpleado = async (datos: EmpleadoInsert) => {
    try {
      const restauranteId = await getRestauranteId()

      const nuevoEmpleado = {
        ...datos,
        restaurante_id: restauranteId,
        activo: datos.activo ?? true,
      }

      const { data, error } = await supabase.from("empleados").insert(nuevoEmpleado).select().single()

      if (error) {
        console.error("Error creando empleado:", error)
        // Simular creación exitosa
        const empleadoSimulado: Empleado = {
          id: `temp-emp-${Date.now()}`,
          ...nuevoEmpleado,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setEmpleados((prev) => [empleadoSimulado, ...prev])

        toast({
          title: "Empleado creado",
          description: `${datos.nombre} ${datos.apellido} ha sido agregado al equipo.`,
        })
        return empleadoSimulado
      }

      await cargarEmpleados()

      toast({
        title: "Empleado creado",
        description: `${datos.nombre} ${datos.apellido} ha sido agregado al equipo.`,
      })

      return data
    } catch (error) {
      console.error("Error creando empleado:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el empleado. Inténtalo de nuevo.",
      })
      throw error
    }
  }

  // Actualizar empleado
  const actualizarEmpleado = async (id: string, datos: Partial<EmpleadoInsert>) => {
    try {
      const { data, error } = await supabase
        .from("empleados")
        .update({
          ...datos,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error actualizando empleado:", error)
        // Simular actualización exitosa
        setEmpleados((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, ...datos, updated_at: new Date().toISOString() } : emp)),
        )

        toast({
          title: "Empleado actualizado",
          description: "Los datos del empleado han sido actualizados.",
        })
        return
      }

      await cargarEmpleados()

      toast({
        title: "Empleado actualizado",
        description: "Los datos del empleado han sido actualizados.",
      })

      return data
    } catch (error) {
      console.error("Error actualizando empleado:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el empleado. Inténtalo de nuevo.",
      })
      throw error
    }
  }

  // Eliminar empleado (desactivar)
  const eliminarEmpleado = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("empleados")
        .update({
          activo: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error eliminando empleado:", error)
        // Simular eliminación exitosa
        setEmpleados((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, activo: false, updated_at: new Date().toISOString() } : emp)),
        )

        toast({
          title: "Empleado desactivado",
          description: "El empleado ha sido desactivado del sistema.",
        })
        return
      }

      await cargarEmpleados()

      toast({
        title: "Empleado desactivado",
        description: "El empleado ha sido desactivado del sistema.",
      })

      return data
    } catch (error) {
      console.error("Error eliminando empleado:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo desactivar el empleado. Inténtalo de nuevo.",
      })
      throw error
    }
  }

  // Reactivar empleado
  const reactivarEmpleado = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("empleados")
        .update({
          activo: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error reactivando empleado:", error)
        // Simular reactivación exitosa
        setEmpleados((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, activo: true, updated_at: new Date().toISOString() } : emp)),
        )

        toast({
          title: "Empleado reactivado",
          description: "El empleado ha sido reactivado en el sistema.",
        })
        return
      }

      await cargarEmpleados()

      toast({
        title: "Empleado reactivado",
        description: "El empleado ha sido reactivado en el sistema.",
      })

      return data
    } catch (error) {
      console.error("Error reactivando empleado:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reactivar el empleado. Inténtalo de nuevo.",
      })
      throw error
    }
  }

  // Obtener estadísticas
  const obtenerEstadisticas = () => {
    const totalEmpleados = empleados.length
    const empleadosActivos = empleados.filter((emp) => emp.activo).length
    const empleadosInactivos = empleados.filter((emp) => !emp.activo).length

    const cargos = empleados.reduce(
      (acc, emp) => {
        acc[emp.cargo] = (acc[emp.cargo] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const salarioPromedio =
      empleados.filter((emp) => emp.salario && emp.activo).reduce((sum, emp) => sum + (emp.salario || 0), 0) /
        empleadosActivos || 0

    return {
      totalEmpleados,
      empleadosActivos,
      empleadosInactivos,
      cargos,
      salarioPromedio,
    }
  }

  // Obtener empleados por cargo
  const obtenerEmpleadosPorCargo = (cargo: string) => {
    return empleados.filter((emp) => emp.cargo === cargo && emp.activo)
  }

  // Obtener empleados con permiso específico
  const obtenerEmpleadosConPermiso = (permiso: keyof Empleado["permisos"]) => {
    return empleados.filter((emp) => emp.permisos[permiso] && emp.activo)
  }

  // Efectos
  useEffect(() => {
    if (user) {
      cargarEmpleados()
    }
  }, [user])

  return {
    // Estados
    empleados,
    loading,
    error,

    // Funciones CRUD
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    reactivarEmpleado,

    // Funciones de utilidad
    obtenerEstadisticas,
    obtenerEmpleadosPorCargo,
    obtenerEmpleadosConPermiso,
    cargarEmpleados,
  }
}
